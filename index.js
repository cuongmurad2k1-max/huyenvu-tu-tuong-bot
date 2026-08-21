require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    GatewayIntentBits,
    Events,
    REST,
    Routes
} = require("discord.js");

const db = require("./database");

const PREFIX = ".";
const ROOT = __dirname;
const COMMANDS_DIR = path.join(ROOT, "commands");

// =====================================================
// 🐢 HUYỀN VŨ – PREFIX ONLY
// TỰ ĐỘNG LOAD TOÀN BỘ COMMAND
// =====================================================

const BUNDLES = [
    "01_combat.js",
    "02_tutuong.js",
    "03_thanthu.js",
    "04_nhanvat.js",
    "05_boss_raid.js",
    "06_pvp.js",
    "07_guild.js",
    "08_quest_story.js",
    "09_world.js",
    "10_items_craft.js",
    "11_economy.js",
    "12_social.js",
    "13_progress.js",
    "14_misc.js"
];

// =====================================================
// KIỂM TRA COMMAND
// =====================================================

function isCommand(value) {
    return !!(
        value &&
        value.data &&
        typeof value.execute === "function" &&
        typeof value.data.name === "string"
    );
}

// =====================================================
// LOAD 1 FILE COMMAND
// =====================================================

function readCommandModule(file) {
    try {
        delete require.cache[require.resolve(file)];

        const mod = require(file);

        if (Array.isArray(mod)) {
            return mod.filter(isCommand);
        }

        if (isCommand(mod)) {
            return [mod];
        }

        return [];
    } catch (error) {
        console.error(
            `❌ Không thể load ${file}:`,
            error.message
        );

        return [];
    }
}

// =====================================================
// LOAD TOÀN BỘ COMMAND
// =====================================================

function loadAllCommands() {
    const loaded = [];
    const seenFiles = new Set();

    // -------------------------------------------------
    // 1. LOAD TRONG /commands
    // -------------------------------------------------

    if (
        fs.existsSync(COMMANDS_DIR) &&
        fs.statSync(COMMANDS_DIR).isDirectory()
    ) {
        // Load 14 bundle chính
        for (const file of BUNDLES) {
            const fullPath =
                path.join(COMMANDS_DIR, file);

            if (!fs.existsSync(fullPath)) {
                continue;
            }

            seenFiles.add(fullPath);

            loaded.push(
                ...readCommandModule(fullPath)
            );
        }

        // Load thêm command .js riêng lẻ
        const files =
            fs.readdirSync(COMMANDS_DIR);

        for (const file of files) {
            if (!file.endsWith(".js")) {
                continue;
            }

            // Không load index cũ
            if (file === "index.js") {
                continue;
            }

            if (file === "_helper.js") {
                continue;
            }

            const fullPath =
                path.join(COMMANDS_DIR, file);

            if (seenFiles.has(fullPath)) {
                continue;
            }

            loaded.push(
                ...readCommandModule(fullPath)
            );
        }
    }

    // -------------------------------------------------
    // 2. LOAD BUNDLE NẾU NẰM NGAY THƯ MỤC GỐC
    // -------------------------------------------------

    for (const file of BUNDLES) {
        const fullPath =
            path.join(ROOT, file);

        if (!fs.existsSync(fullPath)) {
            continue;
        }

        loaded.push(
            ...readCommandModule(fullPath)
        );
    }

    // -------------------------------------------------
    // 3. LOẠI COMMAND TRÙNG
    // -------------------------------------------------

    const map = new Map();

    for (const command of loaded) {
        const name =
            String(command.data.name)
                .toLowerCase();

        if (
            !/^[a-z0-9_-]{1,32}$/.test(name)
        ) {
            console.warn(
                `⚠️ Bỏ qua command không hợp lệ: ${name}`
            );

            continue;
        }

        if (map.has(name)) {
            console.warn(
                `⚠️ Trùng .${name} - giữ command đầu tiên.`
            );

            continue;
        }

        map.set(name, command);
    }

    return map;
}

// =====================================================
// LOAD COMMAND
// =====================================================

