const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================================================
// CONFIG
// ======================================================

const PREFIX = ".";

const TOKEN =
    process.env.DISCORD_TOKEN ||
    process.env.DISCORD_TOKEN_BOT ||
    process.env.TOKEN;

const CLIENT_ID =
    process.env.CLIENT_ID ||
    process.env.DISCORD_CLIENT_ID;

const GUILD_ID =
    process.env.GUILD_ID ||
    process.env.DISCORD_GUILD_ID;

if (!TOKEN) {
    console.error("❌ THIẾU DISCORD TOKEN!");
    console.error("Railway → Variables → DISCORD_TOKEN");
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

// Những file không phải command
const IGNORE_FILES = new Set([
    "index.js",
    "database.js",
    "config.js",
    "package.js"
]);

// Những thư mục không cần quét
const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    ".railway",
    ".github"
]);

// ======================================================
// LẤY TÊN COMMAND
// ======================================================

function getCommandName(command, filePath) {

    // name
    if (
        command &&
        typeof command.name === "string" &&
        command.name.trim()
    ) {
        return command.name.trim().toLowerCase();
    }

    // command
    if (
        command &&
        typeof command.command === "string" &&
        command.command.trim()
    ) {
        return command.command.trim().toLowerCase();
    }

    // data.name
    if (
        command &&
        command.data &&
        typeof command.data.name === "string" &&
        command.data.name.trim()
    ) {
        return command.data.name.trim().toLowerCase();
    }

    // data.toJSON().name
    try {

        if (
            command &&
            command.data &&
            typeof command.data.toJSON === "function"
        ) {

            const json = command.data.toJSON();

            if (
                json &&
                typeof json.name === "string" &&
                json.name.trim()
            ) {
                return json.name.trim().toLowerCase();
            }
        }

    } catch {}

    // Cuối cùng lấy tên file
    let base = path.basename(filePath, ".js");

    base = base
        .replace(/^\d+[_-]?/, "")
        .toLowerCase();

    if (base) {
        return base;
    }

    return null;
}

// ======================================================
// FAKE OPTIONS
// HỖ TRỢ COMMAND CŨ DÙNG interaction.options
// ======================================================

