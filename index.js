// ======================================================
// HUYỀN VŨ TỨ TƯỢNG BOT
// INDEX.JS - LOADER TOÀN BỘ COMMAND
// ======================================================

require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} = require("discord.js");

// ======================================================
// CLIENT
// ======================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],

    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

// ======================================================
// CONFIG
// ======================================================

const PREFIX = process.env.PREFIX || ".";

const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;

// ======================================================
// COLLECTION COMMAND
// ======================================================

client.commands = new Collection();

client.aliases = new Collection();

// ======================================================
// THỐNG KÊ
// ======================================================

let loadedFiles = 0;
let skippedFiles = 0;
let errorFiles = 0;
let loadedCommands = 0;

// ======================================================
// FILE ĐƯỢC BỎ QUA
// ======================================================

const IGNORE_FILES = new Set([
    "index.js",
    "database.js",
    "config.js",
    "package.json",
    "deploy-commands.js"
]);

const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    ".railway",
    "database",
    "data"
]);

// ======================================================
// KIỂM TRA MODULE CÓ PHẢI COMMAND KHÔNG
// ======================================================

function isCommandObject(obj) {

    if (!obj || typeof obj !== "object") {
        return false;
    }

    // Dạng:
    // {
    //   name: "help",
    //   execute() {}
    // }

    if (
        typeof obj.name === "string" &&
        typeof obj.execute === "function"
    ) {
        return true;
    }

    // Dạng Discord slash command:
    // {
    //   data: SlashCommandBuilder,
    //   execute() {}
    // }

    if (
        obj.data &&
        typeof obj.execute === "function"
    ) {

        try {

            if (
                typeof obj.data.name === "string"
            ) {
                return true;
            }

            if (
                typeof obj.data.toJSON === "function"
            ) {
                const json = obj.data.toJSON();

                if (
                    json &&
                    typeof json.name === "string"
                ) {
                    return true;
                }
            }

        } catch (err) {
            // bỏ qua
        }
    }

    return false;
}

// ======================================================
// LẤY TÊN COMMAND
// ======================================================

function getCommandName(command) {

    if (!command) {
        return null;
    }

    // prefix command
    if (
        typeof command.name === "string" &&
        command.name.length > 0
    ) {
        return command.name.toLowerCase();
    }

    // slash command
    if (
        command.data
    ) {

        if (
            typeof command.data.name === "string"
        ) {
            return command.data.name.toLowerCase();
        }

        try {

            if (
                typeof command.data.toJSON === "function"
            ) {

                const json = command.data.toJSON();

                if (
                    json &&
                    typeof json.name === "string"
                ) {
                    return json.name.toLowerCase();
                }
            }

        } catch (err) {
            // bỏ qua
        }
    }

    return null;
}

// ======================================================
// LẤY ALIAS
// ======================================================

function getAliases(command) {

    if (!command) {
        return [];
    }

    if (!Array.isArray(command.aliases)) {
        return [];
    }

    return command.aliases
        .filter(x => typeof x === "string")
        .map(x => x.toLowerCase());
}

// ======================================================
// ĐĂNG KÝ COMMAND
// ======================================================

function registerCommand(command, fileName) {

    if (!isCommandObject(command)) {
        return 0;
    }

    const name = getCommandName(command);

    if (!name) {
        return 0;
    }

    // tránh trùng
    if (client.commands.has(name)) {

        console.log(
            `⚠️ TRÙNG COMMAND: .${name} | ${fileName}`
        );

        return 0;
    }

    // lưu command
    client.commands.set(name, command);

    loadedCommands++;

    // alias
    const aliases = getAliases(command);

    for (const alias of aliases) {

        if (!client.aliases.has(alias)) {

            client.aliases.set(
                alias,
                name
            );
        }
    }

    return 1;
}

// ======================================================
// XỬ LÝ MODULE
// ======================================================