const commandMap =
    loadAllCommands();

console.log(
    "📦 Đã quét toàn bộ command bundle."
);

console.log(
    `📜 Command Map: ${commandMap.size} commands`
);

// =====================================================
// 🤖 CLIENT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =====================================================
// 🧩 TÁCH THAM SỐ
// =====================================================

function tokenize(text) {
    const result = [];

    const regex =
        /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|(\S+)/g;

    let match;

    while (
        (match = regex.exec(text)) !== null
    ) {
        result.push(
            match[1] ??
            match[2] ??
            match[3]
        );
    }

    return result;
}

// =====================================================
// CHUẨN HÓA ID
// =====================================================

function normalizeId(value) {
    if (!value) {
        return null;
    }

    const text =
        String(value).trim();

    const match =
        text.match(/^<@!?(\d+)>$/);

    if (match) {
        return match[1];
    }

    if (/^\d+$/.test(text)) {
        return text;
    }

    return null;
}

// =====================================================
// BOOLEAN
// =====================================================

function parseBoolean(value) {
    if (value == null) {
        return null;
    }

    const v =
        String(value).toLowerCase();

    if (
        [
            "true",
            "1",
            "yes",
            "y",
            "co",
            "có",
            "bat",
            "bật"
        ].includes(v)
    ) {
        return true;
    }

    if (
        [
            "false",
            "0",
            "no",
            "n",
            "khong",
            "không",
            "tat",
            "tắt"
        ].includes(v)
    ) {
        return false;
    }

    return Boolean(value);
}

// =====================================================
// CHUYỂN GIÁ TRỊ OPTION
// =====================================================

function makeOptionValue(
    message,
    option,
    raw
) {
    if (raw == null) {
        return null;
    }

    switch (option.type) {

        // INTEGER
        case 4: {
            const n =
                Number.parseInt(
                    raw,
                    10
                );

            if (Number.isNaN(n)) {
                throw new Error(
                    `Tham số ${option.name} phải là số nguyên.`
                );
            }

            return n;
        }

        // NUMBER
        case 10: {
            const n =
                Number(raw);

            if (Number.isNaN(n)) {
                throw new Error(
                    `Tham số ${option.name} phải là số.`
                );
            }

            return n;
        }

        // BOOLEAN
        case 5:
            return parseBoolean(raw);

        // USER
        case 6: {
            const id =
                normalizeId(raw);

            if (!id) {
                throw new Error(
                    `Không nhận diện được người dùng ở ${option.name}.`
                );
            }

            return (
                message.client.users.cache.get(id) ||
                { id }
            );
        }

        // CHANNEL
        case 7: {
            const id =
                normalizeId(raw);

            if (!id) {
                throw new Error(
                    `Không nhận diện được kênh ở ${option.name}.`
                );
            }

            return (
                message.guild?.channels.cache.get(id) ||
                { id }
            );
        }

        // ROLE
        case 8: {
            const id =
                normalizeId(raw);

            if (!id) {
                throw new Error(
                    `Không nhận diện được role ở ${option.name}.`
                );
            }

            return (
                message.guild?.roles.cache.get(id) ||
                { id }
            );
        }

        // MENTIONABLE
        case 9: {
            const id =
                normalizeId(raw);

            if (!id) {
                throw new Error(
                    `Không nhận diện được mentionable ở ${option.name}.`
                );
            }

            return (
                message.guild?.members.cache.get(id) ||
                message.guild?.roles.cache.get(id) ||
                message.client.users.cache.get(id) ||
                { id }
            );
        }

        // STRING
        default:
            return String(raw);
    }
}

// =====================================================
// BUILD OPTION
// =====================================================

