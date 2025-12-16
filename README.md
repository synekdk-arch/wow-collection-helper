# WoW Collection Helper

Szybka aplikacja webowa pomagająca graczom World of Warcraft szybko uzyskać konkretne instrukcje, jak zdobyć mounty, pety, zabawki i przedmioty kosmetyczne. Użytkownik podaje nazwę lub link do przedmiotu, a aplikacja zwraca zwięzłą listę kroków.

## 🎯 Cechy

- **Frontend**: Statyczna strona (HTML + CSS + vanilla JS) – idealna dla GitHub Pages
- **Backend**: Lekkie API (Node.js + Express) – łatwe do hostowania na Render/Railway
- **Rozszerzalność**: Łatwo dodaj nowe typy zasobów
- **Czystość kodu**: Komentarze, czytelna struktura, gotowe do pracy dla początkujących

## 📁 Struktura projektu

```
wow-collection-helper/
├── frontend/
│   ├── index.html         # Główna strona HTML
│   ├── style.css          # Stylowanie (responsywny design)
│   └── script.js          # Logika frontendu (fetch do API)
├── backend/
│   ├── server.js          # Serwer Express + logika API
│   ├── prompts.js         # Buildery promptów dla każdego typu
│   ├── package.json       # Zależności (Express, CORS, dotenv)
│   ├── .env.example       # Szablon zmiennych środowiskowych
│   └── .env               # Konfiguracja (klucz API) - NIE commituj!
├── render.yaml            # Konfiguracja dla Render.com
├── DEPLOYMENT.md          # Szczegółowy poradnik wdrożenia
├── README.md              # Ten plik
└── .gitignore             # Ignoruj node_modules i .env
```

## 🚀 Wdrożenie na Render.com

### Szybki start

1. **Sklonuj repozytorium**
   ```bash
   git clone https://github.com/your-username/wow-collection-helper.git
   cd wow-collection-helper
   ```

2. **Skonfiguruj backend lokalnie**
   ```bash
   cd backend
   cp .env.example .env
   # Edytuj .env i dodaj swój GEMINI_API_KEY
   npm install
   npm start
   ```

3. **Wdróż na Render.com**
   - Przejdź do [Render Dashboard](https://dashboard.render.com/)
   - Kliknij "New +" → "Blueprint"
   - Połącz swoje repozytorium GitHub
   - Render automatycznie wykryje `render.yaml`
   - **WAŻNE**: Dodaj `GEMINI_API_KEY` w ustawieniach Environment

📖 **Pełna instrukcja**: Zobacz [DEPLOYMENT.md](./DEPLOYMENT.md) dla szczegółowego poradnika wdrożenia

### Uzyskanie klucza API Google Gemini

1. Przejdź do [Google AI Studio](https://ai.google.dev/)
2. Zaloguj się kontem Google
3. Kliknij "Get API Key"
4. Skopiuj klucz i dodaj do `.env` (lokalnie) lub Render Environment (produkcja)

⚠️ **UWAGA BEZPIECZEŃSTWA**: Nigdy nie commituj plików `.env` do Git!