function processModule(moduleExport, fileName) {

    if (!moduleExport) {
        return 0;
    }

    let count = 0;

    // --------------------------------------------------
    // 1. Một command object
    // --------------------------------------------------

    if (isCommandObject(moduleExport)) {

        count += registerCommand(
            moduleExport,
            fileName
        );

        return count;
    }

    // --------------------------------------------------
    // 2. Array commands
    // --------------------------------------------------

    if (Array.isArray(moduleExport)) {

        for (const command of moduleExport) {

            if (isCommandObject(command)) {

                count += registerCommand(
                    command,
                    fileName
                );
            }
        }

        return count;
    }

    // --------------------------------------------------
    // 3. { commands: [...] }
    // --------------------------------------------------

    if (
        Array.isArray(moduleExport.commands)
    ) {

        for (
            const command of moduleExport.commands
        ) {

            if (isCommandObject(command)) {

                count += registerCommand(
                    command,
                    fileName
                );
            }
        }
    }

    // --------------------------------------------------
    // 4. { commands: { a: ..., b: ... } }
    // --------------------------------------------------

    if (
        moduleExport.commands &&
        typeof moduleExport.commands === "object" &&
        !Array.isArray(moduleExport.commands)
    ) {

        for (
            const key of Object.keys(moduleExport.commands)
        ) {

            const command =
                moduleExport.commands[key];

            if (isCommandObject(command)) {

                count += registerCommand(
                    command,
                    fileName
                );
            }
        }
    }

    // --------------------------------------------------
    // 5. Object chứa nhiều command
    //
    // {
    //   combat: {...},
    //   arena: {...},
    //   boss: {...}
    // }
    // --------------------------------------------------

    for (
        const key of Object.keys(moduleExport)
    ) {

        if (
            key === "commands" ||
            key === "default"
        ) {
            continue;
        }

        const value = moduleExport[key];

        if (isCommandObject(value)) {

            count += registerCommand(
                value,
                fileName
            );
        }

        // trường hợp export array
        if (Array.isArray(value)) {

            for (
                const command of value
            ) {

                if (isCommandObject(command)) {

                    count += registerCommand(
                        command,
                        fileName
                    );
                }
            }
        }
    }

    // --------------------------------------------------
    // 6. default export
    // --------------------------------------------------

    if (
        moduleExport.default &&
        moduleExport.default !== moduleExport
    ) {

        count += processModule(
            moduleExport.default,
            fileName
        );
    }

    return count;
}

// ======================================================
// LẤY TẤT CẢ FILE JS
// ======================================================

function getAllJSFiles(dir, result = []) {

    if (!fs.existsSync(dir)) {
        return result;
    }

    let entries;

    try {

        entries = fs.readdirSync(
            dir,
            {
                withFileTypes: true
            }
        );

    } catch (err) {

        console.log(
            `⚠️ Không thể đọc: ${dir}`
        );

        return result;
    }

    for (const entry of entries) {

        const fullPath =
            path.join(
                dir,
                entry.name
            );

        // bỏ thư mục
        if (entry.isDirectory()) {

            if (
                IGNORE_DIRS.has(
                    entry.name
                )
            ) {
                continue;
            }

            getAllJSFiles(
                fullPath,
                result
            );

            continue;
        }

        // chỉ lấy JS
        if (
            !entry.isFile() ||
            !entry.name.endsWith(".js")
        ) {
            continue;
        }

        // bỏ file không cần
        if (
            IGNORE_FILES.has(
                entry.name
            )
        ) {
            continue;
        }

        result.push(fullPath);
    }

    return result;
}

// ======================================================
// LOAD COMMANDS
// ======================================================

function loadCommands() {

    console.log("");
    console.log(
        "=========================================="
    );

    console.log(
        "📚 ĐANG LOAD COMMAND"
    );

    console.log(
        "=========================================="
    );

    // reset
    client.commands.clear();
    client.aliases.clear();

    loadedFiles = 0;
    skippedFiles = 0;
    errorFiles = 0;
    loadedCommands = 0;

    // --------------------------------------------------
    // ROOT /app
    // --------------------------------------------------

    const rootDir = __dirname;

    // --------------------------------------------------
    // TÌM TOÀN BỘ FILE
    // --------------------------------------------------

    const files = getAllJSFiles(
        rootDir
    );

    console.log(
        `📁 Tìm thấy ${files.length} file JS`
    );

    console.log("");

    // --------------------------------------------------
    // LOAD TỪNG FILE
    // --------------------------------------------------

    for (const file of files) {

        const relativePath =
            path.relative(
                rootDir,
                file
            );

        try {

            // xóa cache để reload được
            delete require.cache[
                require.resolve(file)
            ];

            const commandModule =
                require(file);

            const before =
                loadedCommands;

            const count =
                processModule(
                    commandModule,
                    relativePath
                );

            if (count > 0) {

                loadedFiles++;

                console.log(
                    `✅ ${relativePath} → ${count} command`
                );

            } else {

                skippedFiles++;

                console.log(
                    `⏭️ ${relativePath} → bỏ qua`
                );
            }

        } catch (error) {

            errorFiles++;

            console.log("");
            console.log(
                `❌ LỖI FILE: ${relativePath}`
            );

            console.log(
                error.message
            );

            console.log("");
        }
    }

    // --------------------------------------------------
    // KẾT QUẢ
    // --------------------------------------------------

    console.log("");
    console.log(
        "=========================================="
    );

    console.log(
        `📦 Đã load: ${loadedCommands} commands`
    );

    console.log(
        `📁 File có command: ${loadedFiles}`
    );

    console.log(
        `⏭️ Bỏ qua: ${skippedFiles} files`
    );

    console.log(
        `❌ Lỗi: ${errorFiles} files`
    );

    console.log(
        `🔗 Alias: ${client.aliases.size}`
    );

    console.log(
        "=========================================="
    );

    console.log("");
}

