require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// =====================================================
// CONFIG
// =====================================================

const PREFIX = ".";

const TOKEN = process.env.TOKEN || process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || process.env.CLIENTID;
const GUILD_ID = process.env.GUILD_ID || process.env.DISCORD_GUILD_ID;

// =====================================================
// CHECK ENV
// =====================================================

if (!TOKEN) {
    console.error("❌ THIẾU TOKEN!");
    console.error("Railway Variables phải có:");
    console.error("TOKEN=Bot_Token_Cua_Ban");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.warn("⚠️ Không có CLIENT_ID.");
    console.warn("Bot vẫn có thể chạy prefix,");
    console.warn("nhưng không thể tự xóa Slash Command.");
}

// =====================================================
// CLIENT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =====================================================
// COMMAND MAP
// =====================================================

// CHỈ KHAI BÁO 1 LẦN
const commandMap = new Collection();

// =====================================================
// TẠO FAKE INTERACTION
// Dùng để hỗ trợ các command cũ viết theo kiểu
// SlashCommand / interaction.
// =====================================================

function createFakeInteraction(message, commandName, args) {

    let replied = false;
    let deferred = false;
    let lastMessage = null;

    const optionValues = {};

    // ---------------------------------------------
    // Parser đơn giản cho:
    // .command abc
    // .command abc 123
    // .command --name abc
    // ---------------------------------------------

    for (let i = 0; i < args.length; i++) {

        const value = args[i];

        if (value.startsWith("--")) {

            const key = value
                .slice(2)
                .toLowerCase();

            const next = args[i + 1];

            if (next && !next.startsWith("--")) {
                optionValues[key] = next;
                i++;
            } else {
                optionValues[key] = true;
            }
        }
    }

    function getOption(name) {

        const key = String(name).toLowerCase();

        return optionValues[key] ?? null;
    }

    const interaction = {

        // -----------------------------------------
        // USER
        // -----------------------------------------

        user: message.author,

        member: message.member,

        guild: message.guild,

        guildId: message.guildId,

        channel: message.channel,

        channelId: message.channelId,

        client: client,

        applicationId: CLIENT_ID,

        id: message.id,

        createdTimestamp: message.createdTimestamp,

        // -----------------------------------------
        // OPTIONS
        // -----------------------------------------

        options: {

            getString(name) {
                const value = getOption(name);
                return value === null ? null : String(value);
            },

            getInteger(name) {
                const value = getOption(name);

                if (value === null) {
                    return null;
                }

                const number = Number(value);

                return Number.isNaN(number)
                    ? null
                    : number;
            },

            getNumber(name) {
                const value = getOption(name);

                if (value === null) {
                    return null;
                }

                const number = Number(value);

                return Number.isNaN(number)
                    ? null
                    : number;
            },

            getBoolean(name) {
                const value = getOption(name);

                if (value === null) {
                    return null;
                }

                if (
                    value === true ||
                    value === "true" ||
                    value === "1"
                ) {
                    return true;
                }

                return false;
            },

            getUser(name) {
                return null;
            },

            getMember(name) {
                return null;
            },

            getChannel(name) {
                return null;
            },

            getRole(name) {
                return null;
            },

            getAttachment(name) {
                return null;
            },

            getSubcommand(required = false) {
                return null;
            },

            getSubcommandGroup(required = false) {
                return null;
            }
        },

        // -----------------------------------------
        // REPLY
        // -----------------------------------------

        async reply(content) {

            replied = true;

            if (
                typeof content === "object" &&
                content !== null
            ) {

                if (content.ephemeral) {
                    delete content.ephemeral;
                }

                lastMessage =
                    await message.reply(content);

            } else {

                lastMessage =
                    await message.reply(
                        String(content)
                    );
            }

            return lastMessage;
        },

        // -----------------------------------------
        // EDIT REPLY
        // -----------------------------------------

        async editReply(content) {

            if (lastMessage) {

                if (
                    typeof content === "object" &&
                    content !== null
                ) {
                    return lastMessage.edit(content);
                }

                return lastMessage.edit(
                    String(content)
                );
            }

            return message.reply(content);
        },

        // -----------------------------------------
        // DEFER
        // -----------------------------------------

        async deferReply() {

            deferred = true;

            return;
        },

        // -----------------------------------------
        // FOLLOW UP
        // -----------------------------------------

        async followUp(content) {

            return message.reply(content);
        },

        // -----------------------------------------
        // DELETE REPLY
        // -----------------------------------------

        async deleteReply() {

            if (lastMessage) {
                try {
                    await lastMessage.delete();
                } catch {}
            }
        },

        // -----------------------------------------
        // FETCH REPLY
        // -----------------------------------------

        async fetchReply() {

            return lastMessage;
        },

        // -----------------------------------------
        // DEFER UPDATE
        // -----------------------------------------

        async deferUpdate() {
            deferred = true;
        },

        async update(content) {

            if (lastMessage) {
                return lastMessage.edit(content);
            }

            return message.reply(content);
        },

        // -----------------------------------------
        // MESSAGE
        // -----------------------------------------

        message,

        // -----------------------------------------
        // FLAGS
        // -----------------------------------------

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
        }
    };

    return interaction;
}

