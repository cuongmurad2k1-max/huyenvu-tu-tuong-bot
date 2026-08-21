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
    console.error("========================================");
    console.error("❌ KHÔNG TÌM THẤY DISCORD_TOKEN!");
    console.error("👉 Railway → Variables → DISCORD_TOKEN");
    console.error("========================================");
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
// KIỂM TRA COMMAND
// ======================================================

function getCommandName(command) {

    if (!command) {
        return null;
    }

    // name
    if (typeof command.name === "string") {
        return command.name;
    }

    // command
    if (typeof command.command === "string") {
        return command.command;
    }

    // data.name
    if (
        command.data &&
        typeof command.data.name === "string"
    ) {
        return command.data.name;
    }

    // data.toJSON().name
    try {

        if (
            command.data &&
            typeof command.data.toJSON === "function"
        ) {

            const data = command.data.toJSON();

            if (data && typeof data.name === "string") {
                return data.name;
            }
        }

    } catch {}

    return null;
}

// ======================================================
// LOAD 1 COMMAND
// ======================================================

function registerCommand(command, filePath) {

    if (!command) {
        skipped++;
        return;
    }

    // ------------------------------------------
    // Nếu command là array
    // ------------------------------------------

    if (Array.isArray(command)) {

        for (const item of command) {
            registerCommand(item, filePath);
        }

        return;
    }

    // ------------------------------------------
    // commands: []
    // ------------------------------------------

    if (Array.isArray(command.commands)) {

        for (const item of command.commands) {
            registerCommand(item, filePath);
        }

        return;
    }

    // ------------------------------------------
    // command object
    // ------------------------------------------

    const name = getCommandName(command);

    if (!name) {

        // --------------------------------------
        // Kiểu:
        //
        // module.exports = {
        //   combat: {...},
        //   boss: {...},
        //   help: {...}
        // }
        // --------------------------------------

        let foundChild = false;

        for (const [key, value] of Object.entries(command)) {

            if (
                value &&
                typeof value === "object" &&
                (
                    typeof value.execute === "function" ||
                    typeof value.command === "string" ||
                    typeof value.name === "string" ||
                    value.data
                )
            ) {

                foundChild = true;

                if (!value.name) {
                    value.name = key;
                }

                registerCommand(value, filePath);
            }
        }

        if (!foundChild) {

            skipped++;

            console.log(
                `⚠️ Bỏ qua ${filePath}: không tìm thấy command`
            );
        }

        return;
    }

    const commandName = name
        .toString()
        .trim()
        .toLowerCase();

    if (!commandName) {
        skipped++;
        return;
    }

    // ------------------------------------------
    // Kiểm tra execute
    // ------------------------------------------

    if (typeof command.execute !== "function") {

        console.log(
            `⚠️ ${commandName}: không có execute() - vẫn đăng ký`
        );
    }

    // ------------------------------------------
    // Nếu trùng tên
    // ------------------------------------------

    if (commandMap.has(commandName)) {

        console.log(
            `⚠️ Command trùng tên: .${commandName}`
        );

        console.log(
            `   Cũ: ${commandMap.get(commandName).file}`
        );

        console.log(
            `   Mới: ${filePath}`
        );

        // Command mới ghi đè command cũ
    }

    commandMap.set(commandName, {
        ...command,
        name: commandName,
        file: filePath
    });

    loaded++;

    console.log(
        `✅ Loaded: .${commandName}`
    );
}

// ======================================================
// LOAD FILE
// ======================================================

function loadFile(fullPath) {

    try {

        delete require.cache[
            require.resolve(fullPath)
        ];

        const command = require(fullPath);

        registerCommand(
            command,
            fullPath
        );

    } catch (error) {

        errors++;

        console.error(
            `❌ LỖI LOAD FILE: ${fullPath}`
        );

        console.error(
            error
        );
    }
}

// ======================================================
// LOAD DIRECTORY
// ======================================================

function loadDirectory(dir) {

    if (!fs.existsSync(dir)) {

        console.log(
            `⚠️ Không tìm thấy thư mục: ${dir}`
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
            `❌ Không thể đọc thư mục: ${dir}`
        );

        console.error(error);

        return;
    }

    for (const file of files) {

        const fullPath = path.join(
            dir,
            file.name
        );

        // --------------------------------------
        // Folder
        // --------------------------------------

        if (file.isDirectory()) {

            // Không load node_modules
            if (file.name === "node_modules") {
                continue;
            }

            // Không load .git
            if (file.name === ".git") {
                continue;
            }

            loadDirectory(fullPath);

            continue;
        }

        // --------------------------------------
        // Chỉ JS
        // --------------------------------------

        if (!file.name.endsWith(".js")) {
            continue;
        }

        // --------------------------------------
        // Không load index.js
        // --------------------------------------

        if (
            file.name.toLowerCase() ===
            "index.js"
        ) {
            continue;
        }

        loadFile(fullPath);
    }
}

// ======================================================
// LOAD COMMAND
// ======================================================

console.log("");
console.log("========================================");
console.log("📚 ĐANG LOAD COMMAND");
console.log("========================================");

const rootDir = __dirname;

console.log(
    `📁 Root: ${rootDir}`
);

console.log("");

// ======================================================
// 1. LOAD CÁC FILE JS TRỰC TIẾP TRONG /app
// ======================================================
//
// Ví dụ:
//
// /app/01_combat.js
// /app/02_tutuong.js
// /app/03_thanhtu.js
// /app/04_nhanvat.js
// /app/05_boss_raid.js
// /app/06_pvp.js
// /app/07_guild.js
//
// ======================================================

console.log(
    "📂 Đang tìm command trong /app..."
);

loadDirectory(rootDir);

