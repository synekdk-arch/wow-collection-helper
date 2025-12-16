// ===========================
// WOW COLLECTION HELPER - FRONTEND
// ===========================

// API URLs - change for production
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://wow-collection-helper.onrender.com';

const API_URL = `${API_BASE_URL}/api/guide`;
const VALIDATE_URL = `${API_BASE_URL}/api/validate`;

// ===========================
// DOM ELEMENTS
// ===========================

const guideForm = document.getElementById('guideForm');
const itemInput = document.getElementById('itemInput');
const typeSelect = document.getElementById('typeSelect');
const loadingSpinner = document.getElementById('loadingSpinner');
const loadingText = document.getElementById('loadingText');
const dataPreview = document.getElementById('dataPreview');
const previewContent = document.getElementById('previewContent');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const metadata = document.getElementById('metadata');
const errorMessage = document.getElementById('errorMessage');

// ===========================
// STATE
// ===========================

let selectedType = 'mount';

// ===========================
// EVENT LISTENERS
// ===========================

guideForm.addEventListener('submit', handleFormSubmit);

// Initialize drag & drop selector
document.addEventListener('DOMContentLoaded', initTypeSelector);

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
    hideDataPreview();
    showLoading('Sprawdzam dane przedmiotu...');

    try {
        // Step 1: Validate and preview data
        updateLoadingText('Pobieram dane z Wowhead...');
        const validateResponse = await fetch(VALIDATE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: resourceType,
                input: itemName,
            }),
        });

        if (!validateResponse.ok) {
            throw new Error(`Błąd walidacji: ${validateResponse.status}`);
        }

        const validationData = await validateResponse.json();
        console.log('Validation data:', validationData);

        // Show data preview
        showDataPreview(validationData);

        // Step 2: Generate guide with AI
        updateLoadingText('Generuję przewodnik z AI...');
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
        displayResults(data.guide, data.metadata);
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
 * @param {Object} meta - metadata from API response
 */