// =====================================================
// TÌM FILE COMMAND
// =====================================================

function getAllJSFiles(dir) {

    let files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    for (const item of fs.readdirSync(dir)) {

        const fullPath = path.join(dir, item);

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {

            files = files.concat(
                getAllJSFiles(fullPath)
            );

        } else if (
            item.endsWith(".js") &&
            item !== "index.js"
        ) {

            files.push(fullPath);
        }
    }

    return files;
}

// =====================================================
// LOAD COMMANDS
// =====================================================

function loadCommands() {

    commandMap.clear();

    const root = __dirname;

    const files = getAllJSFiles(root);

    let loaded = 0;
    let skipped = 0;
    let failed = 0;

    console.log("");
    console.log("======================================");
    console.log("📦 ĐANG LOAD COMMAND");
    console.log("======================================");

    for (const file of files) {

        try {

            // Không load file hệ thống
            if (
                file.includes(
                    `${path.sep}node_modules${path.sep}`
                )
            ) {
                continue;
            }

            const relative =
                path.relative(root, file);

            // Xóa cache để Railway load code mới
            delete require.cache[
                require.resolve(file)
            ];

            const command = require(file);

            if (!command) {
                skipped++;
                continue;
            }

            // -------------------------------------
            // Tìm tên command
            // -------------------------------------

            let name = null;

            // Kiểu prefix
            if (typeof command.name === "string") {
                name = command.name;
            }

            // Kiểu:
            // data.name
            if (
                !name &&
                command.data &&
                typeof command.data.name === "string"
            ) {
                name = command.data.name;
            }

            // Kiểu SlashCommandBuilder
            if (
                !name &&
                command.data &&
                typeof command.data.toJSON === "function"
            ) {

                try {

                    const json =
                        command.data.toJSON();

                    if (json.name) {
                        name = json.name;
                    }

                } catch {}
            }

            if (!name) {

                console.warn(
                    `⚠️ Bỏ qua ${relative}: không tìm thấy tên command`
                );

                skipped++;

                continue;
            }

            name =
                String(name)
                    .toLowerCase()
                    .trim();

            // -------------------------------------
            // Tìm execute
            // -------------------------------------

            if (
                typeof command.execute !== "function"
            ) {

                console.warn(
                    `⚠️ Bỏ qua ${relative}: không có execute()`
                );

                skipped++;

                continue;
            }

            // -------------------------------------
            // DUPLICATE
            // -------------------------------------

            if (commandMap.has(name)) {

                console.warn(
                    `⚠️ Trùng command .${name}`
                );

                console.warn(
                    `   File mới: ${relative}`
                );

                console.warn(
                    `   Giữ command đã load trước.`
                );

                skipped++;

                continue;
            }

            // -------------------------------------
            // LƯU COMMAND
            // -------------------------------------

            commandMap.set(name, {
                ...command,
                name,
                file
            });

            loaded++;

            console.log(
                `✅ .${name} ← ${relative}`
            );

        } catch (error) {

            failed++;

            console.error("");
            console.error(
                `❌ Không thể load ${file}`
            );

            console.error(
                error.message
            );

            console.error("");
        }
    }

    console.log("");
    console.log("======================================");
    console.log(
        `📦 Đã load ${loaded} commands`
    );
    console.log(
        `⚠️ Bỏ qua ${skipped} files`
    );
    console.log(
        `❌ Lỗi ${failed} files`
    );
    console.log("======================================");
    console.log("");

    return loaded;
}

