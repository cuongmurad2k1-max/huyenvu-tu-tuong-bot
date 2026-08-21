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
// NHỮNG FILE KHÔNG ĐƯỢC LOAD
// ======================================================

const IGNORE_FILES = new Set([
    "index.js",
    "package.json",
    "database.js"
]);

// ======================================================
// KIỂM TRA COMMAND
// ======================================================

function getCommandName(command, fileName) {

    // ------------------------------
    // name
    // ------------------------------

    if (
        command &&
        typeof command.name === "string" &&
        command.name.trim()
    ) {
        return command.name.trim().toLowerCase();
    }

    // ------------------------------
    // data.name
    // SlashCommandBuilder
    // ------------------------------

    if (
        command &&
        command.data &&
        typeof command.data.name === "string" &&
        command.data.name.trim()
    ) {
        return command.data.name.trim().toLowerCase();
    }

    // ------------------------------
    // command
    // ------------------------------

    if (
        command &&
        typeof command.command === "string" &&
        command.command.trim()
    ) {
        return command.command.trim().toLowerCase();
    }

    // ------------------------------
    // Lấy tên từ filename
    //
    // 01_combat.js -> combat
    // 02_tutuong.js -> tutuong
    // ------------------------------

    let name = path.basename(fileName, ".js");

    name = name.replace(/^\d+[_-]?/, "");

    if (name) {
        return name.toLowerCase();
    }

    return null;
}

// ======================================================
// LOAD 1 FILE
// ======================================================

function loadCommandFile(fullPath) {

    try {

        delete require.cache[require.resolve(fullPath)];

        const command = require(fullPath);

        if (!command) {
            skipped++;

            console.log(
                `⚠️ Bỏ qua ${fullPath}: file không export command`
            );

            return;
        }

        const name = getCommandName(command, fullPath);

        if (!name) {

            skipped++;

            console.log(
                `⚠️ Bỏ qua ${fullPath}: không tìm thấy tên command`
            );

            return;
        }

        // ----------------------------------------------
        // Kiểm tra execute
        // ----------------------------------------------

        if (typeof command.execute !== "function") {

            skipped++;

            console.log(
                `⚠️ Bỏ qua ${fullPath}: không có execute()`
            );

            return;
        }

        // ----------------------------------------------
        // Lưu command
        // ----------------------------------------------

        commandMap.set(name, {
            ...command,
            name,
            file: fullPath
        });

        loaded++;

        console.log(
            `✅ LOAD .${name} ← ${path.relative(__dirname, fullPath)}`
        );

    } catch (error) {

        errors++;

        console.error(
            `❌ Lỗi load ${fullPath}`
        );

        console.error(error.message);
    }
}

// ======================================================
// LOAD COMMAND RECURSIVELY
// ======================================================

function loadCommands(dir) {

    if (!fs.existsSync(dir)) {
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

        const fullPath = path.join(dir, file.name);

        // ----------------------------------------------
        // THƯ MỤC
        // ----------------------------------------------

        if (file.isDirectory()) {

            // Không quét node_modules
            if (file.name === "node_modules") {
                continue;
            }

            // Không quét .git
            if (file.name === ".git") {
                continue;
            }

            loadCommands(fullPath);

            continue;
        }

        // ----------------------------------------------
        // CHỈ JS
        // ----------------------------------------------

        if (!file.name.endsWith(".js")) {
            continue;
        }

        // ----------------------------------------------
        // FILE BỎ QUA
        // ----------------------------------------------

        if (IGNORE_FILES.has(file.name)) {
            continue;
        }

        loadCommandFile(fullPath);
    }
}

// ======================================================
// LOAD COMMAND
// ======================================================

console.log("");
console.log("========================================");
console.log("📚 ĐANG LOAD COMMAND");
console.log("========================================");

loadCommands(__dirname);

console.log("");
console.log("========================================");
console.log(`📦 ĐÃ LOAD: ${loaded} COMMANDS`);
console.log(`⚠️ BỎ QUA: ${skipped} FILES`);
console.log(`❌ LỖI: ${errors} FILES`);
console.log("========================================");

// ======================================================
// XÓA TOÀN BỘ SLASH COMMAND
// ======================================================

