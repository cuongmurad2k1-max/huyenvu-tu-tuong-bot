const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    REST,
    Routes,
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================================================
// CONFIG
// ======================================================

const PREFIX = ".";

const TOKEN =
    process.env.DISCORD_TOKEN ||
    process.env.TOKEN ||
    process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
    console.error("❌ KHÔNG TÌM THẤY TOKEN!");
    console.error("👉 Railway → Variables → DISCORD_TOKEN");
    process.exit(1);
}

// ======================================================
// CLIENT
// ======================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],

    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

// ======================================================
// COMMAND MAP
// ======================================================

const commandMap = new Collection();

let loaded = 0;
let skipped = 0;
let errors = 0;

// Tránh load những thư mục này
const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    ".github",
    ".railway",
    "database",
    "data",
    "logs",
    "storage",
    "tmp",
    "temp"
]);

// Tránh load những file này
const IGNORE_FILES = new Set([
    "index.js",
    "database.js",
    "config.js",
    "package.js"
]);

// ======================================================
// TÁCH ARGUMENT
// ======================================================

function parseArgs(text) {
    const result = [];

    const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;

    let match;

    while ((match = regex.exec(text)) !== null) {
        result.push(
            match[1] !== undefined
                ? match[1]
                : match[2] !== undefined
                    ? match[2]
                    : match[3]
        );
    }

    return result;
}

// ======================================================
// TÌM TÊN COMMAND
// ======================================================

function getCommandName(command, filePath) {

    let name = null;

    // Prefix command:
    // { name: "boss" }
    if (typeof command.name === "string") {
        name = command.name;
    }

    // Slash command:
    // { data: new SlashCommandBuilder().setName("boss") }
    if (
        !name &&
        command.data &&
        typeof command.data.name === "string"
    ) {
        name = command.data.name;
    }

    // Một số code dùng command:
    if (
        !name &&
        typeof command.command === "string"
    ) {
        name = command.command;
    }

    // Một số code dùng commandName:
    if (
        !name &&
        typeof command.commandName === "string"
    ) {
        name = command.commandName;
    }

    // Nếu file không có name thì lấy tên file
    // 01_combat.js -> combat
    if (!name) {

        let base = path.basename(
            filePath,
            ".js"
        );

        base = base.replace(
            /^\d+[_-]?/,
            ""
        );

        if (base) {
            name = base;
        }
    }

    if (!name) {
        return null;
    }

    return String(name)
        .trim()
        .toLowerCase();
}

// ======================================================
// LOAD COMMAND
// ======================================================

function loadCommands(dir) {

    if (!fs.existsSync(dir)) {
        console.log(
            `⚠️ Không tìm thấy: ${dir}`
        );
        return;
    }

    let files;

    try {

        files = fs.readdirSync(dir, {
            withFileTypes: true
        });

    } catch (error) {

        console.error(
            `❌ Không thể đọc: ${dir}`
        );

        return;
    }

    for (const file of files) {

        const fullPath = path.join(
            dir,
            file.name
        );

        // ==============================
        // FOLDER
        // ==============================

        if (file.isDirectory()) {

            if (
                IGNORE_DIRS.has(
                    file.name
                )
            ) {
                continue;
            }

            loadCommands(fullPath);

            continue;
        }

        // ==============================
        // FILE
        // ==============================

        if (!file.isFile()) {
            continue;
        }

        if (!file.name.endsWith(".js")) {
            continue;
        }

        if (
            IGNORE_FILES.has(
                file.name
            )
        ) {
            continue;
        }

        try {

            delete require.cache[
                require.resolve(fullPath)
            ];

            let command = require(fullPath);

            // Hỗ trợ export default
            if (
                command &&
                command.default
            ) {
                command = command.default;
            }

            // Hỗ trợ export array
            if (Array.isArray(command)) {

                for (
                    const item of command
                ) {

                    registerCommand(
                        item,
                        fullPath
                    );
                }

                continue;
            }

            registerCommand(
                command,
                fullPath
            );

        } catch (error) {

            errors++;

            console.error("");
            console.error(
                `❌ LỖI LOAD: ${fullPath}`
            );
            console.error(
                error.message
            );
        }
    }
}

