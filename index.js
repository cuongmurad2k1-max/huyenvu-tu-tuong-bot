// ============================================================
// HUYỀN VŨ TỨ TƯỢNG BOT
// PREFIX VERSION - KHÔNG DÙNG SLASH COMMAND
// TỰ ĐỘNG LOAD COMMAND
// ============================================================

const fs = require("fs");
const path = require("path");

const {
    Client,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
    Collection
} = require("discord.js");

// ============================================================
// CONFIG
// ============================================================

const TOKEN = process.env.TOKEN || process.env.DISCORD_TOKEN;
const CLIENT_ID =
    process.env.CLIENT_ID ||
    process.env.DISCORD_CLIENT_ID;

const PREFIX = ".";

if (!TOKEN) {
    console.error("❌ THIẾU TOKEN!");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ THIẾU CLIENT_ID!");
    process.exit(1);
}

// ============================================================
// CLIENT
// ============================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],

    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

// ============================================================
// COMMAND MAP
// ============================================================

const commandMap = new Collection();

// chống load trùng
const loadedFiles = new Set();

// ============================================================
// HÀM ĐỆ QUY QUÉT FILE
// ============================================================

function getAllJSFiles(dir) {
    let result = [];

    if (!fs.existsSync(dir)) {
        return result;
    }

    let entries;

    try {
        entries = fs.readdirSync(dir, {
            withFileTypes: true
        });
    } catch (error) {
        console.error(
            `❌ Không thể đọc thư mục: ${dir}`,
            error.message
        );

        return result;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // bỏ node_modules
        if (entry.name === "node_modules") {
            continue;
        }

        // bỏ file index chính
        if (
            fullPath === __filename ||
            entry.name === "index.js"
        ) {
            continue;
        }

        if (entry.isDirectory()) {
            result = result.concat(
                getAllJSFiles(fullPath)
            );
        } else if (
            entry.isFile() &&
            entry.name.endsWith(".js")
        ) {
            result.push(fullPath);
        }
    }

    return result;
}

// ============================================================
// CHUẨN HÓA TÊN COMMAND
// ============================================================

