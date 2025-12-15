// ===========================
// WOW COLLECTION HELPER - FRONTEND
// ===========================

// TODO: Zamień poniższy URL na adres Twojego backendu
// Przykłady:
// - Lokalnie podczas developmentu: http://localhost:3000/api/guide
// - Po wystawieniu na Render/Railway: https://twoj-backend.render.com/api/guide
const API_URL = 'http://localhost:3000/api/guide';

// ===========================
// DOM ELEMENTS
// ===========================

const guideForm = document.getElementById('guideForm');
const itemInput = document.getElementById('itemInput');
const typeSelect = document.getElementById('typeSelect');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const errorMessage = document.getElementById('errorMessage');

// ===========================
// EVENT LISTENERS
// ===========================

guideForm.addEventListener('submit', handleFormSubmit);

// ===========================
// FUNKCJE
// ===========================

/**
 * Obsługuje wysłanie formularza
 * @param {Event} event - zdarzenie submit
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    // Pobierz wartości z formularza
    const itemName = itemInput.value.trim();
    const resourceType = typeSelect.value;

    // Walidacja
    if (!itemName || !resourceType) {
        showError('Uzupełnij wszystkie pola!');
        return;
    }

    // Wyczyść poprzednie wyniki i błędy
    hideError();
    hideResults();
    showLoading();

    try {
        // Wyślij żądanie do backendu
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: resourceType,
                input: itemName,
            }),
        });

        // Sprawdź status odpowiedzi
        if (!response.ok) {
            throw new Error(`Błąd serwera: ${response.status}`);
        }

        // Parsuj JSON
        const data = await response.json();

        // Wyświetl wyniki
        displayResults(data.guide);
    } catch (error) {
        console.error('Błąd:', error);
        showError('Coś poszło nie tak. Spróbuj ponownie później.');
    } finally {
        hideLoading();
    }
}

/**
 * Wyświetla wyniki w formie listy
 * @param {string} guide - tekst z instrukcją (może zawierać HTML lub zwykły tekst)
 */
function displayResults(guide) {
    // Konwertuj tekst do HTML z zachowaniem formatowania
    const formattedGuide = formatGuideText(guide);
    resultsList.innerHTML = formattedGuide;
    showResults();
}

/**
 * Formatuje tekst instrukcji na HTML
 * Konwertuje numerowane/wypunktowane listy na prawidłowe tagi HTML
 * @param {string} text - surowy tekst
 * @returns {string} - sformatowany HTML
 */
function formatGuideText(text) {
    // Niezbędna ochrona przed XSS – escapuj HTML
    let escaped = escapeHtml(text);

    // Konwertuj numerowane linie (1. , 2. , itd.) na <ol>
    escaped = escaped.replace(
        /(\d+)\.\s+([^\n]+)/g,
        (match) => {
            // Jeśli to pierwszy element listy, otwórz <ol>
            return match;
        }
    );

    // Prostsze podejście: zamień linie przerwy na <br> i numerowane na <li>
    let html = '<ol>';
    escaped.split('\n').forEach((line) => {
        line = line.trim();
        if (line) {
            // Jeśli linia zaczyna się od liczby i kropki, potraktuj jako element listy
            if (/^\d+\./.test(line)) {
                html += `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
            } else if (line.startsWith('-') || line.startsWith('•')) {
                // Jeśli to wypunktowanie
                html += `<li>${line.replace(/^[-•]\s*/, '')}</li>`;
            } else if (line) {
                // Zwykły tekst
                html += `<li>${line}</li>`;
            }
        }
    });
    html += '</ol>';

    return html;
}

/**
 * Escapuje HTML znaki, aby uniknąć XSS
 * @param {string} text - tekst do escapowania
 * @returns {string} - escapowany tekst
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Pokazuje spinner ładowania
 */
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

/**
 * Ukrywa spinner ładowania
 */
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

/**
 * Pokazuje sekcję wyników
 */
function showResults() {
    resultsSection.classList.remove('hidden');
}

/**
 * Ukrywa sekcję wyników
 */
function hideResults() {
    resultsSection.classList.add('hidden');
}

/**
 * Wyświetla komunikat o błędzie
 * @param {string} message - treść błędu
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

/**
 * Ukrywa komunikat o błędzie
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