// ======================================================
// REGISTER COMMAND
// ======================================================

function registerCommand(
    command,
    fullPath
) {

    if (!command) {
        skipped++;
        return;
    }

    const name =
        getCommandName(
            command,
            fullPath
        );

    if (!name) {

        skipped++;

        console.log(
            `⚠️ Bỏ qua: ${fullPath}`
        );

        return;
    }

    if (
        typeof command.execute !==
        "function"
    ) {

        skipped++;

        console.log(
            `⚠️ ${name}: không có execute()`
        );

        return;
    }

    // Nếu trùng tên thì command sau ghi đè
    if (commandMap.has(name)) {

        console.log(
            `⚠️ Trùng command .${name} → dùng file mới`
        );
    }

    commandMap.set(
        name,
        {
            ...command,
            name,
            file: fullPath
        }
    );

    loaded++;
}

// ======================================================
// LOAD TẤT CẢ JS TRONG /app
// ======================================================

console.log("");
console.log("========================================");
console.log("📚 ĐANG LOAD COMMAND");
console.log("========================================");
console.log(`📁 Thư mục: ${__dirname}`);
console.log(`🔑 Prefix: ${PREFIX}`);
console.log("");

loadCommands(__dirname);

console.log("");
console.log("========================================");
console.log(`📦 ĐÃ LOAD: ${commandMap.size} COMMANDS`);
console.log(`⚠️ BỎ QUA: ${skipped} FILES`);
console.log(`❌ LỖI: ${errors} FILES`);
console.log("========================================");

// ======================================================
// TẠO OPTIONS CHO SLASH COMMAND CŨ
// ======================================================