function displayResults(guide, meta) {
    // Konwertuj tekst do HTML z zachowaniem formatowania
    const formattedGuide = formatGuideText(guide);
    resultsList.innerHTML = formattedGuide;
    
    // Display metadata if available
    if (meta && metadata) {
        let metaHtml = '<div class="metadata-item"><strong>Źródło:</strong> AI Gemini</div>';
        
        if (meta.model) {
            metaHtml += `<div class="metadata-item"><strong>Model:</strong> ${meta.model}</div>`;
        }
        
        if (meta.timestamp) {
            const date = new Date(meta.timestamp);
            metaHtml += `<div class="metadata-item"><strong>Wygenerowano:</strong> ${date.toLocaleString('pl-PL')}</div>`;
        }
        
        if (meta.itemData && meta.itemData.sources) {
            const wowheadSource = meta.itemData.sources.find(s => s.source === 'wowhead');
            if (wowheadSource && wowheadSource.id) {
                metaHtml += `<div class="metadata-item"><strong>Wowhead ID:</strong> ${wowheadSource.id}</div>`;
            }
        }
        
        metadata.innerHTML = metaHtml;
        metadata.classList.remove('hidden');
    }
    
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
function showLoading(text = 'Ładowanie...') {
    loadingSpinner.classList.remove('hidden');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

/**
 * Ukrywa spinner ładowania
 */
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

/**
 * Updates loading text
 */
function updateLoadingText(text) {
    if (loadingText) {
        loadingText.textContent = text;
    }
}

/**
 * Shows data preview section with enhanced details
 */
function showDataPreview(validationData) {
    if (!dataPreview || !previewContent) return;
    
    let html = '';
    
    // Type details
    if (validationData.itemData && validationData.itemData.typeDetails) {
        const details = validationData.itemData.typeDetails;
        html += `
            <div class="preview-item preview-header">
                <div style="font-size: 2rem;">${details.icon}</div>
                <div>
                    <strong style="font-size: 1.2rem;">${details.category}</strong>
                    <div class="preview-value" style="margin-top: 4px;">${details.description}</div>
                </div>
            </div>
        `;
    }
    
    // Item data from sources
    if (validationData.itemData && validationData.itemData.sources) {
        validationData.itemData.sources.forEach(source => {
            if (source.source === 'wowhead' && source.id) {
                html += `
                    <div class="preview-item">
                        <strong>🔗 Wowhead ID:</strong>
                        <span class="preview-value">${source.id}</span>
                        <span class="preview-badge success">✓ Znaleziono</span>
                    </div>
                `;
                
                // Detailed links
                if (source.detailedInfo) {
                    html += `
                        <div class="preview-item">
                            <strong>🌐 Zasoby:</strong>
                            <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                                <a href="${source.detailedInfo.wowheadLink}" target="_blank" class="preview-link-btn">
                                    📖 Wowhead
                                </a>
                                <a href="${source.detailedInfo.wowheadCommentsLink}" target="_blank" class="preview-link-btn">
                                    💬 Komentarze
                                </a>
                                <a href="${source.detailedInfo.wowheadGuidesLink}" target="_blank" class="preview-link-btn">
                                    📚 Poradniki
                                </a>
                            </div>
                        </div>
                    `;
                }
                
                html += `
                    <div class="preview-item">
                        <strong>📦 Typ przedmiotu:</strong>
                        <span class="preview-value">${source.type || 'item'}</span>
                        <span class="preview-badge info">${validationData.itemData.type}</span>
                    </div>
                `;
            } else if (source.searchTerm) {
                html += `
                    <div class="preview-item">
                        <strong>🔍 Tryb wyszukiwania:</strong>
                        <span class="preview-value">${source.input}</span>
                        <span class="preview-badge warning">⚡ Użyję AI</span>
                    </div>
                `;
            }
        });
    }
    
    // Typical sources info
    if (validationData.itemData && validationData.itemData.typeDetails) {
        const details = validationData.itemData.typeDetails;
        html += `
            <div class="preview-item">
                <strong>📍 Typowe źródła:</strong>
                <div class="preview-tags">
                    ${details.typical_sources.map(s => `<span class="preview-tag">${s}</span>`).join('')}
                </div>
            </div>
        `;
        
        html += `
            <div class="preview-item">
                <strong>⚔️ Poziom trudności:</strong>
                <span class="preview-value">${details.difficulty_range}</span>
            </div>
        `;
    }
    
    // Summary
    if (validationData.itemData && validationData.itemData.summary) {
        const summary = validationData.itemData.summary;
        html += `
            <div class="preview-item preview-summary">
                <strong>✅ Gotowość:</strong>
                <span class="preview-value">${summary.recommendedAction}</span>
                ${summary.hasItemId ? '<span class="preview-badge success">ID Verified</span>' : ''}
            </div>
        `;
    }
    
    if (!html) {
        html = `
            <div class="preview-item">
                <strong>ℹ️ Status:</strong>
                <span class="preview-value">Brak danych z Wowhead - użyję AI do wyszukiwania</span>
            </div>
        `;
    }
    
    previewContent.innerHTML = html;
    dataPreview.classList.remove('hidden');
}

/**
 * Hides data preview
 */
function hideDataPreview() {
    if (dataPreview) {
        dataPreview.classList.add('hidden');
    }
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

// ===========================
// DRAG & DROP TYPE SELECTOR
// ===========================

/**
 * Initialize type selector with drag & drop and click functionality
 */
function initTypeSelector() {
    const typeOptions = document.querySelectorAll('.type-option');
    const selectedTypeDisplay = document.querySelector('.selected-value');
    const hiddenInput = document.getElementById('typeSelect');
    
    if (!typeOptions.length) return;
    
    // Set initial selection
    typeOptions[0].classList.add('selected');
    
    // Click handler
    typeOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectType(this, typeOptions, selectedTypeDisplay, hiddenInput);
        });
        
        // Drag start
        option.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        });
        
        // Drag end
        option.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
            // Select on drag end if dropped in valid area
            selectType(this, typeOptions, selectedTypeDisplay, hiddenInput);
        });
        
        // Drag over (for visual feedback)
        option.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        // Drag leave
        option.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        // Drop
        option.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
        });
    });
}

/**
 * Select a type option
 */
function selectType(selectedOption, allOptions, display, hiddenInput) {
    // Remove selected class from all
    allOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to clicked/dragged option
    selectedOption.classList.add('selected');
    
    // Get data
    const type = selectedOption.dataset.type;
    const icon = selectedOption.querySelector('.type-icon').textContent;
    const label = selectedOption.querySelector('.type-label').textContent;
    
    // Update display
    display.textContent = `${icon} ${label}`;
    hiddenInput.value = type;
    selectedType = type;
    
    // Trigger animation
    selectedOption.querySelector('.type-icon').style.animation = 'none';
    setTimeout(() => {
        selectedOption.querySelector('.type-icon').style.animation = '';
    }, 10);
}