function buildValues(
    message,
    command,
    args
) {
    const json =
        typeof command.data?.toJSON ===
        "function"
            ? command.data.toJSON()
            : {};

    let options =
        Array.isArray(json.options)
            ? json.options
            : [];

    let positional =
        [...args];

    const values =
        new Map();

    let selectedSubcommand =
        null;

    let selectedSubcommandGroup =
        null;

    // -------------------------------------------------
    // SUBCOMMAND GROUP
    // -------------------------------------------------

    if (
        options.some(
            x => x.type === 1 ||
                 x.type === 2
        )
    ) {

        if (
            options.some(
                x => x.type === 2
            )
        ) {

            const groupName =
                positional.shift();

            const group =
                options.find(
                    x =>
                        x.type === 2 &&
                        x.name === groupName
                );

            if (group) {

                selectedSubcommandGroup =
                    group.name;

                options =
                    group.options || [];
            }
        }

        // -------------------------------------------------
        // SUBCOMMAND
        // -------------------------------------------------

        const sub =
            options.find(
                x =>
                    x.type === 1 &&
                    x.name === positional[0]
            );

        if (sub) {

            selectedSubcommand =
                sub.name;

            positional.shift();

            options =
                sub.options || [];
        }
    }

    let cursor = 0;

    for (const option of options) {

        if (
            option.type === 1 ||
            option.type === 2
        ) {
            continue;
        }

        const raw =
            positional[cursor];

        if (raw == null) {

            values.set(
                option.name,
                null
            );

            if (option.required) {

                throw new Error(
                    `Thiếu tham số bắt buộc: ${option.name}`
                );
            }

            continue;
        }

        const value =
            makeOptionValue(
                message,
                option,
                raw
            );

        // -------------------------------------------------
        // CHOICE
        // -------------------------------------------------

        if (
            Array.isArray(option.choices) &&
            option.choices.length
        ) {

            const byName =
                option.choices.find(
                    x =>
                        String(x.name)
                            .toLowerCase() ===
                        String(raw)
                            .toLowerCase()
                );

            const byValue =
                option.choices.find(
                    x =>
                        String(x.value)
                            .toLowerCase() ===
                        String(raw)
                            .toLowerCase()
                );

            if (byName) {

                values.set(
                    option.name,
                    byName.value
                );

            } else if (byValue) {

                values.set(
                    option.name,
                    byValue.value
                );

            } else {

                values.set(
                    option.name,
                    value
                );
            }

        } else {

            values.set(
                option.name,
                value
            );
        }

        cursor++;
    }

    return {
        values,
        selectedSubcommand,
        selectedSubcommandGroup
    };
}

// =====================================================
// TẠO INTERACTION GIẢ CHO PREFIX
// =====================================================