function createOptions(command, args) {

    const values = {};

    let definitions = [];

    try {

        if (
            command.data &&
            Array.isArray(
                command.data.options
            )
        ) {
            definitions =
                command.data.options;
        }

    } catch {}

    // Nếu không có definition
    // vẫn cho phép getString
    for (
        let i = 0;
        i < args.length;
        i++
    ) {

        const definition =
            definitions[i];

        if (definition) {

            const name =
                definition.name;

            const type =
                definition.type;

            let value =
                args[i];

            // Discord ApplicationCommandOptionType:
            // 3 = String
            // 4 = Integer
            // 5 = Boolean
            // 6 = User
            // 7 = Channel
            // 8 = Role
            // 10 = Number

            if (type === 4) {
                value = parseInt(
                    value,
                    10
                );
            }

            if (type === 10) {
                value = parseFloat(
                    value
                );
            }

            if (type === 5) {

                value =
                    value === "true" ||
                    value === "1" ||
                    value === "yes" ||
                    value === "on";
            }

            values[name] = value;
        }
    }

    return {

        getString(name) {

            if (
                values[name] !== undefined
            ) {
                return String(
                    values[name]
                );
            }

            return null;
        },

        getInteger(name) {

            const value =
                values[name];

            if (
                value === undefined
            ) {
                return null;
            }

            return parseInt(
                value,
                10
            );
        },

        getNumber(name) {

            const value =
                values[name];

            if (
                value === undefined
            ) {
                return null;
            }

            return Number(value);
        },

        getBoolean(name) {

            const value =
                values[name];

            if (
                value === undefined
            ) {
                return null;
            }

            return Boolean(value);
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

        getMentionable() {
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
        }
    };
}

// ======================================================
// TẠO FAKE INTERACTION
// CHO COMMAND CŨ VIẾT THEO SLASH
// ======================================================

function createInteraction(
    message,
    args,
    command
) {

    let replied = false;
    let deferred = false;

    const interaction = {

        // ==========================
        // BASIC
        // ==========================

        id: message.id,

        applicationId:
            client.application?.id,

        user:
            message.author,

        member:
            message.member,

        guild:
            message.guild,

        guildId:
            message.guildId,

        channel:
            message.channel,

        channelId:
            message.channelId,

        client,

        message,

        createdTimestamp:
            message.createdTimestamp,

        createdAt:
            message.createdAt,

        // ==========================
        // COMMAND
        // ==========================

        commandName:
            command.name,

        commandId: null,

        options:
            createOptions(
                command,
                args
            ),

        // ==========================
        // FLAGS
        // ==========================

        get replied() {
            return replied;
        },

        get deferred() {
            return deferred;
        },

        isChatInputCommand() {
            return true;
        },

        isCommand() {
            return true;
        },

        // ==========================
        // REPLY
        // ==========================

        async reply(content) {

            replied = true;

            if (
                typeof content ===
                "string"
            ) {
                return message.reply(
                    content
                );
            }

            if (!content) {
                return message.reply(
                    "✅"
                );
            }

            return message.reply(
                normalizeReply(
                    content
                )
            );
        },

        // ==========================
        // EDIT REPLY
        // ==========================

        async editReply(content) {

            const data =
                normalizeReply(
                    content
                );

            if (
                !message.repliedMessage
            ) {
                return message.reply(
                    data
                );
            }

            return message.repliedMessage.edit(
                data
            );
        },

        // ==========================
        // DEFER
        // ==========================

        async deferReply() {

            deferred = true;

            return message.channel.sendTyping();
        },

        // ==========================
        // FOLLOW UP
        // ==========================

        async followUp(content) {

            return message.channel.send(
                normalizeReply(
                    content
                )
            );
        },

        // ==========================
        // DELETE REPLY
        // ==========================

        async deleteReply() {
            return;
        },

        // ==========================
        // FETCH REPLY
        // ==========================

        async fetchReply() {
            return message;
        },

        // ==========================
        // SHOW MODAL
        // ==========================

        async showModal() {

            return message.reply(
                "❌ Command này yêu cầu Modal Discord và chưa thể chạy bằng prefix."
            );
        }
    };

    return interaction;
}

// ======================================================
// NORMALIZE REPLY
// ======================================================

function normalizeReply(content) {

    if (
        typeof content ===
        "string"
    ) {
        return {
            content
        };
    }

    if (!content) {
        return {
            content: "✅"
        };
    }

    const result = {
        ...content
    };

    // ephemeral không có tác dụng
    // với message thường
    delete result.ephemeral;

    // Một số command dùng flags
    // chỉ phù hợp interaction
    delete result.flags;

    return result;
}

// ======================================================
// XÓA TOÀN BỘ SLASH COMMAND
// ======================================================

async function deleteSlashCommands() {

    try {

        if (!client.application) {
            return;
        }

        console.log("");
        console.log(
            "🗑️ ĐANG XÓA GLOBAL SLASH COMMANDS..."
        );

        await client.application.commands.set(
            []
        );

        console.log(
            "✅ ĐÃ XÓA GLOBAL SLASH COMMANDS"
        );

        // Xóa slash command trong từng server
        for (
            const guild of client.guilds.cache.values()
        ) {

            try {

                await guild.commands.set(
                    []
                );

                console.log(
                    `✅ Đã xóa slash trong server: ${guild.name}`
                );

            } catch (error) {

                console.error(
                    `⚠️ Không xóa được slash ở ${guild.name}:`,
                    error.message
                );
            }
        }

    } catch (error) {

        console.error(
            "❌ Lỗi xóa Slash Commands:",
            error.message
        );
    }
}

// ======================================================
// READY
// ======================================================

client.once(
    "ready",
    async () => {

        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            "🤖 HUYỀN VŨ TỨ TƯỢNG BOT"
        );
        console.log(
            "========================================"
        );

        console.log(
            `👤 Bot: ${client.user.tag}`
        );

        console.log(
            `🆔 ID: ${client.user.id}`
        );

        console.log(
            `🔑 Prefix: ${PREFIX}`
        );

        console.log(
            `📦 Commands: ${commandMap.size}`
        );

        console.log(
            `🌐 Servers: ${client.guilds.cache.size}`
        );

        console.log(
            "========================================"
        );

        // Xóa slash
        await deleteSlashCommands();

        // Presence
        client.user.setPresence({
            activities: [
                {
                    name:
                        `${PREFIX}help | Huyền Vũ Tứ Tượng`,
                    type: 0
                }
            ],
            status: "online"
        });

        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            `🟢 BOT ONLINE`
        );
        console.log(
            `🔑 Dùng lệnh: ${PREFIX}help`
        );
        console.log(
            `📦 ${commandMap.size} commands`
        );
        console.log(
            "========================================"
        );
    }
);

