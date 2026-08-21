const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================================================
// CONFIG
// ======================================================

const PREFIX = ".";

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error("❌ KHÔNG TÌM THẤY DISCORD_TOKEN!");
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

// ======================================================
// FILE KHÔNG LOAD
// ======================================================

const IGNORE_FILES = new Set([
    "index.js",
    "database.js",
    "db.js"
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
        return command.name
            .trim()
            .toLowerCase();
    }

    // data.name
    if (
        command &&
        command.data &&
        typeof command.data.name === "string" &&
        command.data.name.trim()
    ) {
        return command.data.name
            .trim()
            .toLowerCase();
    }

    // command
    if (
        command &&
        typeof command.command === "string" &&
        command.command.trim()
    ) {
        return command.command
            .trim()
            .toLowerCase();
    }

    // filename
    let fileName = path.basename(filePath, ".js");

    // 01_combat.js -> combat
    fileName = fileName.replace(
        /^\d+[_-]?/,
        ""
    );

    if (fileName) {
        return fileName.toLowerCase();
    }

    return null;
}

// ======================================================
// OPTION HELPER
// ======================================================

function makeOptions(command, args) {

    const values = {};

    // ----------------------------------------------
    // Lấy option definitions từ SlashCommandBuilder
    // ----------------------------------------------

    let definitions = [];

    try {

        if (
            command &&
            command.data &&
            typeof command.data.toJSON === "function"
        ) {

            const data = command.data.toJSON();

            if (Array.isArray(data.options)) {
                definitions = data.options;
            }
        }

    } catch {}

    // ----------------------------------------------
    // Nếu không có definition
    // ----------------------------------------------

    if (!definitions.length) {

        args.forEach((value, index) => {

            values[index] = value;

        });

    } else {

        let argIndex = 0;

        for (const option of definitions) {

            // Subcommand
            if (
                option.type === 1 ||
                option.type === 2
            ) {
                continue;
            }

            const value = args[argIndex];

            if (value !== undefined) {

                values[option.name] = value;

                argIndex++;
            }
        }

        // thêm index để tương thích command đơn giản
        args.forEach((value, index) => {

            if (values[index] === undefined) {
                values[index] = value;
            }

        });
    }

    // ==================================================
    // OBJECT OPTIONS
    // ==================================================

    return {

        getString(name) {

            const value = values[name];

            if (value === undefined) {
                return null;
            }

            return String(value);
        },

        getInteger(name) {

            const value = values[name];

            if (value === undefined) {
                return null;
            }

            const number = parseInt(value, 10);

            return Number.isNaN(number)
                ? null
                : number;
        },

        getNumber(name) {

            const value = values[name];

            if (value === undefined) {
                return null;
            }

            const number = Number(value);

            return Number.isNaN(number)
                ? null
                : number;
        },

        getBoolean(name) {

            const value = values[name];

            if (value === undefined) {
                return null;
            }

            if (
                value === true ||
                value === "true" ||
                value === "1"
            ) {
                return true;
            }

            if (
                value === false ||
                value === "false" ||
                value === "0"
            ) {
                return false;
            }

            return null;
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

        getMentionable() {
            return null;
        },

        getSubcommand() {

            if (args.length > 0) {
                return args[0];
            }

            return null;
        },

        getSubcommandGroup() {
            return null;
        },

        get(name) {

            const value = values[name];

            if (value === undefined) {
                return null;
            }

            return {
                name,
                value
            };
        }
    };
}

// ======================================================
// TẠO PREFIX INTERACTION
// ======================================================

function createPrefixInteraction(message, args, command) {

    const options = makeOptions(
        command,
        args
    );

    let replied = false;

    const interaction = {

        // ------------------------------------------
        // BASIC
        // ------------------------------------------

        id: message.id,

        applicationId:
            client.application?.id ||
            client.user?.id,

        user: message.author,

        member: message.member,

        guild: message.guild,

        guildId: message.guildId,

        channel: message.channel,

        channelId: message.channelId,

        client,

        createdAt: message.createdAt,

        createdTimestamp:
            message.createdTimestamp,

        token: null,

        commandName: command.name,

        commandId: null,

        // ------------------------------------------
        // OPTIONS
        // ------------------------------------------

        options,

        // ------------------------------------------
        // REPLY
        // ------------------------------------------

        async reply(content) {

            replied = true;

            if (
                typeof content === "string"
            ) {
                return message.reply(content);
            }

            return message.reply(content);
        },

        async editReply(content) {

            return message.edit({
                content:
                    typeof content === "string"
                        ? content
                        : content.content
            });
        },

        async deleteReply() {

            try {
                await message.delete();
            } catch {}
        },

        async followUp(content) {

            return message.channel.send(content);
        },

        async deferReply() {

            replied = true;

            return null;
        },

        async fetchReply() {

            return message;
        },

        // ------------------------------------------
        // FLAGS
        // ------------------------------------------

        get replied() {
            return replied;
        },

        get deferred() {
            return false;
        },

        // ------------------------------------------
        // MESSAGE
        // ------------------------------------------

        message,

        // ------------------------------------------
        // PERMISSIONS
        // ------------------------------------------

        memberPermissions:
            message.member?.permissions || null,

        // ------------------------------------------
        // OTHER
        // ------------------------------------------

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
// LOAD COMMAND FILE
// ======================================================

function loadCommandFile(fullPath) {

    try {

        delete require.cache[
            require.resolve(fullPath)
        ];

        const command = require(fullPath);

        if (!command) {

            skipped++;

            return;
        }

        // ----------------------------------------------
        // Tìm tên
        // ----------------------------------------------

        const name = getCommandName(
            command,
            fullPath
        );

        if (!name) {

            skipped++;

            console.log(
                `⚠️ Bỏ qua ${fullPath}: không có tên command`
            );

            return;
        }

        // ----------------------------------------------
        // Phải có execute
        // ----------------------------------------------

        if (
            typeof command.execute !== "function"
        ) {

            skipped++;

            console.log(
                `⚠️ Bỏ qua ${fullPath}: không có execute()`
            );

            return;
        }

        // ----------------------------------------------
        // Lưu
        // ----------------------------------------------

        commandMap.set(name, {
            ...command,
            name,
            file: fullPath
        });

        loaded++;

        console.log(
            `✅ .${name} ← ${path.relative(
                __dirname,
                fullPath
            )}`
        );

    } catch (error) {

        errors++;

        console.error(
            `❌ Lỗi load: ${path.relative(
                __dirname,
                fullPath
            )}`
        );

        console.error(
            error.message
        );
    }
}

// ======================================================
// LOAD TẤT CẢ COMMAND
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

        files = fs.readdirSync(
            dir,
            {
                withFileTypes: true
            }
        );

    } catch (error) {

        console.error(
            `❌ Không thể đọc: ${dir}`
        );

        return;
    }

    for (const file of files) {

        const fullPath =
            path.join(
                dir,
                file.name
            );

        // ------------------------------------------
        // FOLDER
        // ------------------------------------------

        if (file.isDirectory()) {

            if (
                file.name ===
                "node_modules"
            ) {
                continue;
            }

            if (
                file.name ===
                ".git"
            ) {
                continue;
            }

            loadCommands(fullPath);

            continue;
        }

        // ------------------------------------------
        // CHỈ JS
        // ------------------------------------------

        if (
            !file.name.endsWith(".js")
        ) {
            continue;
        }

        // ------------------------------------------
        // IGNORE
        // ------------------------------------------

        if (
            IGNORE_FILES.has(
                file.name
            )
        ) {
            continue;
        }

        loadCommandFile(
            fullPath
        );
    }
}

// ======================================================
// START LOAD
// ======================================================

console.log("");
console.log(
    "========================================"
);

console.log(
    "📚 ĐANG LOAD COMMAND"
);

console.log(
    "========================================"
);

// QUAN TRỌNG:
// Load trực tiếp /app
loadCommands(__dirname);

console.log(
    "========================================"
);

console.log(
    `📦 ĐÃ LOAD: ${loaded} COMMANDS`
);

console.log(
    `⚠️ BỎ QUA: ${skipped} FILES`
);

console.log(
    `❌ LỖI: ${errors} FILES`
);

console.log(
    "========================================"
);

// ======================================================
// XÓA SLASH COMMAND
// ======================================================

async function removeSlashCommands() {

    console.log("");
    console.log(
        "🗑️ ĐANG XÓA TOÀN BỘ SLASH COMMAND..."
    );

    // ----------------------------------------------
    // GLOBAL
    // ----------------------------------------------

    try {

        await client.application.commands.set([]);

        console.log(
            "✅ Đã xóa Global Slash Commands"
        );

    } catch (error) {

        console.error(
            "❌ Lỗi xóa Global Slash Commands:"
        );

        console.error(
            error.message
        );
    }

    // ----------------------------------------------
    // SERVER
    // ----------------------------------------------

    for (
        const guild
        of client.guilds.cache.values()
    ) {

        try {

            await guild.commands.set([]);

            console.log(
                `✅ Đã xóa Slash Commands: ${guild.name}`
            );

        } catch (error) {

            console.error(
                `❌ Không thể xóa Slash Commands: ${guild.name}`
            );

            console.error(
                error.message
            );
        }
    }

    console.log(
        "🟢 SLASH COMMAND ĐÃ TẮT"
    );
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

    // ----------------------------------------------
    // XÓA /
    // ----------------------------------------------

    await removeSlashCommands();

    // ----------------------------------------------
    // STATUS
    // ----------------------------------------------

    try {

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

    } catch {}

    console.log("");
    console.log(
        "========================================"
    );

    console.log(
        "🟢 BOT ĐÃ ONLINE"
    );

    console.log(
        "🔑 Dùng lệnh: .help"
    );

    console.log(
        "🚫 Slash: OFF"
    );

    console.log(
        "========================================"
    );
});

