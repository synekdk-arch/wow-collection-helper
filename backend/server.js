// ===========================
// WOW COLLECTION HELPER - BACKEND SERVER
// Powered by Google Gemini API
// ===========================

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // czytaj z .env w bieżącym katalogu
require('dotenv').config({ path: '/etc/secrets/.env' }); // czytaj z /etc/secrets/.env i nadpisz wartości
const { GoogleGenerativeAI } = require('@google/generative-ai');

const {
    buildMountPrompt,
    buildToyPrompt,
    buildPetPrompt,
    buildDecorPrompt,
} = require('./prompts.js');

const {
    fetchItemData,
    extractWowheadItemId
} = require('./dataFetcher.js');

// ===========================
// KONFIGURACJA
// ===========================

const app = express();
const PORT = process.env.PORT || 3000;

// Bezpieczne pobieranie klucza API z zmiennych środowiskowych
// NIGDY nie przechowuj kluczy API bezpośrednio w kodzie!
// Instrukcja uzyskania klucza: https://ai.google.dev/gemini-api/docs/api-key
const API_KEY = process.env.GEMINI_API_KEY;

// Wybór modelu Gemini - dostępne darmowe opcje:
// - gemini-2.5-flash (szybki, najczęściej wystarczający)
// - gemini-2.5-pro (dokładniejszy, ale wolniejszy)
// - gemini-2.0-flash (stabilny, wciąż darmowy)
const MODEL_NAME = process.env.MODEL_NAME || 'gemini-2.5-flash';

// Walidacja konfiguracji przy starcie
if (!API_KEY) {
    console.error(`
╔════════════════════════════════════════════════════════════╗
║                    ⚠️  CRITICAL ERROR ⚠️                   ║
╠════════════════════════════════════════════════════════════╣
║ GEMINI_API_KEY is not set!                                 ║
║                                                             ║
║ For local development:                                     ║
║   1. Copy backend/.env.example to backend/.env            ║
║   2. Add your API key to the .env file                     ║
║                                                             ║
║ For Render.com deployment:                                 ║
║   1. Go to your service settings                           ║
║   2. Add GEMINI_API_KEY in Environment section            ║
║                                                             ║
║ Get your free API key: https://ai.google.dev/             ║
╚════════════════════════════════════════════════════════════╝
    `);
    process.exit(1); // Zatrzymaj serwer jeśli brak klucza
}

// Inicjalizacja klienta Gemini
let genAI;
try {
    genAI = new GoogleGenerativeAI({ apiKey: API_KEY });
    console.log('✅ Gemini API client initialized successfully');
} catch (error) {
    console.error('❌ Błąd inicjalizacji Gemini:', error.message);
    process.exit(1);
}

// ===========================
// MIDDLEWARE
// ===========================

app.use(cors());
app.use(express.json());

// ===========================
// ROUTES
// ===========================

/**
 * POST /api/guide
 * Główny endpoint, który przyjmuje zapytanie i zwraca instrukcję z Gemini
 */
app.post('/api/guide', async (req, res) => {
    try {
        // Pobierz dane z body
        const { type, input } = req.body;

        // Walidacja
        if (!type || !input) {
            return res.status(400).json({
                error: 'Missing required fields: type and input',
            });
        }

        // Walidacja typu
        const validTypes = ['mount', 'toy', 'pet', 'decor'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
            });
        }

        // Fetch additional data from WoW databases
        console.log(`📡 Fetching data for ${type}: ${input}`);
        const itemData = await fetchItemData(input, type);
        console.log('📦 Item data:', JSON.stringify(itemData, null, 2));

        // Enrich the input with fetched data
        let enrichedInput = input;
        if (itemData.sources && itemData.sources.length > 0) {
            const wowheadData = itemData.sources.find(s => s.source === 'wowhead');
            if (wowheadData && wowheadData.id) {
                enrichedInput += ` (Wowhead ID: ${wowheadData.id})`;
            }
        }

        // Wybierz builder promptu na podstawie typu
        let prompt;
        switch (type) {
            case 'mount':
                prompt = buildMountPrompt(enrichedInput);
                break;
            case 'toy':
                prompt = buildToyPrompt(enrichedInput);
                break;
            case 'pet':
                prompt = buildPetPrompt(enrichedInput);
                break;
            case 'decor':
                prompt = buildDecorPrompt(enrichedInput);
                break;
            default:
                return res.status(400).json({ error: 'Invalid type' });
        }

        // Wyślij do Gemini i otrzymaj odpowiedź
        console.log('🤖 Sending to Gemini AI...');
        const guide = await callGeminiModel(prompt);

        // Zwróć wynik z dodatkowymi danymi
        res.json({
            type,
            input,
            guide,
            metadata: {
                itemData: itemData,
                timestamp: new Date().toISOString(),
                model: MODEL_NAME
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to generate guide. Please try again later.',
        });
    }
});

