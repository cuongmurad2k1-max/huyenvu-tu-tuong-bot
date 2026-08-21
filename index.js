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
// KIỂM TRA COMMAND
// ======================================================

function isCommandObject(obj) {
    if (!obj || typeof obj !== "object") {
        return false;
    }

    return (
        typeof obj.execute === "function" ||
        typeof obj.name === "string" ||
        typeof obj.command === "string" ||
        (obj.data && typeof obj.data.name === "string")
    );
}

// ======================================================
// LẤY TÊN COMMAND
// ======================================================

function getCommandName(command) {

    if (!command || typeof command !== "object") {
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

    // SlashCommandBuilder
    if (
        command.data &&
        typeof command.data.name === "string"
    ) {
        return command.data.name;
    }

    return null;
}

// ======================================================
// ĐĂNG KÝ 1 COMMAND
// ======================================================

function registerCommand(command, filePath) {

    if (!command) {
        skipped++;
        return;
    }

    // --------------------------------------------------
    // Nếu là array
    // --------------------------------------------------

    if (Array.isArray(command)) {

        for (const item of command) {
            registerCommand(item, filePath);
        }

        return;
    }

    // --------------------------------------------------
    // Nếu object có property commands
    // --------------------------------------------------

    if (
        command.commands &&
        Array.isArray(command.commands)
    ) {

        for (const item of command.commands) {
            registerCommand(item, filePath);
        }

        return;
    }

    // --------------------------------------------------
    // Nếu object có property commandList
    // --------------------------------------------------

    if (
        command.commandList &&
        Array.isArray(command.commandList)
    ) {

        for (const item of command.commandList) {
            registerCommand(item, filePath);
        }

        return;
    }

    // --------------------------------------------------
    // Nếu object chứa nhiều command
    // --------------------------------------------------

    if (!isCommandObject(command)) {

        let found = false;

        for (const [key, value] of Object.entries(command)) {

            if (isCommandObject(value)) {

                found = true;

                let name = getCommandName(value);

                if (!name) {
                    name = key;
                }

                registerCommand(
                    {
                        ...value,
                        name
                    },
                    filePath
                );
            }
        }

        if (found) {
            return;
        }

        skipped++;

        console.log(
            `⚠️ Bỏ qua ${filePath}: không tìm thấy command`
        );

        return;
    }

    // --------------------------------------------------
    // LẤY TÊN
    // --------------------------------------------------

    let name = getCommandName(command);

    if (!name) {

        skipped++;

        console.log(
            `⚠️ Bỏ qua ${filePath}: không có tên command`
        );

        return;
    }

    name = name
        .toString()
        .trim()
        .toLowerCase();

    // --------------------------------------------------
    // ĐĂNG KÝ
    // --------------------------------------------------

    commandMap.set(name, {
        ...command,
        name,
        file: filePath
    });

    loaded++;

    console.log(
        `✅ LOAD .${name} ← ${path.basename(filePath)}`
    );
}

// ======================================================
// LOAD 1 FILE
// ======================================================

function loadFile(fullPath) {

    if (!fs.existsSync(fullPath)) {
        return;
    }

    if (!fullPath.endsWith(".js")) {
        return;
    }

    const baseName = path.basename(fullPath);

    // Không load index
    if (baseName === "index.js") {
        return;
    }

    try {

        delete require.cache[
            require.resolve(fullPath)
        ];

        const exported = require(fullPath);

        registerCommand(
            exported,
            fullPath
        );

    } catch (error) {

        errors++;

        console.error("");
        console.error(
            `❌ LỖI LOAD: ${fullPath}`
        );

        console.error(error);
        console.error("");
    }
}

// ======================================================
// LOAD THƯ MỤC
// ======================================================

function loadDirectory(dir) {

    if (!fs.existsSync(dir)) {

        console.log(
            `⚠️ Không tìm thấy thư mục: ${dir}`
        );

        return;
    }

    const files = fs.readdirSync(
        dir,
        {
            withFileTypes: true
        }
    );

    for (const file of files) {

        const fullPath = path.join(
            dir,
            file.name
        );

        if (file.isDirectory()) {

            loadDirectory(fullPath);

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
console.log("📚 ĐANG LOAD TOÀN BỘ COMMAND");
console.log("========================================");

// ------------------------------------------------------
// 1. LOAD CÁC FILE .JS Ở ROOT
// ------------------------------------------------------

console.log("");
console.log("📁 LOAD COMMAND ROOT...");

const rootFiles = fs.readdirSync(
    __dirname,
    {
        withFileTypes: true
    }
);

for (const file of rootFiles) {

    if (!file.isFile()) {
        continue;
    }

    if (!file.name.endsWith(".js")) {
        continue;
    }

    if (file.name === "index.js") {
        continue;
    }

    const fullPath = path.join(
        __dirname,
        file.name
    );

    loadFile(fullPath);
}

// ------------------------------------------------------
// 2. LOAD THƯ MỤC COMMANDS
// ------------------------------------------------------

console.log("");
console.log("📁 LOAD THƯ MỤC COMMANDS...");

const commandsDir = path.join(
    __dirname,
    "commands"
);

if (fs.existsSync(commandsDir)) {

    loadDirectory(commandsDir);

} else {

    console.log(
        "⚠️ Không có thư mục commands/"
    );
}

// ======================================================
// KẾT QUẢ
// ======================================================

console.log("");
console.log("========================================");
console.log("📊 KẾT QUẢ LOAD COMMAND");
console.log("========================================");

console.log(
    `📦 Đã load: ${commandMap.size} commands`
);

console.log(
    `⚠️ Bỏ qua: ${skipped} files`
);

console.log(
    `❌ Lỗi: ${errors} files`
);

console.log("========================================");
console.log("");

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
                name: `${PREFIX}help | Huyền Vũ Tứ Tượng`,
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

            // Bot khác
            if (message.author.bot) {
                return;
            }

            // Không phải prefix
            if (
                !message.content.startsWith(PREFIX)
            ) {
                return;
            }

            // Bỏ prefix
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
                args.shift()
                    .toLowerCase();

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
                `📥 ${message.author.tag}: ${PREFIX}${commandName}`
            );

            // ------------------------------------------------
            // EXECUTE
            // ------------------------------------------------

            if (
                typeof command.execute !==
                "function"
            ) {

                await message.reply(
                    "❌ Command này chưa có hàm `execute`."
                );

                return;
            }

            await command.execute(
                message,
                args
            );

        } catch (error) {

            console.error("");
            console.error(
                `❌ LỖI KHI CHẠY COMMAND`
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

            } catch (replyError) {

                console.error(
                    "❌ Không thể gửi thông báo lỗi:"
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

        console.error(
            "❌ Discord Client Error:"
        );

        console.error(error);
    }
);

// ======================================================
// UNHANDLED REJECTION
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

// ======================================================
// UNCAUGHT EXCEPTION
// ======================================================

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
