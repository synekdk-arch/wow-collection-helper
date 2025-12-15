// ===========================
// WOW COLLECTION HELPER - PROMPT BUILDERS
// ===========================

/**
 * Buduje prompt dla mountów
 * @param {string} input - nazwa lub URL mounta
 * @returns {string} - prompt do wysłania do AI
 */
function buildMountPrompt(input) {
    return `
You are a World of Warcraft expert guide assistant. A player is asking for instructions on how to obtain a specific mount.

Input (can be a name or WarcraftMounts/Wowhead URL): "${input}"

Your task:
1. Identify the exact mount based on the provided name or link.
2. Search reliable WoW sources (Warcraftmounts.com, Wowhead) for acquisition methods.
3. Provide a VERY CONCISE, step-by-step guide in POLISH LANGUAGE.
4. Include only practical gameplay steps - NO lore, NO unnecessary context.
5. If an achievement is required, break down ALL steps of that achievement.
6. Mention required reputation levels, currencies, difficulty levels, seasons, or events if applicable.
7. Format the answer as a numbered list, one step per line.

Example format:
1. Osiągnij reputację Exalted z frakcją X
2. Zbierz Y monet/waluty Z
3. Oddaj quest u NPC w mieście A
4. Wejdź do dungeonu B na trudności C
5. Pokonaj bossa D
6. Odbierz mounta u NPC E

Respond ONLY with the numbered list. No extra text, no apologies.
`;
}

/**
 * Buduje prompt dla zabawek (toys)
 * @param {string} input - nazwa lub URL zabawki
 * @returns {string} - prompt do wysłania do AI
 */
function buildToyPrompt(input) {
    return `
You are a World of Warcraft expert guide assistant. A player is asking for instructions on how to obtain a specific toy.

Input (can be a name or WarcraftMounts/Wowhead URL): "${input}"

Your task:
1. Identify the exact toy based on the provided name or link.
2. Search reliable WoW sources (Wowhead, in-game databases) for acquisition methods.
3. Provide a VERY CONCISE, step-by-step guide in POLISH LANGUAGE.
4. Include only practical gameplay steps - NO lore, NO unnecessary context.
5. Specify exact quest names, vendor NPCs, dungeons, or events where applicable.
6. Mention any required level, faction, reputation, or currency.
7. Format the answer as a numbered list, one step per line.

Example format:
1. Osiągnij poziom X
2. Odblokuj dostęp do obszaru/mapy A
3. Oddaj quest "Nazwa" u NPC B
4. Odbierz zabawkę z dropa w dungeonie/raidzie C
5. Albo kup od vendora D za Y monet

Respond ONLY with the numbered list. No extra text, no apologies.
`;
}

/**
 * Buduje prompt dla petów
 * @param {string} input - nazwa lub URL peta
 * @returns {string} - prompt do wysłania do AI
 */
function buildPetPrompt(input) {
    return `
You are a World of Warcraft expert guide assistant. A player is asking for instructions on how to obtain a specific pet (battle pet or vanity pet).

Input (can be a name or WarcraftMounts/Wowhead URL): "${input}"

Your task:
1. Identify the exact pet based on the provided name or link.
2. Search reliable WoW sources (Wowhead, Pet Journal) for acquisition methods.
3. Provide a VERY CONCISE, step-by-step guide in POLISH LANGUAGE.
4. Include only practical gameplay steps - NO lore, NO unnecessary context.
5. Specify acquisition method: quest, vendor, drop, pet battle, achievement, event, currency, etc.
6. Include NPC names, dungeon names, event dates, or required achievements.
7. Format the answer as a numbered list, one step per line.

Example format:
1. Odblokuj dostęp do strefy/eventu X
2. Zbierz walutę Y lub osiągnij achievement Z
3. Oddaj quest u NPC A
4. Pokonaj przeciwnika w Pet Battle
5. Odbierz peta z dropa/od vendora B

Respond ONLY with the numbered list. No extra text, no apologies.
`;
}

/**
 * Buduje prompt dla przedmiotów kosmetycznych/dekoracyjnych
 * @param {string} input - nazwa lub URL przedmiotu
 * @returns {string} - prompt do wysłania do AI
 */
function buildDecorPrompt(input) {
    return `
You are a World of Warcraft expert guide assistant. A player is asking for instructions on how to obtain a specific cosmetic/decorative item (transmog gear, cosmetic set, decoration, etc.).

Input (can be a name or WarcraftMounts/Wowhead URL): "${input}"

Your task:
1. Identify the exact cosmetic item or set based on the provided name or link.
2. Search reliable WoW sources (Wowhead, Transmogrification databases) for acquisition methods.
3. Provide a VERY CONCISE, step-by-step guide in POLISH LANGUAGE.
4. Include only practical gameplay steps - NO lore, NO unnecessary context.
5. If an achievement chain, reputation grind, or quest line is required, break it ALL down step by step.
6. Mention currencies, reputation levels, difficulty tiers, or seasonal availability.
7. Format the answer as a numbered list, one step per line.

Example format:
1. Osiągnij poziom X
2. Ukończ achievement A lub quest chain B
3. Zbierz reputację do poziomu C u fakcji D
4. Zbierz walutę E z różnego rodzaju contentu
5. Kup element od vendora F za zebraną walutę
6. Powtórz dla każdego elementu setu (jeśli dotyczy)

Respond ONLY with the numbered list. No extra text, no apologies.
`;
}

// ===========================
// EXPORT
// ===========================

module.exports = {
    buildMountPrompt,
    buildToyPrompt,
    buildPetPrompt,
    buildDecorPrompt,
};