/**
 * GET /
 * Root endpoint - API documentation
 */
app.get('/', (req, res) => {
    res.json({
        name: 'WoW Collection Helper API',
        version: '1.0.0',
        description: 'AI-powered guide generator for World of Warcraft collectibles',
        powered_by: 'Google Gemini AI',
        endpoints: {
            'POST /api/guide': {
                description: 'Generate a guide for a WoW collectible',
                body: {
                    type: 'string (mount|toy|pet|decor)',
                    input: 'string (item name or Wowhead link)'
                },
                example: {
                    type: 'mount',
                    input: 'Invincible'
                }
            },
            'GET /health': {
                description: 'Health check endpoint',
                response: {
                    status: 'OK',
                    model: MODEL_NAME
                }
            },
            'GET /': {
                description: 'This API documentation'
            }
        },
        documentation: 'https://github.com/kozuchowskihubert/wow-collection',
        frontend: 'Open frontend/index.html in your browser to use the application'
    });
});

/**
 * POST /api/validate
 * Validate if we can fetch data for a given item
 */
app.post('/api/validate', async (req, res) => {
    try {
        const { input, type } = req.body;
        
        if (!input) {
            return res.status(400).json({
                error: 'Missing input field',
                valid: false
            });
        }
        
        // Fetch item data
        const itemData = await fetchItemData(input, type || 'unknown');
        
        // Check if data is available
        const hasWowheadData = itemData.sources?.some(s => s.source === 'wowhead' && s.dataAvailable);
        const hasItemId = itemData.sources?.some(s => s.id);
        
        res.json({
            valid: true,
            hasWowheadData,
            hasItemId,
            itemData,
            canProcess: true,
            message: hasItemId ? 'Item ID found - can fetch detailed data' : 'Will use AI search'
        });
        
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
            error: 'Validation failed',
            valid: false,
            message: error.message
        });
    }
});

/**
 * GET /health
 * Health check endpoint (dla hostingu)
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', model: MODEL_NAME });
});

// ===========================
// GEMINI AI INTEGRATION
// ===========================

/**
 * Wysyła prompt do modelu Gemini i zwraca wygenerowaną odpowiedź
 * @param {string} prompt - tekst promptu
 * @returns {Promise<string>} - wygenerowana instrukcja
 */
async function callGeminiModel(prompt) {
    try {
        // Sprawdzenie czy klient Gemini jest zainicjalizowany
        if (!genAI) {
            throw new Error('Gemini client not initialized. Check your API key configuration.');
        }

        // Uzyskaj model
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                temperature: 0.3, // Niska temperatura dla bardziej deterministycznych wyników
                topP: 0.9,
                maxOutputTokens: 1024, // Wystarczy dla instrukcji
            },
        });

        // Wyślij prompt i otrzymaj odpowiedź
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        });

        // Ekstrahuj tekst z odpowiedzi
        const response = result.response;
        const text = response?.text?.();

        if (!text) {
            throw new Error('Empty response from Gemini model');
        }

        return text;
    } catch (error) {
        console.error('Error calling Gemini model:', error);
        throw error;
    }
}

// ===========================
// SERVER STARTUP
// ===========================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║     WoW Collection Helper - Backend Server (Gemini AI)     ║
╠════════════════════════════════════════════════════════════╣
║ 🚀 Server running at: http://localhost:${PORT}
║ 🤖 AI Model: ${MODEL_NAME}
║ 📝 API Endpoint: POST /api/guide
║ 💚 Health Check: GET /health
║ 📖 Docs: https://ai.google.dev/
╚════════════════════════════════════════════════════════════╝
    `);

    // Ostrzeżenie jeśli klucz nie jest skonfigurowany
    if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn(`
⚠️  WARNING: GEMINI_API_KEY not configured!
    Get your free API key here: https://ai.google.dev/
    Set it in .env file: GEMINI_API_KEY=your_key_here
        `);
    }
});

// ===========================
// ERROR HANDLING
// ===========================

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