// ======================================================
// PREFIX COMMAND
// ======================================================

client.on(
    "messageCreate",
    async (message) => {

        try {

            // ------------------------------------------
            // BOT
            // ------------------------------------------

            if (
                message.author.bot
            ) {
                return;
            }

            // ------------------------------------------
            // PREFIX
            // ------------------------------------------

            if (
                !message.content.startsWith(
                    PREFIX
                )
            ) {
                return;
            }

            // ------------------------------------------
            // CONTENT
            // ------------------------------------------

            const content =
                message.content
                    .slice(PREFIX.length)
                    .trim();

            if (!content) {
                return;
            }

            // ------------------------------------------
            // ARGS
            // ------------------------------------------

            const args =
                content.split(/\s+/);

            const commandName =
                args
                    .shift()
                    .toLowerCase();

            // ------------------------------------------
            // COMMAND
            // ------------------------------------------

            const command =
                commandMap.get(
                    commandName
                );

            if (!command) {

                console.log(
                    `⚠️ Không tìm thấy: .${commandName}`
                );

                return;
            }

            console.log(
                `📥 ${message.author.tag}: .${commandName}`
            );

            // ------------------------------------------
            // CHẠY
            // ------------------------------------------

            /*
             * Gửi message thật cho command prefix.
             *
             * Nếu command cũ là:
             *
             * execute(message, args)
             *
             * sẽ chạy trực tiếp.
             */

            if (
                command.execute.length >= 2
            ) {

                try {

                    await command.execute(
                        message,
                        args
                    );

                    return;

                } catch (prefixError) {

                    console.log(
                        `⚠️ ${commandName}: thử Interaction Adapter...`
                    );

                    // Nếu command cũ dùng interaction
                    // thì thử adapter.
                    const interaction =
                        createPrefixInteraction(
                            message,
                            args,
                            command
                        );

                    await command.execute(
                        interaction,
                        args
                    );

                    return;
                }
            }

            // ------------------------------------------
            // COMMAND 1 THAM SỐ
            // ------------------------------------------

            try {

                await command.execute(
                    message,
                    args
                );

            } catch (error) {

                console.log(
                    `⚠️ ${commandName}: thử Interaction Adapter...`
                );

                const interaction =
                    createPrefixInteraction(
                        message,
                        args,
                        command
                    );

                await command.execute(
                    interaction,
                    args
                );
            }

        } catch (error) {

            console.error("");
            console.error(
                "========================================"
            );

            console.error(
                `❌ LỖI .${message.content}`
            );

            console.error(
                error
            );

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
// ERROR
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
// PROCESS ERROR
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