function makePrefixInteraction(
    message,
    command,
    args
) {

    const {
        values,
        selectedSubcommand,
        selectedSubcommandGroup
    } = buildValues(
        message,
        command,
        args
    );

    let replied = false;
    let deferred = false;
    let lastReply = null;

    const optionsApi = {

        getString(
            name,
            required = false
        ) {

            const value =
                values.get(name) ??
                null;

            if (
                required &&
                value == null
            ) {
                throw new Error(
                    `Thiếu tham số: ${name}`
                );
            }

            return value;
        },

        getInteger(
            name,
            required = false
        ) {

            const value =
                values.get(name) ??
                null;

            if (
                required &&
                value == null
            ) {
                throw new Error(
                    `Thiếu tham số: ${name}`
                );
            }

            return value == null
                ? null
                : Number.parseInt(
                    value,
                    10
                );
        },

        getNumber(
            name,
            required = false
        ) {

            const value =
                values.get(name) ??
                null;

            if (
                required &&
                value == null
            ) {
                throw new Error(
                    `Thiếu tham số: ${name}`
                );
            }

            return value == null
                ? null
                : Number(value);
        },

        getBoolean(
            name,
            required = false
        ) {

            const value =
                values.get(name) ??
                null;

            if (
                required &&
                value == null
            ) {
                throw new Error(
                    `Thiếu tham số: ${name}`
                );
            }

            return value == null
                ? null
                : Boolean(value);
        },

        getUser(
            name,
            required = false
        ) {

            const value =
                values.get(name) ??
                null;

            if (
                required &&
                value == null
            ) {
                throw new Error(
                    `Thiếu tham số: ${name}`
                );
            }

            return value;
        },

        getMember(
            name,
            required = false
        ) {

            const user =
                values.get(name) ??
                null;

            const member =
                user?.id
                    ? message.guild?.members.cache.get(
                        user.id
                    )
                    : null;

            if (
                required &&
                !member
            ) {
                throw new Error(
                    `Không tìm thấy thành viên: ${name}`
                );
            }

            return member;
        },

        getChannel(
            name,
            required = false
        ) {

            const value =
                values.get(name) ??
                null;

            if (
                required &&
                value == null
            ) {
                throw new Error(
                    `Thiếu tham số: ${name}`
                );
            }

            return value;
        },

        getRole(
            name,
            required = false
        ) {

            const value =
                values.get(name) ??
                null;

            if (
                required &&
                value == null
            ) {
                throw new Error(
                    `Thiếu tham số: ${name}`
                );
            }

            return value;
        },

        getMentionable(
            name,
            required = false
        ) {

            const value =
                values.get(name) ??
                null;

            if (
                required &&
                value == null
            ) {
                throw new Error(
                    `Thiếu tham số: ${name}`
                );
            }

            return value;
        },

        getSubcommand(
            required = true
        ) {

            if (
                !selectedSubcommand &&
                required
            ) {
                throw new Error(
                    "Không có subcommand."
                );
            }

            return (
                selectedSubcommand ||
                null
            );
        },

        getSubcommandGroup(
            required = true
        ) {

            if (
                !selectedSubcommandGroup &&
                required
            ) {
                throw new Error(
                    "Không có subcommand group."
                );
            }

            return (
                selectedSubcommandGroup ||
                null
            );
        },

        get(name) {

            const value =
                values.get(name) ??
                null;

            return value == null
                ? null
                : {
                    name,
                    value
                };
        }
    };

    // =================================================
    // INTERACTION GIẢ
    // =================================================

    const interaction = {

        user:
            message.author,

        member:
            message.member,

        guild:
            message.guild,

        channel:
            message.channel,

        client:
            message.client,

        message,

        createdTimestamp:
            message.createdTimestamp,

        commandName:
            command.data.name,

        options:
            optionsApi,

        isChatInputCommand:
            () => true,

        isButton:
            () => false,

        isStringSelectMenu:
            () => false,

        isUserSelectMenu:
            () => false,

        reply:
            async payload => {

                lastReply =
                    await message.reply(
                        payload
                    );

                replied = true;

                return lastReply;
            },

        followUp:
            async payload =>
                message.channel.send(
                    payload
                ),

        editReply:
            async payload => {

                if (lastReply) {

                    return lastReply.edit(
                        payload
                    );
                }

                lastReply =
                    await message.reply(
                        payload
                    );

                replied = true;

                return lastReply;
            },

        deferReply:
            async () => {

                deferred = true;
            },

        deleteReply:
            async () => {

                if (lastReply) {

                    await lastReply
                        .delete()
                        .catch(() => {});
                }
            },

        fetchReply:
            async () =>
                lastReply,

        update:
            async payload => {

                if (lastReply) {

                    return lastReply.edit(
                        payload
                    );
                }

                lastReply =
                    await message.reply(
                        payload
                    );

                replied = true;

                return lastReply;
            },

        showModal:
            async () => {

                throw new Error(
                    "Modal không thể mở trực tiếp từ lệnh prefix ."
                );
            }
    };

    Object.defineProperty(
        interaction,
        "replied",
        {
            get: () => replied
        }
    );

    Object.defineProperty(
        interaction,
        "deferred",
        {
            get: () => deferred
        }
    );

    return interaction;
}

// =====================================================
// 📜 HELP
// =====================================================

function helpText() {

    const names =
        [...commandMap.keys()]
            .sort();

    const lines = [

        `📜 **HUYỀN VŨ — ${names.length} LỆNH PREFIX**`,

        "Dùng: **.tên_lệnh [tham số]**",

        ""
    ];

    for (
        const name of names
    ) {

        lines.push(
            `• .${name}`
        );
    }

    return lines.join("\n");
}

// =====================================================
// 🗑️ XÓA TOÀN BỘ SLASH COMMAND
// =====================================================