function normalizeName(name) {
    if (!name) return null;

    return String(name)
        .trim()
        .toLowerCase()
        .replace(/^\//, "")
        .replace(/^\./, "");
}

// ============================================================
// TẠO COMMAND TỪ MODULE
// ============================================================

function getCommandNames(command) {
    const names = [];

    if (!command) {
        return names;
    }

    // ----------------------------------------
    // kiểu:
    // module.exports = {
    //   name: "boss",
    //   execute(...)
    // }
    // ----------------------------------------

    if (command.name) {
        names.push(command.name);
    }

    // ----------------------------------------
    // kiểu SlashCommandBuilder
    // data.name
    // ----------------------------------------

    if (
        command.data &&
        command.data.name
    ) {
        names.push(command.data.name);
    }

    // ----------------------------------------
    // aliases
    // ----------------------------------------

    if (Array.isArray(command.aliases)) {
        names.push(...command.aliases);
    }

    return [
        ...new Set(
            names
                .map(normalizeName)
                .filter(Boolean)
        )
    ];
}

// ============================================================
// FAKE INTERACTION
//
// Dùng để hỗ trợ những command cũ được viết theo:
// interaction.reply()
// interaction.editReply()
// interaction.user
// interaction.guild
// interaction.options.getString()
// ...
// ============================================================

function createFakeInteraction(message, args) {
    const optionsData = {};

    // ----------------------------------------
    // Parse:
    // .command abc 123
    // ----------------------------------------

    for (let i = 0; i < args.length; i++) {
        const value = args[i];

        // --name=value
        if (
            typeof value === "string" &&
            value.startsWith("--")
        ) {
            const text = value.substring(2);

            const equalIndex = text.indexOf("=");

            if (equalIndex !== -1) {
                const key = text
                    .substring(0, equalIndex)
                    .toLowerCase();

                const val = text.substring(
                    equalIndex + 1
                );

                optionsData[key] = val;
            }
        }
    }

    // ----------------------------------------
    // Options API
    // ----------------------------------------

    const options = {
        getString(name) {
            const key = String(name).toLowerCase();

            return optionsData[key] ?? null;
        },

        getInteger(name) {
            const value = this.getString(name);

            if (value === null) return null;

            const number = parseInt(value, 10);

            return Number.isNaN(number)
                ? null
                : number;
        },

        getNumber(name) {
            const value = this.getString(name);

            if (value === null) return null;

            const number = Number(value);

            return Number.isNaN(number)
                ? null
                : number;
        },

        getBoolean(name) {
            const value = this.getString(name);

            if (value === null) return null;

            return (
                value === true ||
                value === "true" ||
                value === "1"
            );
        },

        getUser() {
            return null;
        },

        getMember() {
            return null;
        },

        getChannel() {
            return null;
        },

        getRole() {
            return null;
        },

        getAttachment() {
            return null;
        },

        getSubcommand() {
            return null;
        },

        getSubcommandGroup() {
            return null;
        },

        data: []
    };

    // ----------------------------------------
    // reply
    // ----------------------------------------

    async function sendReply(payload) {
        if (
            typeof payload === "string"
        ) {
            return message.reply(payload);
        }

        if (
            payload &&
            typeof payload === "object"
        ) {
            return message.reply(payload);
        }

        return message.reply(
            "❌ Không có nội dung trả lời."
        );
    }

    // ----------------------------------------
    // fake interaction
    // ----------------------------------------

    const interaction = {
        id: message.id,

        type: 2,

        commandName: null,

        user: message.author,

        member: message.member,

        guild: message.guild,

        guildId: message.guildId,

        channel: message.channel,

        channelId: message.channelId,

        client: message.client,

        createdTimestamp:
            message.createdTimestamp,

        createdAt:
            message.createdAt,

        options,

        replied: false,

        deferred: false,

        isChatInputCommand() {
            return true;
        },

        isCommand() {
            return true;
        },

        isButton() {
            return false;
        },

        isStringSelectMenu() {
            return false;
        },

        isModalSubmit() {
            return false;
        },

        isAutocomplete() {
            return false;
        },

        async reply(payload) {
            this.replied = true;

            return sendReply(payload);
        },

        async editReply(payload) {
            this.replied = true;

            if (
                typeof payload === "string"
            ) {
                return message.channel.send(
                    payload
                );
            }

            return message.channel.send(
                payload
            );
        },

        async followUp(payload) {
            return message.channel.send(
                typeof payload === "string"
                    ? payload
                    : payload
            );
        },

        async deferReply() {
            this.deferred = true;

            return null;
        },

        async deleteReply() {
            return null;
        },

        async fetchReply() {
            return null;
        }
    };

    return interaction;
}

// ============================================================
// LOAD COMMAND
// ============================================================

function loadCommand(file) {
    if (loadedFiles.has(file)) {
        return 0;
    }

    loadedFiles.add(file);

    let command;

    try {
        // Xóa cache để reload ổn định
        delete require.cache[
            require.resolve(file)
        ];

        command = require(file);
    } catch (error) {
        console.error(
            `❌ Không thể load ${file}:`
        );

        console.error(
            error.message
        );

        return 0;
    }

    // ========================================================
    // MODULE EXPORT DEFAULT
    // ========================================================

    if (
        command &&
        command.default
    ) {
        command = command.default;
    }

    // ========================================================
    // KHÔNG PHẢI COMMAND
    // ========================================================

    if (
        !command ||
        typeof command !== "object"
    ) {
        console.log(
            `⚠️ Bỏ qua ${file}: không phải command`
        );

        return 0;
    }

    // ========================================================
    // PHẢI CÓ EXECUTE
    // ========================================================

    if (
        typeof command.execute !==
        "function"
    ) {
        console.log(
            `⚠️ Bỏ qua ${file}: không có execute()`
        );

        return 0;
    }

    // ========================================================
    // LẤY TÊN
    // ========================================================

    const names =
        getCommandNames(command);

    if (names.length === 0) {
        console.log(
            `⚠️ Bỏ qua ${file}: không có tên command`
        );

        return 0;
    }

    // ========================================================
    // ĐĂNG KÝ
    // ========================================================

    for (const name of names) {
        if (commandMap.has(name)) {
            console.log(
                `⚠️ Trùng command .${name}`
            );

            console.log(
                `   File mới: ${file}`
            );

            continue;
        }

        commandMap.set(name, {
            ...command,

            file,

            name
        });
    }

    return names.length;
}

// ============================================================
// LOAD TẤT CẢ COMMAND
// ============================================================

function loadAllCommands() {
    commandMap.clear();
    loadedFiles.clear();

    // --------------------------------------------------------
    // ROOT /app
    // --------------------------------------------------------

    const rootDir = path.join(
        process.cwd()
    );

    // --------------------------------------------------------
    // /app/commands
    // --------------------------------------------------------

    const commandsDir = path.join(
        process.cwd(),
        "commands"
    );

    let files = [];

    files = files.concat(
        getAllJSFiles(rootDir)
    );

    // commands có thể đã nằm trong root
    // nên không cần quét lại nếu trùng

    const uniqueFiles = [
        ...new Set(
            files.map(file =>
                path.resolve(file)
            )
        )
    ];

    console.log("");
    console.log(
        "========================================"
    );

    console.log(
        "📦 ĐANG LOAD COMMAND"
    );

    console.log(
        "========================================"
    );

    console.log(
        `📁 Tìm thấy ${uniqueFiles.length} file JS`
    );

    let totalLoaded = 0;

    for (const file of uniqueFiles) {
        const count =
            loadCommand(file);

        totalLoaded += count;
    }

    console.log(
        "========================================"
    );

    console.log(
        `📦 Đã load ${commandMap.size} commands`
    );

    console.log(
        `📚 ${commandMap.size} command prefix`
    );

    console.log(
        "========================================"
    );

    return totalLoaded;
}

// ============================================================
// XÓA SLASH COMMAND
// ============================================================

async function deleteAllSlashCommands() {
    console.log(
        "🗑️ Đang xóa toàn bộ Slash Commands..."
    );

    try {
        const rest = new REST({
            version: "10"
        }).setToken(TOKEN);

        // ----------------------------------------------------
        // GLOBAL COMMANDS
        // ----------------------------------------------------

        await rest.put(
            Routes.applicationCommands(
                CLIENT_ID
            ),
            {
                body: []
            }
        );

        console.log(
            "✅ Đã xóa toàn bộ lệnh / GLOBAL."
        );

        // ----------------------------------------------------
        // XÓA COMMAND Ở CÁC SERVER
        // ----------------------------------------------------

        const guilds =
            client.guilds.cache;

        for (const [
            guildId
        ] of guilds) {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(
                        CLIENT_ID,
                        guildId
                    ),
                    {
                        body: []
                    }
                );

                console.log(
                    `🗑️ Đã xóa / tại server ${guildId}`
                );
            } catch (error) {
                console.error(
                    `⚠️ Không thể xóa / tại server ${guildId}:`,
                    error.message
                );
            }
        }

        console.log(
            "✅ HOÀN TẤT XÓA SLASH COMMAND."
        );
    } catch (error) {
        console.error(
            "❌ Lỗi xóa Slash Commands:"
        );

        console.error(
            error.message
        );
    }
}