function createOptions(command, args) {

    const values = {};
    const definitions = [];

    try {

        let json = null;

        if (
            command &&
            command.data &&
            typeof command.data.toJSON === "function"
        ) {
            json = command.data.toJSON();
        }

        if (json && Array.isArray(json.options)) {

            for (const option of json.options) {

                if (!option) continue;

                if (
                    option.type === 1 ||
                    option.type === 2
                ) {
                    continue;
                }

                definitions.push(option);
            }
        }

    } catch {}

    // Gán args theo thứ tự option
    for (let i = 0; i < definitions.length; i++) {

        const option = definitions[i];

        if (args[i] === undefined) {
            continue;
        }

        let value = args[i];

        if (option.type === 4) {
            const n = Number(value);
            value = Number.isNaN(n) ? 0 : n;
        }

        if (option.type === 5) {
            value =
                value === "true" ||
                value === "1" ||
                value === "yes";
        }

        values[option.name] = value;
    }

    return {

        getString(name) {
            const value = values[name];
            return value === undefined ? null : String(value);
        },

        getInteger(name) {
            const value = values[name];
            if (value === undefined) return null;

            const n = Number(value);
            return Number.isNaN(n) ? null : n;
        },

        getNumber(name) {
            const value = values[name];
            if (value === undefined) return null;

            const n = Number(value);
            return Number.isNaN(n) ? null : n;
        },

        getBoolean(name) {
            const value = values[name];
            return value === undefined ? null : Boolean(value);
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

        get(name) {

            if (values[name] === undefined) {
                return null;
            }

            return {
                name,
                value: values[name]
            };
        },

        data: Object.entries(values).map(
            ([name, value]) => ({
                name,
                value
            })
        )
    };
}

// ======================================================
// TẠO INTERACTION GIẢ
// CHO COMMAND CŨ DÙNG interaction.reply()
// ======================================================

function createFakeInteraction(message, command, args) {

    let replied = false;
    let deferred = false;
    let lastReply = null;

    const fake = {

        // ----------------------------------------------
        // USER
        // ----------------------------------------------

        user: message.author,

        member: message.member,

        guild: message.guild,

        guildId: message.guildId,

        channel: message.channel,

        channelId: message.channelId,

        client: message.client,

        message,

        // ----------------------------------------------
        // OPTIONS
        // ----------------------------------------------

        options: createOptions(command, args),

        // ----------------------------------------------
        // STATES
        // ----------------------------------------------

        replied: false,

        deferred: false,

        // ----------------------------------------------
        // TYPE
        // ----------------------------------------------

        commandName: command.name,

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

        // ----------------------------------------------
        // REPLY
        // ----------------------------------------------

        async reply(payload) {

            replied = true;
            fake.replied = true;

            lastReply = payload;

            return await message.reply(payload);
        },

        // ----------------------------------------------
        // EDIT REPLY
        // ----------------------------------------------

        async editReply(payload) {

            if (lastReply && lastReply.edit) {
                return await lastReply.edit(payload);
            }

            if (replied) {

                try {
                    return await message.channel.send(payload);
                } catch {}
            }

            return await message.reply(payload);
        },

        // ----------------------------------------------
        // FOLLOW UP
        // ----------------------------------------------

        async followUp(payload) {
            return await message.channel.send(payload);
        },

        // ----------------------------------------------
        // DEFER
        // ----------------------------------------------

        async deferReply() {

            deferred = true;
            fake.deferred = true;

            return true;
        },

        // ----------------------------------------------
        // DELETE REPLY
        // ----------------------------------------------

        async deleteReply() {

            return true;
        },

        // ----------------------------------------------
        // FETCH REPLY
        // ----------------------------------------------

        async fetchReply() {

            return lastReply;
        },

        // ----------------------------------------------
        // EPHEMERAL
        // ----------------------------------------------

        ephemeral: false
    };

    return fake;
}

// ======================================================
// LOAD 276 COMMANDS
// QUÉT TOÀN BỘ /app
// ======================================================

function loadCommands(dir) {

    if (!fs.existsSync(dir)) {
        console.log(
            `⚠️ Không tồn tại: ${dir}`
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

        // ----------------------------------------------
        // FOLDER
        // ----------------------------------------------

        if (file.isDirectory()) {

            if (
                !IGNORE_DIRS.has(file.name)
            ) {
                loadCommands(fullPath);
            }

            continue;
        }

        // ----------------------------------------------
        // JS ONLY
        // ----------------------------------------------

        if (
            !file.name.endsWith(".js")
        ) {
            continue;
        }

        // ----------------------------------------------
        // IGNORE
        // ----------------------------------------------

        if (
            IGNORE_FILES.has(file.name)
        ) {
            continue;
        }

        try {

            delete require.cache[
                require.resolve(fullPath)
            ];

            const command =
                require(fullPath);

            if (!command) {
                skipped++;
                continue;
            }

            const name =
                getCommandName(
                    command,
                    fullPath
                );

            if (!name) {

                console.log(
                    `⚠️ Bỏ qua: ${file.name}`
                );

                skipped++;
                continue;
            }

            if (
                typeof command.execute !==
                "function"
            ) {

                console.log(
                    `⚠️ ${file.name}: không có execute()`
                );

                skipped++;
                continue;
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

            console.log(
                `✅ .${name} ← ${file.name}`
            );

        } catch (error) {

            errors++;

            console.error(
                `❌ Lỗi load ${file.name}`
            );

            console.error(
                error.message
            );
        }
    }
}

// ======================================================
// LOAD
// ======================================================

console.log("");
console.log(
    "========================================"
);

console.log(
    "📚 ĐANG LOAD PREFIX COMMANDS"
);

console.log(
    "========================================"
);

console.log(
    `📂 Thư mục: ${__dirname}`
);

loadCommands(__dirname);

console.log(
    "========================================"
);

console.log(
    `📦 Đã load: ${loaded} commands`
);

console.log(
    `⚠️ Bỏ qua: ${skipped} files`
);

console.log(
    `❌ Lỗi: ${errors} files`
);

console.log(
    "========================================"
);

// ======================================================
// XÓA TOÀN BỘ SLASH COMMAND
// ======================================================

async function deleteSlashCommands() {

    try {

        if (!CLIENT_ID) {

            console.log(
                "⚠️ Không có CLIENT_ID → bỏ qua xóa Slash Commands"
            );

            return;
        }

        const rest = new REST({
            version: "10"
        }).setToken(TOKEN);

        console.log(
            "🗑️ Đang xóa Global Slash Commands..."
        );

        await rest.put(
            Routes.applicationCommands(
                CLIENT_ID
            ),
            {
                body: []
            }
        );

        console.log(
            "✅ Đã xóa Global Slash Commands"
        );

        // ----------------------------------------------
        // XÓA SLASH COMMAND TRONG SERVER
        // ----------------------------------------------

        if (GUILD_ID) {

            console.log(
                "🗑️ Đang xóa Guild Slash Commands..."
            );

            await rest.put(
                Routes.applicationGuildCommands(
                    CLIENT_ID,
                    GUILD_ID
                ),
                {
                    body: []
                }
            );

            console.log(
                "✅ Đã xóa Guild Slash Commands"
            );
        }

    } catch (error) {

        console.error(
            "❌ Không xóa được Slash Commands:"
        );

        console.error(
            error.message
        );
    }
}

// ======================================================
// READY
// ======================================================

client.once("ready", async () => {

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
        "========================================"
    );

    // XÓA /
    await deleteSlashCommands();

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
        "🟢 BOT ĐÃ ONLINE"
    );

    console.log(
        `💬 Dùng ${PREFIX}help`
    );

    console.log("");
});

// ======================================================
// PREFIX MESSAGE
// ======================================================

client.on(
    "messageCreate",
    async (message) => {

        try {

            // Bot
            if (message.author.bot) {
                return;
            }

            // Không có prefix
            if (
                !message.content ||
                !message.content.startsWith(PREFIX)
            ) {
                return;
            }

            // ------------------------------------------
            // BỎ PREFIX
            // ------------------------------------------

            const content =
                message.content
                    .slice(PREFIX.length)
                    .trim();

            if (!content) {
                return;
            }

            // ------------------------------------------
            // ARGUMENTS
            // ------------------------------------------

            const args =
                content.split(/\s+/);

            const commandName =
                args
                    .shift()
                    .toLowerCase();

            // ------------------------------------------
            // TÌM COMMAND
            // ------------------------------------------

            const command =
                commandMap.get(commandName);

            if (!command) {

                await message.reply(
                    `❌ Không tìm thấy lệnh \`${PREFIX}${commandName}\``
                );

                return;
            }

            console.log(
                `📥 ${message.author.tag}: ${PREFIX}${commandName}`
            );

            // ------------------------------------------
            // KIỂU PREFIX
            // ------------------------------------------

            // Nếu command có execute
            if (
                typeof command.execute !==
                "function"
            ) {

                await message.reply(
                    "❌ Command chưa có execute()."
                );

                return;
            }

            // ------------------------------------------
            // DÙNG INTERACTION GIẢ
            // ------------------------------------------

            const interaction =
                createFakeInteraction(
                    message,
                    command,
                    args
                );

            /*
             * Gọi command theo kiểu interaction.
             *
             * Điều này cho phép nhiều command cũ
             * đang dùng:
             *
             * interaction.reply()
             * interaction.options.getString()
             * interaction.user
             * interaction.guild
             *
             * vẫn có thể chạy bằng:
             *
             * .command
             */

            await command.execute(
                interaction
            );

        } catch (error) {

            console.error("");
            console.error(
                "========================================"
            );

            console.error(
                "❌ LỖI COMMAND"
            );

            console.error(
                error
            );

            console.error(
                "========================================"
            );

            try {

                if (
                    !message.replied &&
                    !message.author.bot
                ) {

                    await message.reply(
                        "❌ Có lỗi xảy ra khi thực hiện lệnh."
                    );
                }

            } catch {}
        }
    }
);

// ======================================================
// DISCORD ERROR
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

// ======================================================
// WARNING
// ======================================================

client.on(
    "warn",
    (warning) => {

        console.warn(
            "⚠️ Discord Warning:"
        );

        console.warn(warning);
    }
);

// ======================================================
// UNHANDLED
// ======================================================

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
