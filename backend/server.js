// ===========================
// WOW COLLECTION HELPER - BACKEND SERVER
// Powered by Google Gemini API
// ===========================

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const {
    buildMountPrompt,
    buildToyPrompt,
    buildPetPrompt,
    buildDecorPrompt,
} = require('./prompts.js');

// ===========================
// KONFIGURACJA
// ===========================

const app = express();
const PORT = process.env.PORT || 3000;

// TODO: Wklej tutaj swój klucz API od Google Gemini
// Możesz go uzyskać za darmo na: https://ai.google.dev/
// Instrukcja: https://ai.google.dev/gemini-api/docs/api-key
const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

// TODO: Wybierz model – najnowsze dostępne (darmowe):
// - gemini-2.5-flash (szybki, najczęściej wystarczający)
// - gemini-2.5-pro (dokładniejszy, ale wolniejszy)
// - gemini-2.0-flash (stabilny, wciąż darmowy)
const MODEL_NAME = process.env.MODEL_NAME || 'gemini-2.5-flash';

// Inicjalizacja klienta Gemini
let genAI;
try {
    genAI = new GoogleGenerativeAI({ apiKey: API_KEY });
} catch (error) {
    console.error('❌ Błąd inicjalizacji Gemini:', error.message);
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

        // Sprawdź, czy API key jest skonfigurowany
        if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(500).json({
                error: 'API key not configured. Set GEMINI_API_KEY environment variable.',
            });
        }

        // Wybierz builder promptu na podstawie typu
        let prompt;
        switch (type) {
            case 'mount':
                prompt = buildMountPrompt(input);
                break;
            case 'toy':
                prompt = buildToyPrompt(input);
                break;
            case 'pet':
                prompt = buildPetPrompt(input);
                break;
            case 'decor':
                prompt = buildDecorPrompt(input);
                break;
            default:
                return res.status(400).json({ error: 'Invalid type' });
        }

        // Wyślij do Gemini i otrzymaj odpowiedź
        const guide = await callGeminiModel(prompt);

        // Zwróć wynik
        res.json({
            type,
            input,
            guide,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to generate guide. Please try again later.',
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
        // Sprawdzenie klucza API
        if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error(
                'API key not configured. Set GEMINI_API_KEY environment variable. Get key: https://ai.google.dev/'
            );
        }

        if (!genAI) {
            throw new Error('Gemini client not initialized. Check your API key.');
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
