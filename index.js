require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    Collection
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const PREFIX = ".";

if (!TOKEN) {
    console.error("❌ THIẾU TOKEN trong Railway Variables!");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ THIẾU CLIENT_ID trong Railway Variables!");
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
    ]
});


// ======================================================
// COMMAND MAP
// ======================================================

const commandMap = new Collection();


// ======================================================
// TÌM TẤT CẢ FILE JS
// ======================================================

function getJSFiles(dir) {

    let result = [];

    if (!fs.existsSync(dir)) {
        return result;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {

        const full = path.join(dir, item);

        let stat;

        try {
            stat = fs.statSync(full);
        } catch {
            continue;
        }

        if (stat.isDirectory()) {

            // Không quét node_modules
            if (item === "node_modules") {
                continue;
            }

            result = result.concat(
                getJSFiles(full)
            );

        } else if (
            item.endsWith(".js") &&
            item !== "index.js"
        ) {

            result.push(full);
        }
    }

    return result;
}


// ======================================================
// LOAD COMMAND
// ======================================================

function loadCommands() {

    commandMap.clear();

    let loaded = 0;
    let skipped = 0;
    let errors = 0;

    console.log("");
    console.log("======================================");
    console.log("📦 ĐANG LOAD PREFIX COMMAND");
    console.log("======================================");

    const files = getJSFiles(__dirname);

    console.log(
        `📁 Tìm thấy ${files.length} file JS`
    );

    for (const file of files) {

        try {

            delete require.cache[
                require.resolve(file)
            ];

            const command = require(file);

            if (!command) {
                skipped++;
                continue;
            }

            let name = null;

            // ------------------------------------------
            // PREFIX COMMAND
            // ------------------------------------------

            if (
                typeof command.name === "string"
            ) {
                name = command.name;
            }

            // ------------------------------------------
            // COMMAND CÓ DATA.NAME
            // ------------------------------------------

            if (
                !name &&
                command.data &&
                typeof command.data.name === "string"
            ) {
                name = command.data.name;
            }

            // ------------------------------------------
            // SLASH BUILDER
            // ------------------------------------------

            if (
                !name &&
                command.data &&
                typeof command.data.toJSON === "function"
            ) {

                try {

                    const data =
                        command.data.toJSON();

                    if (data.name) {
                        name = data.name;
                    }

                } catch {}
            }

            // ------------------------------------------
            // KHÔNG CÓ NAME
            // ------------------------------------------

            if (!name) {

                console.log(
                    `⚠️ Bỏ qua: ${path.relative(
                        __dirname,
                        file
                    )}`
                );

                skipped++;
                continue;
            }

            // ------------------------------------------
            // EXECUTE
            // ------------------------------------------

            if (
                typeof command.execute !== "function"
            ) {

                console.log(
                    `⚠️ Bỏ qua ${name}: không có execute()`
                );

                skipped++;
                continue;
            }

            name =
                name
                    .toLowerCase()
                    .trim();

            // ------------------------------------------
            // TRÙNG TÊN
            // ------------------------------------------

            if (commandMap.has(name)) {

                console.log(
                    `⚠️ Trùng .${name} → bỏ qua file sau`
                );

                skipped++;
                continue;
            }

            // ------------------------------------------
            // LƯU
            // ------------------------------------------

            commandMap.set(name, {
                ...command,
                name,
                file
            });

            loaded++;

            console.log(
                `✅ .${name}`
            );

        } catch (error) {

            errors++;

            console.log("");
            console.log(
                `❌ Lỗi file: ${path.relative(
                    __dirname,
                    file
                )}`
            );

            console.log(
                error.message
            );
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
        `❌ Lỗi ${errors} files`
    );
    console.log("======================================");
}


// ======================================================
// XÓA TOÀN BỘ SLASH COMMAND
// ======================================================

async function deleteAllSlashCommands() {

    const rest = new REST({
        version: "10"
    }).setToken(TOKEN);

    // --------------------------------------------------
    // GLOBAL
    // --------------------------------------------------

    try {

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

    } catch (error) {

        console.log(
            "❌ Lỗi xóa Global Slash Commands:"
        );

        console.log(
            error.message
        );
    }


    // --------------------------------------------------
    // TẤT CẢ SERVER
    // --------------------------------------------------

    try {

        const guilds =
            client.guilds.cache;

        console.log(
            `🗑️ Đang xóa Slash Commands của ${guilds.size} server...`
        );

        for (const [guildId, guild] of guilds) {

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
                    `✅ Đã xóa / trong server: ${guild.name}`
                );

            } catch (error) {

                console.log(
                    `❌ Không xóa được / trong server ${guild.name}`
                );

                console.log(
                    error.message
                );
            }
        }

    } catch (error) {

        console.log(
            "❌ Lỗi khi lấy danh sách server:"
        );

        console.log(
            error.message
        );
    }
}


