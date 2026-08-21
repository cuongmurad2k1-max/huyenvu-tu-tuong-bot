const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    Partials
} = require("discord.js");

// =====================================================
// CONFIG
// =====================================================

const PREFIX = ".";

const TOKEN =
    process.env.TOKEN ||
    process.env.DISCORD_TOKEN ||
    process.env.BOT_TOKEN;

if (!TOKEN) {
    console.error("❌ Không tìm thấy TOKEN trong Railway Variables.");
    process.exit(1);
}

// =====================================================
// DISCORD CLIENT
// =====================================================

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

// =====================================================
// COMMAND MAP
// CHỈ KHAI BÁO 1 LẦN
// =====================================================

const commandMap = new Map();

// =====================================================
// COMMAND ALIASES
// =====================================================

const aliases = new Map();

// =====================================================
// ĐƯỜNG DẪN CẦN QUÉT
// =====================================================

const ROOT_DIR = __dirname;

const COMMAND_DIRS = [
    ROOT_DIR,
    path.join(ROOT_DIR, "commands")
];

// =====================================================
// FILE / THƯ MỤC KHÔNG LOAD
// =====================================================

const IGNORE_FILES = new Set([
    "index.js",
    "database.js",
    "package.json"
]);

const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    ".railway",
    "systems"
]);

// =====================================================
// KIỂM TRA COMMAND
// =====================================================

function isValidCommand(command) {
    if (!command) return false;

    // Kiểu:
    // {
    //   data: SlashCommandBuilder,
    //   execute()
    // }

    if (
        command.data &&
        typeof command.execute === "function"
    ) {
        return true;
    }

    // Kiểu:
    // {
    //   name: "boss",
    //   execute()
    // }

    if (
        typeof command.name === "string" &&
        typeof command.execute === "function"
    ) {
        return true;
    }

    // Kiểu:
    // {
    //   name: "boss",
    //   run()
    // }

    if (
        typeof command.name === "string" &&
        typeof command.run === "function"
    ) {
        return true;
    }

    // Kiểu:
    // {
    //   command: "boss",
    //   execute()
    // }

    if (
        typeof command.command === "string" &&
        typeof command.execute === "function"
    ) {
        return true;
    }

    // Kiểu:
    // {
    //   command: "boss",
    //   run()
    // }

    if (
        typeof command.command === "string" &&
        typeof command.run === "function"
    ) {
        return true;
    }

    return false;
}

// =====================================================
// LẤY TÊN COMMAND
// =====================================================