async function deleteAllSlashCommands() {

    try {

        const rest =
            new REST({
                version: "10"
            }).setToken(
                process.env.DISCORD_TOKEN
            );

        const applicationId =
            client.user.id;

        // -------------------------------------------------
        // GLOBAL
        // -------------------------------------------------

        await rest.put(
            Routes.applicationCommands(
                applicationId
            ),
            {
                body: []
            }
        );

        console.log(
            "🗑️ Đã xóa toàn bộ Global Slash Commands (/)."
        );

        // -------------------------------------------------
        // GUILD
        // -------------------------------------------------

        const guilds =
            await client.guilds.fetch();

        for (
            const [guildId]
            of guilds
        ) {

            try {

                await rest.put(
                    Routes.applicationGuildCommands(
                        applicationId,
                        guildId
                    ),
                    {
                        body: []
                    }
                );

            } catch (error) {

                console.warn(
                    `⚠️ Không xóa được Slash ở server ${guildId}: ${error.message}`
                );
            }
        }

        console.log(
            "✅ Slash Command đã bị vô hiệu hóa."
        );

        console.log(
            "🔰 Bot chỉ dùng prefix ."
        );

    } catch (error) {

        console.error(
            "❌ Lỗi khi xóa Slash Commands:",
            error.message
        );
    }
}

// =====================================================
// 🟢 READY
// =====================================================

client.once(
    Events.ClientReady,
    async readyClient => {

        console.log(
            `🐢 ${readyClient.user.tag} ONLINE — HUYỀN VŨ PREFIX BOT`
        );

        console.log(
            `🌌 Servers: ${readyClient.guilds.cache.size}`
        );

        console.log(
            `📜 Commands: ${commandMap.size}`
        );

        console.log(
            `🔰 Prefix: ${PREFIX}`
        );

        await deleteAllSlashCommands();

        console.log(
            "🟢 Bot sẵn sàng nhận lệnh PREFIX."
        );
    }
);

// =====================================================
// ⌨️ NHẬN LỆNH PREFIX
// =====================================================

client.on(
    Events.MessageCreate,
    async message => {

        // Không xử lý bot
        if (message.author.bot) {
            return;
        }

        // Chỉ server
        if (!message.guild) {
            return;
        }

        // Không bắt đầu bằng .
        if (!message.content.startsWith(PREFIX)) {
            return;
        }

        const body =
            message.content
                .slice(PREFIX.length)
                .trim();

        if (!body) {
            return;
        }

        console.log(
            `📥 ${message.author.tag}: .${body}`
        );

        const parts =
            tokenize(body);

        const name =
            String(
                parts.shift() || ""
            ).toLowerCase();

        if (!name) {
            return;
        }

        // -------------------------------------------------
        // HELP
        // -------------------------------------------------

        if (
            name === "help" ||
            name === "lenh"
        ) {

            return message
                .reply(helpText())
                .catch(() => {});
        }

        // -------------------------------------------------
        // TÌM COMMAND
        // -------------------------------------------------

        const command =
            commandMap.get(name);

        if (!command) {

            return message
                .reply(
                    `❌ Không tìm thấy lệnh **.${name}**.`
                )
                .catch(() => {});
        }

        // -------------------------------------------------
        // CHẠY COMMAND
        // -------------------------------------------------

        try {

            const interaction =
                makePrefixInteraction(
                    message,
                    command,
                    parts
                );

            await command.execute(
                interaction
            );

        } catch (error) {

            console.error(
                `❌ Lỗi .${name}:`,
                error
            );

            await message
                .reply(
                    `❌ Lỗi khi thực hiện **.${name}**: ${
                        error.message ||
                        "Không xác định"
                    }`
                )
                .catch(() => {});
        }
    }
);

// =====================================================
// 🔘 BUTTON / MENU
// Giữ lại tương tác Discord hiện có
// =====================================================

