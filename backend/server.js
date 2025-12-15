// ===========================
// WOW COLLECTION HELPER - BACKEND SERVER
// ===========================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// TODO: Ustaw zmienną środowiskową PERPLEXITY_API_KEY w pliku .env lub w panelu hostingu
// Przykład:
// export PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
const API_KEY = process.env.PERPLEXITY_API_KEY || 'YOUR_API_KEY_HERE';

// TODO: Sprawdź dokumentację Perplexity API i wybierz odpowiedni model
// Przykładowe modele: "pplx-7b-online", "pplx-70b-online", "pplx-8x7b-online"
const MODEL_NAME = process.env.MODEL_NAME || 'pplx-7b-online';

// TODO: Sprawdź aktualny endpoint API w dokumentacji Perplexity
// Typowo: https://api.perplexity.ai/chat/completions
const API_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

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
 * Główny endpoint, który przyjmuje zapytanie i zwraca instrukcję
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

        // Wyślij do AI i otrzymaj odpowiedź
        const guide = await callAiModel(prompt);

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
 * Health check endpoint (opcjonalnie dla hostingu)
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// ===========================
// AI INTEGRATION
// ===========================

/**
 * Wyśle prompt do modelu AI i zwróci wygenerowaną odpowiedź
 * @param {string} prompt - tekst promptu
 * @returns {Promise<string>} - wygenerowana instrukcja
 */
async function callAiModel(prompt) {
    // Sprawdzenie klucza API
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error(
            'API key not configured. Set PERPLEXITY_API_KEY environment variable.'
        );
    }

    try {
        // Przygotuj payload do wysłania do API
        const payload = {
            model: MODEL_NAME,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3, // Niska temperatura dla bardziej deterministycznych wyników
            top_p: 0.9,
            return_citations: false, // Nie chcemy cytacji w odpowiedzi
        };

        // Wyślij żądanie do API Perplexity
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Sprawdź, czy odpowiedź jest OK
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `AI API error: ${response.status} - ${JSON.stringify(errorData)}`
            );
        }

        // Parsuj odpowiedź
        const data = await response.json();

        // Ekstrahuj tekst z odpowiedzi
        // Struktura Perplexity API: { choices: [ { message: { content: "..." } } ] }
        const guide = data.choices?.[0]?.message?.content || '';

        if (!guide) {
            throw new Error('Empty response from AI model');
        }

        return guide;
    } catch (error) {
        console.error('Error calling AI model:', error);
        throw error;
    }
}

// ===========================
// SERVER STARTUP
// ===========================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          WoW Collection Helper - Backend Server             ║
╠════════════════════════════════════════════════════════════╣
║ 🚀 Server running at: http://localhost:${PORT}
║ 📝 API Endpoint: POST /api/guide
║ 💚 Health Check: GET /health
╚════════════════════════════════════════════════════════════╝
    `);
});

// ===========================
// ERROR HANDLING
// ===========================

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