function getCommandName(command) {
    let name = null;

    // SlashCommandBuilder
    if (
        command.data &&
        typeof command.data.name === "string"
    ) {
        name = command.data.name;
    }

    // name
    if (
        !name &&
        typeof command.name === "string"
    ) {
        name = command.name;
    }

    // command
    if (
        !name &&
        typeof command.command === "string"
    ) {
        name = command.command;
    }

    if (!name) return null;

    return name
        .toLowerCase()
        .trim()
        .replace(/^\//, "")
        .replace(/^\./, "");
}

// =====================================================
// LẤY ALIAS
// =====================================================

function getAliases(command) {
    if (!command) return [];

    if (Array.isArray(command.aliases)) {
        return command.aliases
            .filter(x => typeof x === "string")
            .map(x =>
                x
                    .toLowerCase()
                    .trim()
                    .replace(/^\./, "")
                    .replace(/^\//, "")
            );
    }

    return [];
}

// =====================================================
// LOAD COMMAND
// =====================================================

function registerCommand(command, file) {
    if (!isValidCommand(command)) {
        return 0;
    }

    const name = getCommandName(command);

    if (!name) {
        console.warn(
            `⚠️ Bỏ qua ${file}: không tìm thấy tên command.`
        );
        return 0;
    }

    if (commandMap.has(name)) {
        console.warn(
            `⚠️ Trùng command .${name} -> ${file}`
        );

        return 0;
    }

    commandMap.set(name, command);

    const commandAliases = getAliases(command);

    for (const alias of commandAliases) {
        if (!aliases.has(alias)) {
            aliases.set(alias, name);
        }
    }

    return 1;
}

// =====================================================
// LOAD FILE
// =====================================================

function loadFile(file) {
    try {
        if (
            !file.endsWith(".js") ||
            file.endsWith(".map.js")
        ) {
            return 0;
        }

        const baseName = path.basename(file);

        if (IGNORE_FILES.has(baseName)) {
            return 0;
        }

        // Xóa cache để Railway luôn load code mới
        delete require.cache[
            require.resolve(file)
        ];

        const loaded = require(file);

        // ---------------------------------------------
        // 1. export trực tiếp command
        // ---------------------------------------------

        if (isValidCommand(loaded)) {
            return registerCommand(
                loaded,
                file
            );
        }

        // ---------------------------------------------
        // 2. module.exports = [command1, command2]
        // ---------------------------------------------

        if (Array.isArray(loaded)) {
            let count = 0;

            for (const command of loaded) {
                count += registerCommand(
                    command,
                    file
                );
            }

            return count;
        }

        // ---------------------------------------------
        // 3. module.exports = {
        //      command1: {...},
        //      command2: {...}
        //    }
        // ---------------------------------------------

        if (
            loaded &&
            typeof loaded === "object"
        ) {
            let count = 0;

            for (const value of Object.values(loaded)) {
                if (isValidCommand(value)) {
                    count += registerCommand(
                        value,
                        file
                    );
                }
            }

            return count;
        }

        return 0;

    } catch (error) {

        console.error(
            `❌ Không thể load ${file}:`
        );

        console.error(
            error.message
        );

        return 0;
    }
}

// =====================================================
// QUÉT THƯ MỤC ĐỆ QUY
// =====================================================

function scanDirectory(dir) {
    let count = 0;

    if (!fs.existsSync(dir)) {
        return count;
    }

    let entries;

    try {
        entries = fs.readdirSync(
            dir,
            { withFileTypes: true }
        );
    } catch (error) {
        console.error(
            `❌ Không thể đọc thư mục ${dir}`
        );

        return count;
    }

    for (const entry of entries) {

        const fullPath = path.join(
            dir,
            entry.name
        );

        // ---------------------------------------------
        // DIRECTORY
        // ---------------------------------------------

        if (entry.isDirectory()) {

            if (
                IGNORE_DIRS.has(entry.name)
            ) {
                continue;
            }

            count += scanDirectory(
                fullPath
            );

            continue;
        }

        // ---------------------------------------------
        // FILE
        // ---------------------------------------------

        if (!entry.name.endsWith(".js")) {
            continue;
        }

        count += loadFile(fullPath);
    }

    return count;
}

// =====================================================
// LOAD TOÀN BỘ COMMAND
// =====================================================

function loadAllCommands() {

    commandMap.clear();
    aliases.clear();

    let loadedCount = 0;

    const scanned = new Set();

    for (const dir of COMMAND_DIRS) {

        if (!fs.existsSync(dir)) {
            continue;
        }

        const realDir = path.resolve(dir);

        if (scanned.has(realDir)) {
            continue;
        }

        scanned.add(realDir);

        loadedCount += scanDirectory(
            realDir
        );
    }

    console.log("");
    console.log(
        "=========================================="
    );

    console.log(
        `📦 Đã load ${loadedCount} command`
    );

    console.log(
        `📚 Command Map: ${commandMap.size} commands`
    );

    console.log(
        `🔗 Aliases: ${aliases.size}`
    );

    console.log(
        "=========================================="
    );

    // Hiển thị một số command để kiểm tra
    const names = [
        ...commandMap.keys()
    ];

    if (names.length > 0) {

        console.log(
            "📋 Một số command:"
        );

        console.log(
            names
                .slice(0, 20)
                .map(x => `.${x}`)
                .join(" | ")
        );
    }

    console.log("");
}

// =====================================================
// READY
// =====================================================

client.once(
    "ready",
    () => {

        console.log("");
        console.log(
            "=========================================="
        );

        console.log(
            `🤖 ${client.user.tag} ONLINE`
        );

        console.log(
            `🛡️ Prefix: ${PREFIX}`
        );

        console.log(
            `🌐 Servers: ${client.guilds.cache.size}`
        );

        console.log(
            `📦 Commands: ${commandMap.size}`
        );

        console.log(
            "=========================================="
        );

        console.log(
            "💡 Dùng lệnh dạng: .boss"
        );

        console.log("");
    }
);

// =====================================================
// PREFIX MESSAGE
// =====================================================

client.on(
    "messageCreate",
    async message => {

        try {

            // Không xử lý bot
            if (message.author.bot) {
                return;
            }

            // Không có content
            if (!message.content) {
                return;
            }

            // Không bắt đầu bằng .
            if (
                !message.content.startsWith(
                    PREFIX
                )
            ) {
                return;
            }

            // -----------------------------------------
            // TÁCH COMMAND
            // -----------------------------------------

            const content =
                message.content.slice(
                    PREFIX.length
                ).trim();

            if (!content) {
                return;
            }

            const args =
                content.split(/\s+/);

            let commandName =
                args.shift()
                    .toLowerCase();

            // -----------------------------------------
            // TÌM COMMAND
            // -----------------------------------------

            let command =
                commandMap.get(
                    commandName
                );

            // Alias
            if (!command) {

                const realName =
                    aliases.get(
                        commandName
                    );

                if (realName) {
                    command =
                        commandMap.get(
                            realName
                        );
                }
            }

            // Không tồn tại
            if (!command) {
                return;
            }

            // -----------------------------------------
            // EXECUTE
            // -----------------------------------------

            if (
                typeof command.execute ===
                "function"
            ) {

                await command.execute(
                    message,
                    args,
                    {
                        client,
                        message,
                        args
                    }
                );

                return;
            }

            // -----------------------------------------
            // RUN
            // -----------------------------------------

            if (
                typeof command.run ===
                "function"
            ) {

                await command.run(
                    message,
                    args,
                    {
                        client,
                        message,
                        args
                    }
                );

                return;
            }

        } catch (error) {

            console.error(
                "❌ Lỗi khi chạy command:"
            );

            console.error(error);

            try {

                if (
                    message.channel &&
                    message.channel.isTextBased()
                ) {

                    await message.reply(
                        "❌ Có lỗi xảy ra khi thực hiện lệnh."
                    );
                }

            } catch (_) {}
        }
    }
);

// =====================================================
// ERROR HANDLER
// =====================================================

client.on(
    "error",
    error => {

        console.error(
            "❌ Discord Client Error:"
        );

        console.error(error);
    }
);

process.on(
    "unhandledRejection",
    error => {

        console.error(
            "❌ Unhandled Rejection:"
        );

        console.error(error);
    }
);

process.on(
    "uncaughtException",
    error => {

        console.error(
            "❌ Uncaught Exception:"
        );

        console.error(error);
    }
);

// =====================================================
// LOAD COMMANDS
// =====================================================

loadAllCommands();

// =====================================================
// LOGIN
// =====================================================

console.log(
    "🔐 Đang đăng nhập Discord..."
);

client.login(TOKEN)
    .then(() => {

        console.log(
            "✅ Đã gửi yêu cầu đăng nhập Discord."
        );

    })
    .catch(error => {

        console.error(
            "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:"
        );

        console.error(
            error.message
        );

        process.exit(1);
    });