client.on(
    Events.InteractionCreate,
    async interaction => {

        if (
            !interaction.isButton() &&
            !interaction.isStringSelectMenu() &&
            !interaction.isUserSelectMenu()
        ) {
            return;
        }

        try {

            const parts =
                interaction.customId
                    .split(":");

            const type =
                parts[0];

            const uid =
                parts[1];

            const id =
                parts[2];

            // -------------------------------------------------
            // KIỂM TRA USER
            // -------------------------------------------------

            if (
                uid &&
                uid !== interaction.user.id
            ) {

                return interaction
                    .reply({
                        content:
                            "❌ Menu này không thuộc về bạn.",
                        ephemeral: true
                    })
                    .catch(() => {});
            }

            // -------------------------------------------------
            // TỨ TƯỢNG
            // -------------------------------------------------

            if (
                type === "faction" &&
                interaction.isButton()
            ) {

                let factions = [];

                try {

                    factions =
                        require(
                            "./factions.json"
                        );

                } catch (_) {}

                const faction =
                    factions.find(
                        x =>
                            String(x.id) ===
                            String(id)
                    );

                if (!faction) {

                    return interaction
                        .reply({
                            content:
                                "❌ Không tìm thấy Tứ Tượng.",
                            ephemeral: true
                        });
                }

                const bonuses =
                    faction.bonuses || {};

                const attack =
                    Number(
                        bonuses.attack || 0
                    );

                const defense =
                    Number(
                        bonuses.defense || 0
                    );

                const speed =
                    Number(
                        bonuses.speed || 0
                    );

                const maxHp =
                    Number(
                        bonuses.maxHp || 0
                    );

                // -------------------------------------------------
                // DATABASE
                // -------------------------------------------------

                if (
                    db &&
                    typeof db.mutate ===
                    "function"
                ) {

                    db.mutate(
                        interaction.user.id,
                        player => {

                            player.attack =
                                Number(
                                    player.attack || 0
                                ) + attack;

                            player.defense =
                                Number(
                                    player.defense || 0
                                ) + defense;

                            player.speed =
                                Number(
                                    player.speed || 0
                                ) + speed;

                            player.maxHp =
                                Number(
                                    player.maxHp || 0
                                ) + maxHp;

                            player.faction =
                                faction.name;

                            player.bloodline =
                                faction.name;

                            player.hp =
                                player.maxHp;

                            return player;
                        }
                    );
                }

                const skills =
                    Array.isArray(
                        faction.skills
                    )
                        ? faction.skills.join(
                            " • "
                        )
                        : "Chưa có";

                return interaction.update({

                    content:

                        `🌟 **THỨC TỈNH THÀNH CÔNG**\n\n` +

                        `🐾 Tứ Tượng: **${faction.name}**\n` +

                        `🩸 Huyết mạch: **${faction.name}**\n\n` +

                        `⚔️ Công kích: +${attack}\n` +

                        `🛡️ Phòng thủ: +${defense}\n` +

                        `💨 Tốc độ: +${speed}\n` +

                        `❤️ HP tối đa: +${maxHp}\n\n` +

                        `✨ **Kỹ năng:** ${skills}`,

                    embeds: [],

                    components: []
                });
            }

        } catch (error) {

            console.error(
                "❌ INTERACTION ERROR:",
                error
            );

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction
                        .followUp({
                            content:
                                `❌ ${
                                    error.message ||
                                    "Lỗi hệ thống"
                                }`,
                            ephemeral: true
                        });

                } else {

                    await interaction
                        .reply({
                            content:
                                `❌ ${
                                    error.message ||
                                    "Lỗi hệ thống"
                                }`,
                            ephemeral: true
                        });
                }

            } catch (_) {}
        }
    }
);

// =====================================================
// 🔐 LOGIN
// =====================================================

if (
    !process.env.DISCORD_TOKEN
) {

    console.error(
        "❌ THIẾU DISCORD_TOKEN!"
    );

    console.error(
        "📌 Railway → Variables → DISCORD_TOKEN"
    );

    process.exit(1);
}

client
    .login(
        process.env.DISCORD_TOKEN
    )
    .then(() => {

        console.log(
            "🔐 Đang kết nối Discord..."
        );

    })
    .catch(error => {

        console.error(
            "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:"
        );

        console.error(error);
    });
