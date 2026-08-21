const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "data");

function ensureDir() {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

function file(name) {
    return path.join(DIR, name);
}

function read(name, defaultData = {}) {
    ensureDir();
    const target = file(name);
    if (!fs.existsSync(target)) {
        fs.writeFileSync(target, JSON.stringify(defaultData, null, 2), "utf8");
    }
    try {
        return JSON.parse(fs.readFileSync(target, "utf8"));
    } catch (error) {
        console.error(`Database read error: ${name}`, error);
        return defaultData;
    }
}

function save(name, value) {
    ensureDir();
    fs.writeFileSync(file(name), JSON.stringify(value, null, 2), "utf8");
}

function getPlayer(id) {
    return read("players.json")[id] || null;
}

function createPlayer(id, name, avatar = "") {
    const players = read("players.json");
    if (players[id]) return players[id];

    players[id] = {
        id,
        username: name,
        avatar,
        level: 1,
        exp: 0,
        coins: 2000,
        gems: 0,
        hp: 150,
        maxHp: 150,
        energy: 120,
        maxEnergy: 120,
        attack: 15,
        defense: 15,
        speed: 10,
        crit: 5,
        critDamage: 150,
        accuracy: 95,
        dodge: 5,
        penetration: 0,
        lifesteal: 0,
        faction: null,
        bloodline: null,
        body: null,
        destiny: null,
        soul: null,
        inventory: [],
        equipment: { weapon: null, armor: null, relic: null, accessory: null },
        beasts: [],
        characters: [],
        skills: [],
        quests: [],
        achievements: [],
        titles: [],
        skins: [],
        codex: { characters: [], monsters: [], bosses: [], items: [], areas: [] },
        storyChapter: 1,
        storyFlags: {},
        location: "Bắc Minh",
        guild: null,
        reputation: {},
        relationships: {},
        professions: {},
        house: { level: 1, buildings: {} },
        stats: {
            wins: 0, losses: 0, bosses: 0, explores: 0,
            crafts: 0, quests: 0, pvpWins: 0, pvpLosses: 0
        },
        currencies: {
            gold: 2000, gems: 0, spiritStone: 0,
            merit: 0, event: 0
        },
        fourSymbols: {
            active: null,
            owned: [],
            resonance: 0,
            formation: null
        },
        season: { points: 0, tier: 1, claimed: [] },
        mail: [],
        luck: 0,
        createdAt: Date.now()
    };

    save("players.json", players);
    return players[id];
}

function updatePlayer(id, updates) {
    const players = read("players.json");
    if (!players[id]) return null;

    if (typeof updates === "function") {
        players[id] = updates(players[id]) || players[id];
    } else if (updates && typeof updates === "object") {
        players[id] = { ...players[id], ...updates };
    }

    save("players.json", players);
    return players[id];
}

function mutate(id, fn) {
    return updatePlayer(id, fn);
}

function players() {
    return Object.values(read("players.json"));
}

function getAllPlayers() {
    return players();
}

function data(name, defaultData = {}) {
    return read(name, defaultData);
}

function saveData(name, value) {
    save(name, value);
}

module.exports = {
    getPlayer,
    createPlayer,
    updatePlayer,
    mutate,
    players,
    getAllPlayers,
    data,
    saveData
};
