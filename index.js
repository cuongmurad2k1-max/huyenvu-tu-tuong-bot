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

// Cho help.js và các file khác sử dụng
client.commandMap = commandMap;

// ======================================================
// KIỂM TRA CÓ PHẢI COMMAND KHÔNG
// ======================================================

function getCommandName(command) {

    if (!command) {
        return null;
    }

    // name
    if (typeof command.name === "string") {
        return command.name;
    }

    // SlashCommandBuilder
    if (
        command.data &&
        typeof command.data.name === "string"
    ) {
        return command.data.name;
    }

    // command
    if (typeof command.command === "string") {
        return command.command;
    }

    return null;
}

// ======================================================
// LOAD COMMAND
// ======================================================

function loadCommands(dir) {

    if (!fs.existsSync(dir)) {
        console.log(
            `⚠️ Không tìm thấy thư mục: ${dir}`
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
            `❌ Không thể đọc thư mục: ${dir}`
        );

        console.error(error.message);

        return;
    }

    for (const file of files) {

        const fullPath = path.join(
            dir,
            file.name
        );

        // ==================================================
        // BỎ NODE_MODULES
        // ==================================================

        if (file.name === "node_modules") {
            continue;
        }

        // ==================================================
        // FOLDER
        // ==================================================

        if (file.isDirectory()) {

            loadCommands(fullPath);

            continue;
        }

        // ==================================================
        // CHỈ JS
        // ==================================================

        if (!file.name.endsWith(".js")) {
            continue;
        }

        // ==================================================
        // KHÔNG LOAD INDEX.JS
        // ==================================================

        if (file.name === "index.js") {
            continue;
        }

        try {

            delete require.cache[
                require.resolve(fullPath)
            ];

            const command = require(fullPath);

            const name = getCommandName(command);

            // Không phải command
            if (!name) {

                skipped++;

                continue;
            }

            const commandName =
                name.toLowerCase();

            // ==================================================
            // LƯU COMMAND
            // ==================================================

            commandMap.set(
                commandName,
                {
                    ...command,

                    name: commandName,

                    file: fullPath
                }
            );

            loaded++;

            console.log(
                `✅ LOAD: .${commandName}`
            );

        } catch (error) {

            errors++;

            console.error(
                `❌ Lỗi load ${fullPath}`
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
console.log("========================================");
console.log("📚 ĐANG LOAD COMMAND");
console.log("========================================");

// Quan trọng:
// Load trực tiếp /app
loadCommands(__dirname);

console.log("========================================");
console.log(`📦 Đã load: ${loaded} commands`);
console.log(`⚠️ Bỏ qua: ${skipped} files`);
console.log(`❌ Lỗi: ${errors} files`);
console.log("========================================");

// ======================================================
// READY
// ======================================================

client.once("ready", () => {

    console.log("");
    console.log("========================================");
    console.log("🤖 HUYỀN VŨ TỨ TƯỢNG BOT");
    console.log("========================================");

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

    console.log("========================================");

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

    console.log("🟢 BOT ĐÃ ONLINE");
});

// ======================================================
// PREFIX COMMAND
// ======================================================

client.on(
    "messageCreate",
    async (message) => {

        try {

            // Bỏ bot
            if (message.author.bot) {
                return;
            }

            // Không có prefix
            if (
                !message.content.startsWith(PREFIX)
            ) {
                return;
            }

            // Nội dung sau dấu .
            const content =
                message.content
                    .slice(PREFIX.length)
                    .trim();

            if (!content) {
                return;
            }

            // Tách command + args
            const args =
                content.split(/\s+/);

            const commandName =
                args.shift().toLowerCase();

            // Tìm command
            const command =
                commandMap.get(commandName);

            if (!command) {

                console.log(
                    `⚠️ Không tìm thấy command: .${commandName}`
                );

                return;
            }

            console.log(
                `📥 ${message.author.tag}: .${commandName}`
            );

            // ==================================================
            // EXECUTE
            // ==================================================

            if (
                typeof command.execute !==
                "function"
            ) {

                await message.reply(
                    "❌ Command này chưa có hàm `execute`."
                );

                return;
            }

            // Prefix command
            await command.execute(
                message,
                args
            );

        } catch (error) {

            console.error(
                `❌ Lỗi khi chạy lệnh:`
            );

            console.error(error);

            try {

                if (
                    !message.replied &&
                    !message.deferred
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