// ======================================================
// PREFIX COMMAND
// ======================================================

client.on(
    "messageCreate",
    async (message) => {

        try {

            // Không xử lý bot
            if (
                message.author.bot
            ) {
                return;
            }

            // Không có prefix
            if (
                !message.content.startsWith(
                    PREFIX
                )
            ) {
                return;
            }

            const raw =
                message.content
                    .slice(
                        PREFIX.length
                    )
                    .trim();

            if (!raw) {
                return;
            }

            // Parse args
            const args =
                parseArgs(raw);

            if (!args.length) {
                return;
            }

            // Command name
            const commandName =
                args
                    .shift()
                    .toLowerCase();

            // Tìm command
            const command =
                commandMap.get(
                    commandName
                );

            if (!command) {

                console.log(
                    `⚠️ Không tìm thấy command: .${commandName}`
                );

                return;
            }

            console.log(
                `📥 ${message.author.tag}: .${commandName}`
            );

            // ==========================================
            // KIỂM TRA EXECUTE
            // ==========================================

            if (
                typeof command.execute !==
                "function"
            ) {

                await message.reply(
                    "❌ Command này không có execute()."
                );

                return;
            }

            // ==========================================
            // CHẠY COMMAND
            // ==========================================

            /*
             * Cố gắng tương thích cả 2 kiểu:
             *
             * 1. Prefix:
             * execute(message, args)
             *
             * 2. Slash:
             * execute(interaction)
             *
             * Nếu command có data.name
             * => xem là slash command cũ
             */

            if (
                command.data
            ) {

                const interaction =
                    createInteraction(
                        message,
                        args,
                        command
                    );

                await command.execute(
                    interaction
                );

            } else {

                await command.execute(
                    message,
                    args
                );
            }

        } catch (error) {

            console.error("");
            console.error(
                "========================================"
            );
            console.error(
                "❌ LỖI KHI CHẠY PREFIX COMMAND"
            );
            console.error(
                "========================================"
            );
            console.error(error);
            console.error(
                "========================================"
            );

            try {

                await message.reply(
                    "❌ Có lỗi xảy ra khi thực hiện lệnh."
                );

            } catch {}
        }
    }
);

// ======================================================
// ERROR HANDLERS
// ======================================================

client.on(
    "error",
    (error) => {

        console.error(
            "❌ Discord Client Error:"
        );

        console.error(error);
    }
);

process.on(
    "unhandledRejection",
    (error) => {

        console.error(
            "❌ Unhandled Rejection:"
        );

        console.error(error);
    }
);

process.on(
    "uncaughtException",
    (error) => {

        console.error(
            "❌ Uncaught Exception:"
        );

        console.error(error);
    }
);

// ======================================================
// LOGIN
// ======================================================

console.log(
    "🔐 Đang đăng nhập Discord..."
);

client.login(TOKEN)
    .then(() => {

        console.log(
            "✅ Login Discord thành công"
        );

    })
    .catch((error) => {

        console.error(
            "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD!"
        );

        console.error(error);

        process.exit(1);
    });
