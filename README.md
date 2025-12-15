# WoW Collection Helper

Szybka aplikacja webowa pomagająca graczom World of Warcraft szybko uzyskać konkretne instrukcje, jak zdobyć mounty, pety, zabawki i przedmioty kosmetyczne. Użytkownik podaje nazwę lub link do przedmiotu, a aplikacja zwraca zwięzłą listę kroków.

## 🎯 Cechy

- **Frontend**: Statyczna strona (HTML + CSS + vanilla JS) – idealna dla GitHub Pages
- **Backend**: Lekkie API (Node.js + Express) – łatwe do hostowania na Render/Railway
- **Rozszerzalność**: Łatwo dodaj nowe typy zasobów
- **Czystość kodu**: Komentarze, czytelna struktura, gotowe do pracy dla początkujących

## 📁 Struktura projektu

wow-collection-helper/
├── frontend/
│ ├── index.html # Główna strona HTML
│ ├── style.css # Stylowanie (responsywny design)
│ └── script.js # Logika frontendu (fetch do API)
├── backend/
│ ├── server.js # Serwer Express + logika API
│ ├── prompts.js # Buildery promptów dla każdego typu
│ ├── package.json # Zależności (Express, CORS, dotenv)
│ └── .env # Konfiguracja (klucz API)
├── README.md # Ten plik
└── .gitignore # Ignoruj node_modules i .env