// ============================================================
// BOT READY
// ============================================================

client.once(
    "ready",
    async () => {
        console.log("");
        console.log(
            "========================================"
        );

        console.log(
            `🤖 ${client.user.tag} ONLINE`
        );

        console.log(
            `📌 PREFIX: ${PREFIX}`
        );

        console.log(
            `📦 COMMANDS: ${commandMap.size}`
        );

        console.log(
            `🌐 SERVERS: ${client.guilds.cache.size}`
        );

        console.log(
            "========================================"
        );

        // ----------------------------------------------------
        // XÓA / SAU KHI BOT ĐÃ LOGIN
        // ----------------------------------------------------

        await deleteAllSlashCommands();

        console.log("");
        console.log(
            "✅ BOT ĐANG CHẠY PREFIX."
        );

        console.log(
            `👉 Ví dụ: ${PREFIX}boss`
        );

        console.log(
            `👉 Ví dụ: ${PREFIX}tuvi`
        );

        console.log(
            `👉 Ví dụ: ${PREFIX}tuluyen`
        );
    }
);

// ============================================================
// PREFIX MESSAGE HANDLER
// ============================================================

client.on(
    "messageCreate",
    async message => {
        try {
            // ------------------------------------------------
            // BOT
            // ------------------------------------------------

            if (message.author.bot) {
                return;
            }

            // ------------------------------------------------
            // Không phải prefix
            // ------------------------------------------------

            if (
                !message.content.startsWith(
                    PREFIX
                )
            ) {
                return;
            }

            // ------------------------------------------------
            // TÁCH COMMAND
            // ------------------------------------------------

            const content =
                message.content
                    .slice(PREFIX.length)
                    .trim();

            if (!content) {
                return;
            }

            const parts =
                content.split(/\s+/);

            const commandName =
                normalizeName(
                    parts.shift()
                );

            const args = parts;

            // ------------------------------------------------
            // TÌM COMMAND
            // ------------------------------------------------

            const command =
                commandMap.get(
                    commandName
                );

            if (!command) {
                return;
            }

            // ------------------------------------------------
            // LOG
            // ------------------------------------------------

            console.log(
                `📨 ${message.author.tag} dùng .${commandName}`
            );

            // ------------------------------------------------
            // Nếu command có prefix execute
            // ------------------------------------------------

            if (
                command.prefixExecute &&
                typeof command.prefixExecute ===
                    "function"
            ) {
                await command.prefixExecute(
                    message,
                    args
                );

                return;
            }

            // ------------------------------------------------
            // TẠO FAKE INTERACTION
            // ------------------------------------------------

            const interaction =
                createFakeInteraction(
                    message,
                    args
                );

            interaction.commandName =
                commandName;

            // ------------------------------------------------
            // CHẠY COMMAND
            // ------------------------------------------------

            await command.execute(
                interaction
            );
        } catch (error) {
            console.error(
                `❌ Lỗi khi thực hiện .${message.content}:`
            );

            console.error(error);

            try {
                if (
                    !message.replied
                ) {
                    await message.reply(
                        "❌ Có lỗi xảy ra khi thực hiện lệnh."
                    );
                }
            } catch (_) {}
        }
    }
);

// ============================================================
// ERROR HANDLERS
// ============================================================

client.on(
    "error",
    error => {
        console.error(
            "❌ Discord Client Error:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    error => {
        console.error(
            "❌ Unhandled Promise Rejection:",
            error
        );
    }
);

process.on(
    "uncaughtException",
    error => {
        console.error(
            "❌ Uncaught Exception:",
            error
        );
    }
);

// ============================================================
// LOAD COMMAND TRƯỚC KHI LOGIN
// ============================================================

loadAllCommands();

// ============================================================
// LOGIN
// ============================================================

console.log(
    "🔐 Đang đăng nhập Discord..."
);

client.login(TOKEN).catch(
    error => {
        console.error(
            "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:"
        );

        console.error(
            error
        );

        process.exit(1);
    }
);