// =====================================================
// XÓA SLASH COMMAND
// =====================================================

async function deleteSlashCommands() {

    if (!CLIENT_ID) {

        console.warn(
            "⚠️ Không có CLIENT_ID → không thể tự xóa /"
        );

        return;
    }

    try {

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
            "✅ Đã xóa Global Slash Commands."
        );

        // -----------------------------------------
        // XÓA COMMAND TRONG SERVER
        // -----------------------------------------

        if (GUILD_ID) {

            console.log(
                `🗑️ Đang xóa Slash Commands trong server ${GUILD_ID}...`
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
                "✅ Đã xóa Slash Commands trong server."
            );

        } else {

            console.log(
                "ℹ️ Không có GUILD_ID → bỏ qua xóa command riêng của server."
            );
        }

    } catch (error) {

        console.error(
            "❌ Không thể xóa Slash Commands:"
        );

        console.error(
            error.message
        );
    }
}

// =====================================================
// READY
// =====================================================

client.once("ready", async () => {

    console.log("");
    console.log("======================================");
    console.log("🤖 HUYỀN VŨ TƯ TƯỞNG BOT");
    console.log("======================================");

    console.log(
        `👤 Bot: ${client.user.tag}`
    );

    console.log(
        `🆔 ID: ${client.user.id}`
    );

    console.log(
        `📌 Prefix: ${PREFIX}`
    );

    console.log(
        `📦 Commands: ${commandMap.size}`
    );

    console.log("======================================");
    console.log("");

    // Xóa slash command cũ
    await deleteSlashCommands();

    console.log("");
    console.log("======================================");
    console.log("🟢 BOT ĐANG HOẠT ĐỘNG");
    console.log(`💬 Dùng: ${PREFIX}tenlenh`);
    console.log("🚫 Không đăng ký Slash Command mới");
    console.log("======================================");
    console.log("");
});

// =====================================================
// MESSAGE HANDLER
// =====================================================

client.on("messageCreate", async (message) => {

    try {

        // -----------------------------------------
        // BỎ QUA BOT
        // -----------------------------------------

        if (message.author.bot) {
            return;
        }

        // -----------------------------------------
        // BỎ QUA KHÔNG PHẢI PREFIX
        // -----------------------------------------

        if (
            !message.content.startsWith(PREFIX)
        ) {
            return;
        }

        // -----------------------------------------
        // PARSE
        // -----------------------------------------

        const content =
            message.content
                .slice(PREFIX.length)
                .trim();

        if (!content) {
            return;
        }

        const args =
            content.split(/\s+/);

        const commandName =
            args.shift()
                .toLowerCase();

        // -----------------------------------------
        // FIND
        // -----------------------------------------

        const command =
            commandMap.get(commandName);

        if (!command) {
            return;
        }

        console.log(
            `💬 ${message.author.tag}: ${message.content}`
        );

        // -----------------------------------------
        // PREFIX COMMAND
        // -----------------------------------------

        const fakeInteraction =
            createFakeInteraction(
                message,
                commandName,
                args
            );

        // -----------------------------------------
        // EXECUTE
        // -----------------------------------------

        await command.execute(
            fakeInteraction
        );

    } catch (error) {

        console.error("");
        console.error(
            `❌ Lỗi command: ${message.content}`
        );

        console.error(error);

        try {

            if (!message.replied) {

                await message.reply(
                    "❌ Có lỗi xảy ra khi thực hiện lệnh."
                );

            }

        } catch {}
    }
});

// =====================================================
// ERROR HANDLERS
// =====================================================

client.on(
    "error",
    (error) => {
        console.error(
            "❌ Discord Client Error:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    (error) => {
        console.error(
            "❌ Unhandled Rejection:",
            error
        );
    }
);

process.on(
    "uncaughtException",
    (error) => {
        console.error(
            "❌ Uncaught Exception:",
            error
        );
    }
);

// =====================================================
// LOAD
// =====================================================

loadCommands();

// =====================================================
// LOGIN
// =====================================================

console.log(
    "🔐 Đang đăng nhập Discord..."
);

client.login(TOKEN).catch((error) => {

    console.error(
        "❌ ĐĂNG NHẬP DISCORD THẤT BẠI:"
    );

    console.error(
        error
    );

    process.exit(1);
});
