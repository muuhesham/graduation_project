import { prisma as prismaClient } from '../config/db.js';
import OpenAI from 'openai';
import { AI_API_KEY } from './../config/env.js';
import { getSystemPrompt } from '../constants/prompts/prompt.js';
import faqs from '../constants/json/faqs.json' with { type: 'json' };

const openai = new OpenAI({
    apiKey: AI_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

const chatbotService = {
    async handleChat({ message, userId }) {
        const cleanText = (text) => {
            return text
                .toLowerCase()
                .replace(/[أإآ]/g, 'ا') 
                .replace(/[ة]/g, 'ه') 
                .replace(/[؟?.!,]/g, '') 
                .trim()
                .split(/\s+/);
        };
        const input = cleanText(message);
        const matches = faqs.map((f) => {
            const allKeywordsWords = new Set();

            f.keywords.forEach((k) => {
                const keywordWords = cleanText(k); 
                keywordWords.forEach((word) => allKeywordsWords.add(word));
            });

            const matchCount = input.filter((word) => allKeywordsWords.has(word)).length;

            return { ...f, score: matchCount };
        });

        const bestMatch = matches.sort((a, b) => b.score - a.score)[0];

        if (bestMatch && bestMatch.score >= 2) {
            return bestMatch.a;
        }

        try {
            const systemPrompt = await chatbotService.generateContext({ userId });
            const response = await openai.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                max_tokens: 300,
                temperature: 0.1,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('[ChatbotService] AI Error:', error.message);
            throw error;
        }
    },

    async generateContext({ userId }) {
        let userData = null;
        let events = [];

        if(userId) {
            const [userDataResult, eventsResult] = await Promise.all([
                await prismaClient.user.findUnique({
                    where: { id: userId },
                    select: {
                        name: true,
                        email: true,
                        wallet: true,
                        location: true,
                        languagePreference: true,
                        role: true,
                        isVerified: true,
                    },
                }),
    
                await prismaClient.event.findMany({
                    where: { deletedAt: null },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        venue: { select: { name: true, city: true, address: true } },
                        ticketTypes: { select: { name: true, price: true } },
                        category: { select: { name: true } },
                        eventSessions: true,
                        eventRules: true,
                    },
                }),
            ]);
            userData = userDataResult;
            events = eventsResult;
        } else {
            events = await prismaClient.event.findMany({
                    where: { deletedAt: null },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        venue: { select: { name: true, city: true, address: true } },
                        ticketTypes: { select: { name: true, price: true } },
                        category: { select: { name: true } },
                        eventSessions: true,
                        eventRules: true,
                    },
                });
        }

        const formattedEvents = events.map((event) => {
            const prices = event.ticketTypes.map((t) => `${t.name}: ${t.price} ج.م`).join(' - ');
            const sessions = event.eventSessions
                .map((s) =>
                    new Date(s.startDate).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })
                )
                .join(' | ');
            const rules = event.eventRules.map((r) => r.rule).join(' - ');

            return `
                اسم الفعالية: ${event.title}
                المكان: ${event.venue?.name} (${event.venue?.city || ''})
                الأسعار: ${prices}
                التصنيف: ${event.category?.name}
                الوصف: ${event.description.substring(0, 100)}...
                المواعيد: ${sessions}
                القوانين: ${rules}
                `.trim();
        });
        const formattedUser = userData
            ? `
            - الاسم: ${userData.name}
            - النوع: ${userData.gender || 'غير محدد'}
            - الرصيد الحالي: ${userData.wallet} جنيه مصري
            - الموقع: ${userData.location || 'غير محدد'}
            - اللغة المفضلة: ${userData.languagePreference}
            - الدور في المنصة: ${userData.role === 'organizer' ? 'منظم فعاليات' : 'مستخدم عادي'}
            - حالة الحساب: ${userData.isVerified ? 'موثق' : 'غير موثق'}`.trim()
            : 'غير مسجل حاليا';

        return getSystemPrompt({
            eventsData:
                formattedEvents.length > 0
                    ? formattedEvents.join('\n\n')
                    : 'لا يوجد فعاليات متاحة حالياً.',
            userData: formattedUser,
        });
    },
};

export default chatbotService;