// ======================================================
// 2. LOAD THƯ MỤC /app/commands
// ======================================================

const commandsDir = path.join(
    rootDir,
    "commands"
);

if (fs.existsSync(commandsDir)) {

    console.log("");
    console.log(
        "📂 Đang tìm command trong /app/commands..."
    );

    loadDirectory(commandsDir);

}

// ======================================================
// KẾT QUẢ
// ======================================================

console.log("");
console.log("========================================");
console.log(
    `📦 ĐÃ LOAD: ${commandMap.size} COMMANDS`
);
console.log(
    `⚠️ BỎ QUA: ${skipped} FILES`
);
console.log(
    `❌ LỖI: ${errors} FILES`
);
console.log("========================================");

if (commandMap.size > 0) {

    console.log("");
    console.log("📜 DANH SÁCH PREFIX COMMAND:");

    const commandNames = [
        ...commandMap.keys()
    ].sort();

    console.log(
        commandNames
            .map(name => `.${name}`)
            .join("  ")
    );

    console.log("");
}

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

    // ------------------------------------------
    // Presence
    // ------------------------------------------

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

    } catch (error) {

        console.error(
            "⚠️ Không thể set presence:"
        );

        console.error(error);
    }

    console.log("");
    console.log("🟢 BOT ĐÃ ONLINE");
    console.log("");

});

// ======================================================
// PREFIX COMMAND
// ======================================================

client.on(
    "messageCreate",
    async (message) => {

        try {

            // --------------------------------------
            // Không xử lý bot
            // --------------------------------------

            if (message.author.bot) {
                return;
            }

            // --------------------------------------
            // Không phải server
            // --------------------------------------

            if (!message.guild) {
                return;
            }

            // --------------------------------------
            // Không có prefix
            // --------------------------------------

            if (
                !message.content ||
                !message.content.startsWith(PREFIX)
            ) {
                return;
            }

            // --------------------------------------
            // Bỏ prefix
            // --------------------------------------

            const content =
                message.content
                    .slice(PREFIX.length)
                    .trim();

            if (!content) {
                return;
            }

            // --------------------------------------
            // Tách command
            // --------------------------------------

            const args =
                content.split(/\s+/);

            const commandName =
                args
                    .shift()
                    .toLowerCase();

            // --------------------------------------
            // Tìm command
            // --------------------------------------

            const command =
                commandMap.get(commandName);

            // --------------------------------------
            // Không tìm thấy
            // --------------------------------------

            if (!command) {

                console.log(
                    `⚠️ Không tìm thấy command: .${commandName}`
                );

                return;
            }

            // --------------------------------------
            // Log
            // --------------------------------------

            console.log("");
            console.log(
                "========================================"
            );

            console.log(
                `📥 ${message.author.tag}`
            );

            console.log(
                `💬 Command: .${commandName}`
            );

            console.log(
                `📁 File: ${command.file}`
            );

            console.log(
                `📝 Args:`,
                args
            );

            console.log(
                "========================================"
            );

            // --------------------------------------
            // Kiểm tra execute
            // --------------------------------------

            if (
                typeof command.execute !==
                "function"
            ) {

                console.error(
                    `❌ .${commandName} không có execute()`
                );

                await message.reply(
                    "❌ Lệnh này chưa được cấu hình hàm `execute()`."
                );

                return;
            }

            // --------------------------------------
            // Chạy command
            // --------------------------------------

            await command.execute(
                message,
                args
            );

        } catch (error) {

            console.error("");
            console.error(
                "========================================"
            );

            console.error(
                "❌ LỖI KHI CHẠY PREFIX COMMAND"
            );

            console.error(error);

            console.error(
                "========================================"
            );

            // --------------------------------------
            // Báo lỗi cho người dùng
            // --------------------------------------

            try {

                if (
                    !message.replied &&
                    !message.deferred
                ) {

                    await message.reply(
                        "❌ Có lỗi xảy ra khi thực hiện lệnh."
                    );

                }

            } catch (replyError) {

                console.error(
                    "❌ Không thể gửi tin nhắn lỗi:"
                );

                console.error(replyError);
            }
        }
    }
);

// ======================================================
// DISCORD ERROR
// ======================================================

client.on(
    "error",
    (error) => {

        console.error("");
        console.error(
            "❌ DISCORD CLIENT ERROR"
        );

        console.error(error);
    }
);

// ======================================================
// WARN
// ======================================================

client.on(
    "warn",
    (warning) => {

        console.warn(
            "⚠️ DISCORD WARNING:"
        );

        console.warn(warning);
    }
);

// ======================================================
// UNHANDLED REJECTION
// ======================================================

process.on(
    "unhandledRejection",
    (error) => {

        console.error("");
        console.error(
            "❌ UNHANDLED REJECTION"
        );

        console.error(error);
    }
);

// ======================================================
// UNCAUGHT EXCEPTION
// ======================================================

process.on(
    "uncaughtException",
    (error) => {

        console.error("");
        console.error(
            "❌ UNCAUGHT EXCEPTION"
        );

        console.error(error);
    }
);

// ======================================================
// PROCESS WARNING
// ======================================================

process.on(
    "warning",
    (warning) => {

        console.warn(
            "⚠️ NODE WARNING:"
        );

        console.warn(warning);
    }
);

// ======================================================
// LOGIN
// ======================================================

console.log("");
console.log(
    "🔐 ĐANG ĐĂNG NHẬP DISCORD..."
);

client.login(TOKEN)

    .then(() => {

        console.log(
            "✅ LOGIN DISCORD THÀNH CÔNG"
        );

    })

    .catch((error) => {

        console.error("");
        console.error(
            "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD!"
        );

        console.error(error);

        process.exit(1);
    });