// ======================================================
// LOAD COMMAND
// ======================================================

loadCommands();

// ======================================================
// MESSAGE CREATE
// ======================================================

client.on(
    "messageCreate",
    async message => {

        try {

            // bot khác
            if (
                message.author.bot
            ) {
                return;
            }

            // không có prefix
            if (
                !message.content.startsWith(
                    PREFIX
                )
            ) {
                return;
            }

            // ------------------------------------------------
            // TÁCH COMMAND + ARGUMENT
            // ------------------------------------------------

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

            // ------------------------------------------------
            // TÌM COMMAND
            // ------------------------------------------------

            let command =
                client.commands.get(
                    commandName
                );

            // ------------------------------------------------
            // TÌM ALIAS
            // ------------------------------------------------

            if (!command) {

                const originalName =
                    client.aliases.get(
                        commandName
                    );

                if (originalName) {

                    command =
                        client.commands.get(
                            originalName
                        );
                }
            }

            // ------------------------------------------------
            // KHÔNG TÌM THẤY
            // ------------------------------------------------

            if (!command) {
                return;
            }

            // ------------------------------------------------
            // EXECUTE
            // ------------------------------------------------

            if (
                typeof command.execute !==
                "function"
            ) {

                console.log(
                    `⚠️ .${commandName} không có execute()`
                );

                return;
            }

            // ------------------------------------------------
            // CHẠY COMMAND
            // ------------------------------------------------

            await command.execute(
                message,
                args,
                client
            );

        } catch (error) {

            console.error(
                "❌ LỖI COMMAND:"
            );

            console.error(error);

            try {

                if (
                    message &&
                    message.channel
                ) {

                    await message.reply(
                        "❌ Có lỗi xảy ra khi thực hiện lệnh."
                    );
                }

            } catch (replyError) {

                console.error(
                    "❌ Không thể gửi thông báo lỗi."
                );
            }
        }
    }
);

// ======================================================
// READY
// ======================================================

client.once(
    "ready",
    () => {

        console.log("");
        console.log(
            "=========================================="
        );

        console.log(
            "🤖 HUYỀN VŨ TỨ TƯỢNG BOT"
        );

        console.log(
            "=========================================="
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
            `📦 Commands: ${client.commands.size}`
        );

        console.log(
            `🔗 Alias: ${client.aliases.size}`
        );

        console.log(
            "=========================================="
        );

        console.log(
            "🟢 BOT ĐÃ ONLINE"
        );

        console.log("");
    }
);

// ======================================================
// LỖI CLIENT
// ======================================================

client.on(
    "error",
    error => {

        console.error(
            "❌ CLIENT ERROR:"
        );

        console.error(error);
    }
);

// ======================================================
// UNHANDLED REJECTION
// ======================================================

process.on(
    "unhandledRejection",
    error => {

        console.error(
            "❌ UNHANDLED REJECTION:"
        );

        console.error(error);
    }
);

// ======================================================
// UNCAUGHT EXCEPTION
// ======================================================

process.on(
    "uncaughtException",
    error => {

        console.error(
            "❌ UNCAUGHT EXCEPTION:"
        );

        console.error(error);
    }
);

// ======================================================
// LOGIN
// ======================================================

if (!TOKEN) {

    console.error("");
    console.error(
        "❌ KHÔNG TÌM THẤY DISCORD TOKEN!"
    );

    console.error(
        "Hãy kiểm tra Variables trên Railway."
    );

    console.error(
        "Có thể dùng DISCORD_TOKEN hoặc TOKEN."
    );

    process.exit(1);
}

console.log(
    "🔐 Đang đăng nhập Discord..."
);

client.login(TOKEN)
    .then(() => {

        console.log(
            "✅ Login Discord thành công"
        );

    })
    .catch(error => {

        console.error(
            "❌ LOGIN DISCORD THẤT BẠI:"
        );

        console.error(
            error.message
        );
    });
