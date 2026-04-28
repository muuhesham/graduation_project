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
        const input = message.toLowerCase();
        const matches = faqs.filter((f) =>
            f.keywords.some((k) => {
                const regex = new RegExp(`(\\s|^)${k.toLowerCase()}(\\s|$|[.!?,])`, 'i');
                return regex.test(input);
            })
        );

        if (matches.length > 0) {
            matches.sort((a, b) => {
                const longestK_A = a.keywords
                    .filter((k) =>
                        new RegExp(`(\\s|^)${k.toLowerCase()}(\\s|$|[.!?,])`, 'i').test(input)
                    )
                    .sort((k1, k2) => k2.length - k1.length)[0].length;

                const longestK_B = b.keywords
                    .filter((k) =>
                        new RegExp(`(\\s|^)${k.toLowerCase()}(\\s|$|[.!?,])`, 'i').test(input)
                    )
                    .sort((k1, k2) => k2.length - k1.length)[0].length;

                return longestK_B - longestK_A;
            });

            return matches[0].a;
        }

        const systemPrompt = await chatbotService.generateContext({ userId });
        const response = await openai.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
            ],
            max_tokens: 150,
            temperature: 0.1,
        });

        return response.choices[0].message.content;
    },

    async generateContext({ userId }) {
        const [userData, events] = await Promise.all([
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