async function deleteSlashCommands() {

    console.log("");
    console.log("========================================");
    console.log("🗑️ ĐANG XÓA SLASH COMMAND");
    console.log("========================================");

    // ----------------------------------------------
    // GLOBAL COMMANDS
    // ----------------------------------------------

    try {

        await client.application.commands.set([]);

        console.log(
            "✅ Đã xóa toàn bộ GLOBAL / COMMANDS"
        );

    } catch (error) {

        console.error(
            "❌ Không thể xóa Global Slash Commands:"
        );

        console.error(error.message);
    }

    // ----------------------------------------------
    // GUILD COMMANDS
    // ----------------------------------------------

    try {

        const guilds = client.guilds.cache;

        console.log(
            `🔎 Kiểm tra ${guilds.size} server...`
        );

        for (const guild of guilds.values()) {

            try {

                await guild.commands.set([]);

                console.log(
                    `✅ Đã xóa slash của server: ${guild.name}`
                );

            } catch (error) {

                console.error(
                    `❌ Không thể xóa slash server ${guild.name}:`
                );

                console.error(error.message);
            }
        }

    } catch (error) {

        console.error(
            "❌ Lỗi khi xóa Guild Slash Commands:"
        );

        console.error(error.message);
    }

    console.log("========================================");
}

// ======================================================
// READY
// ======================================================

client.once("ready", async () => {

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

    // ----------------------------------------------
    // XÓA SLASH COMMAND
    // ----------------------------------------------

    await deleteSlashCommands();

    // ----------------------------------------------
    // PRESENCE
    // ----------------------------------------------

    try {

        client.user.setPresence({

            activities: [
                {
                    name: `${PREFIX}help | Huyền Vũ Tứ Tượng`,
                    type: 0
                }
            ],

            status: "online"
        });

    } catch (error) {

        console.error(
            "❌ Lỗi set presence:",
            error.message
        );
    }

    console.log("");
    console.log("========================================");
    console.log("🟢 BOT ĐÃ ONLINE");
    console.log(`🔑 Dùng lệnh: ${PREFIX}help`);
    console.log("🚫 Slash command: ĐÃ TẮT");
    console.log("========================================");
});

// ======================================================
// PREFIX COMMAND
// ======================================================

client.on("messageCreate", async (message) => {

    try {

        // ----------------------------------------------
        // BỎ QUA BOT
        // ----------------------------------------------

        if (message.author.bot) {
            return;
        }

        // ----------------------------------------------
        // PHẢI CÓ PREFIX .
        // ----------------------------------------------

        if (!message.content.startsWith(PREFIX)) {
            return;
        }

        // ----------------------------------------------
        // LẤY NỘI DUNG
        // ----------------------------------------------

        const content = message.content
            .slice(PREFIX.length)
            .trim();

        if (!content) {
            return;
        }

        // ----------------------------------------------
        // ARGUMENT
        // ----------------------------------------------

        const args = content.split(/\s+/);

        const commandName = args
            .shift()
            .toLowerCase();

        // ----------------------------------------------
        // TÌM COMMAND
        // ----------------------------------------------

        const command = commandMap.get(commandName);

        if (!command) {

            console.log(
                `⚠️ Không tìm thấy command: .${commandName}`
            );

            return;
        }

        console.log(
            `📥 ${message.author.tag}: .${commandName}`
        );

        // ----------------------------------------------
        // EXECUTE
        // ----------------------------------------------

        await command.execute(message, args);

    } catch (error) {

        console.error("");
        console.error(
            "========================================"
        );

        console.error(
            `❌ LỖI COMMAND: ${message.content}`
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
});

// ======================================================
// DISCORD ERROR
// ======================================================

client.on("error", (error) => {

    console.error(
        "❌ Discord Client Error:"
    );

    console.error(error);
});

// ======================================================
// WARNING
// ======================================================

client.on("warn", (warning) => {

    console.warn(
        "⚠️ Discord Warning:"
    );

    console.warn(warning);
});

// ======================================================
// UNHANDLED REJECTION
// ======================================================

process.on("unhandledRejection", (error) => {

    console.error(
        "❌ Unhandled Rejection:"
    );

    console.error(error);
});

// ======================================================
// UNCAUGHT EXCEPTION
// ======================================================

process.on("uncaughtException", (error) => {

    console.error(
        "❌ Uncaught Exception:"
    );

    console.error(error);
});

// ======================================================
// LOGIN
// ======================================================

console.log("");
console.log("🔐 Đang đăng nhập Discord...");

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