// ======================================================
// FAKE INTERACTION
// ======================================================

function createInteraction(message, args) {

    const interaction = {

        user: message.author,

        member: message.member,

        guild: message.guild,

        guildId: message.guildId,

        channel: message.channel,

        channelId: message.channelId,

        client: client,

        message: message,

        options: {

            getString(name) {

                const index =
                    args.indexOf(`--${name}`);

                if (
                    index !== -1 &&
                    args[index + 1]
                ) {
                    return args[index + 1];
                }

                return null;
            },

            getInteger(name) {

                const value =
                    this.getString(name);

                if (value === null) {
                    return null;
                }

                const number =
                    parseInt(value);

                return Number.isNaN(number)
                    ? null
                    : number;
            },

            getNumber(name) {

                const value =
                    this.getString(name);

                if (value === null) {
                    return null;
                }

                const number =
                    Number(value);

                return Number.isNaN(number)
                    ? null
                    : number;
            },

            getBoolean(name) {

                const value =
                    this.getString(name);

                if (value === null) {
                    return null;
                }

                return (
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
            }
        },

        async reply(content) {

            if (
                typeof content === "object" &&
                content !== null
            ) {

                const copy = {
                    ...content
                };

                delete copy.ephemeral;

                return message.reply(copy);
            }

            return message.reply(
                String(content)
            );
        },

        async followUp(content) {

            return message.reply(content);
        },

        async deferReply() {
            return;
        },

        async editReply(content) {

            return message.reply(content);
        },

        async deleteReply() {
            return;
        },

        async fetchReply() {
            return null;
        },

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


// ======================================================
// MESSAGE CREATE
// ======================================================

client.on(
    "messageCreate",
    async message => {

        try {

            // Bỏ qua bot
            if (message.author.bot) {
                return;
            }

            // Không có prefix
            if (
                !message.content.startsWith(PREFIX)
            ) {
                return;
            }

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
                parts.shift()
                    .toLowerCase();

            const command =
                commandMap.get(commandName);

            if (!command) {
                return;
            }

            console.log(
                `💬 ${message.author.tag} dùng .${commandName}`
            );

            const interaction =
                createInteraction(
                    message,
                    parts
                );

            await command.execute(
                interaction
            );

        } catch (error) {

            console.error("");
            console.error(
                "❌ COMMAND ERROR:"
            );

            console.error(error);

            try {

                await message.reply(
                    "❌ Có lỗi xảy ra khi thực hiện lệnh."
                );

            } catch {}
        }
    }
);


// ======================================================
// READY
// ======================================================

client.once(
    "ready",
    async () => {

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

        console.log(
            `🏠 Servers: ${client.guilds.cache.size}`
        );

        console.log("======================================");

        await deleteAllSlashCommands();

        console.log("");
        console.log("======================================");
        console.log("🟢 PREFIX BOT ĐANG CHẠY");
        console.log("💬 Ví dụ: .boss");
        console.log("💬 Ví dụ: .combat");
        console.log("🚫 KHÔNG ĐĂNG KÝ SLASH COMMAND");
        console.log("======================================");
    }
);


// ======================================================
// ERROR
// ======================================================

client.on(
    "error",
    error => {
        console.error(
            "❌ Discord error:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    error => {
        console.error(
            "❌ Unhandled rejection:",
            error
        );
    }
);

process.on(
    "uncaughtException",
    error => {
        console.error(
            "❌ Uncaught exception:",
            error
        );
    }
);


// ======================================================
// LOAD
// ======================================================

loadCommands();


// ======================================================
// LOGIN
// ======================================================

console.log(
    "🔐 Đang đăng nhập Discord..."
);

client.login(TOKEN)
    .catch(error => {

        console.error(
            "❌ Đăng nhập Discord thất bại:"
        );

        console.error(error);

        process.exit(1);
    });
