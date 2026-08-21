const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "data");

function f(name) {
    return path.join(DIR, name);
}

function ensureDir() {
    if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR, { recursive: true });
    }
}

function read(name, defaultData = {}) {
    ensureDir();

    const file = f(name);

    if (!fs.existsSync(file)) {
        fs.writeFileSync(
            file,
            JSON.stringify(defaultData, null, 2),
            "utf8"
        );
    }

    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
        console.error(`❌ Lỗi đọc database ${name}:`, error);
        return defaultData;
    }
}

function save(name, data) {
    ensureDir();

    fs.writeFileSync(
        f(name),
        JSON.stringify(data, null, 2),
        "utf8"
    );
}


// =====================================================
// 👤 LẤY NGƯỜI CHƠI
// =====================================================

function getPlayer(id) {
    const players = read("players.json");
    return players[id] || null;
}


// =====================================================
// 🆕 TẠO NGƯỜI CHƠI
// =====================================================

function createPlayer(id, name, avatar = "") {
    const players = read("players.json");

    if (players[id]) {
        return players[id];
    }

    players[id] = {
        id,
        username: name,
        avatar,

        // =========================
        // 📈 CẤP ĐỘ
        // =========================

        level: 1,
        exp: 0,

        // =========================
        // 💰 TÀI NGUYÊN
        // =========================

        coins: 2000,

        // =========================
        // ❤️ CHỈ SỐ
        // =========================

        hp: 150,
        maxHp: 150,

        energy: 120,
        maxEnergy: 120,

        attack: 15,
        defense: 15,
        speed: 10,
        crit: 5,

        // =========================
        // 🌌 HUYỀN VŨ
        // =========================

        faction: null,
        bloodline: null,

        // =========================
        // 🎒 KHO ĐỒ
        // =========================

        inventory: [],

        // =========================
        // ⚔️ TRANG BỊ
        // =========================

        equipment: {
            weapon: null,
            armor: null,
            relic: null
        },

        // =========================
        // 🐉 LINH THÚ
        // =========================

        beasts: [],

        // =========================
        // 📖 KỸ NĂNG
        // =========================

        skills: [],

        // =========================
        // 📜 NHIỆM VỤ
        // =========================

        quests: [],

        // =========================
        // 🏆 THÀNH TỰU
        // =========================

        achievements: [],

        // =========================
        // 📖 CỐT TRUYỆN
        // =========================

        storyChapter: 1,

        // =========================
        // 📍 VỊ TRÍ
        // =========================

        location: "Bắc Minh",

        // =========================
        // 🏰 GUILD
        // =========================

        guild: null,

        // =========================
        // 📊 THỐNG KÊ
        // =========================

        stats: {
            wins: 0,
            losses: 0,
            bosses: 0,
            explores: 0,
            crafts: 0,
            quests: 0
        }
    };

    save("players.json", players);

    return players[id];
}


// =====================================================
// 🔄 CẬP NHẬT NGƯỜI CHƠI
// =====================================================

function updatePlayer(id, updates) {
    const players = read("players.json");

    if (!players[id]) {
        return null;
    }

    if (typeof updates === "function") {
        players[id] = updates(players[id]) || players[id];
    } else if (
        updates &&
        typeof updates === "object"
    ) {
        players[id] = {
            ...players[id],
            ...updates
        };
    }

    save("players.json", players);

    return players[id];
}


// =====================================================
// 🔄 MUTATE
// Giữ tương thích với code cũ
// =====================================================

function mutate(id, fn) {
    return updatePlayer(id, fn);
}


// =====================================================
// 👥 LẤY TẤT CẢ NGƯỜI CHƠI
// =====================================================

function players() {
    return Object.values(read("players.json"));
}


// =====================================================
// 👥 ALIAS CHO ADMIN
// =====================================================

function getAllPlayers() {
    return players();
}


// =====================================================
// 🗂️ ĐỌC DATABASE KHÁC
// =====================================================

function data(name, defaultData = {}) {
    return read(name, defaultData);
}


// =====================================================
// 💾 LƯU DATABASE KHÁC
// =====================================================

function saveData(name, dataValue) {
    save(name, dataValue);
}


// =====================================================
// 📦 EXPORT
// =====================================================

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
