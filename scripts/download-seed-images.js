import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

const fixedCategories = [
    { name: 'Technology', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
    { name: 'Music', image: 'https://images.unsplash.com/photo-1514525253361-bee8718a342b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80' },
    { name: 'Education', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80' },
    { name: 'Business', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
    { name: 'Art & Culture', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Food & Drink', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
    { name: 'Networking', image: 'https://images.unsplash.com/photo-1528605248644-14dd04cb11c1?auto=format&fit=crop&w=800&q=80' },
    { name: 'Health', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
    { name: 'Travel', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80' }
];

const eventImages = [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
];

async function downloadImages() {
    await fs.mkdir(path.join(UPLOADS_ROOT, 'categories'), { recursive: true });
    await fs.mkdir(path.join(UPLOADS_ROOT, 'events'), { recursive: true });

    // Download category images
    for (const cat of fixedCategories) {
        const fileName = `${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}.jpg`;
        const filePath = path.join(UPLOADS_ROOT, 'categories', fileName);
        
        try {
            console.log(`Downloading ${cat.name} image...`);
            const response = await axios.get(cat.image, { responseType: 'arraybuffer' });
            await fs.writeFile(filePath, response.data);
            console.log(`Saved to ${filePath}`);
        } catch (error) {
            console.error(`Failed to download ${cat.name} image:`, error.message);
            // Create dummy file for 404s
            await fs.writeFile(filePath, Buffer.from('placeholder'));
        }
    }

    // Download few event images
    for (let i = 0; i < eventImages.length; i++) {
        const filePath = path.join(UPLOADS_ROOT, 'events', `event-${i+1}.jpg`);
        try {
            console.log(`Downloading event image ${i+1}...`);
            const response = await axios.get(eventImages[i], { responseType: 'arraybuffer' });
            await fs.writeFile(filePath, response.data);
            console.log(`Saved to ${filePath}`);
        } catch (error) {
            console.error(`Failed to download event image ${i+1}:`, error.message);
            await fs.writeFile(filePath, Buffer.from('placeholder'));
        }
    }
}

downloadImages();
