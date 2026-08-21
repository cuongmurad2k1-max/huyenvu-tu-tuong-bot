require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Partials
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================================================
// CONFIG
// ======================================================

const PREFIX = process.env.PREFIX || ".";

const TOKEN =
    process.env.TOKEN ||
    process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error("❌ KHÔNG TÌM THẤY TOKEN");
    console.error("➡️ Vào Railway → Variables → thêm TOKEN");
    process.exit(1);
}

// ======================================================
// DISCORD CLIENT
// ======================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
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

const commands = new Map();

client.commands = commands;

// ======================================================
// THỐNG KÊ
// ======================================================

let loadedFiles = 0;
let loadedCommands = 0;
let skippedFiles = 0;
let failedFiles = 0;

// ======================================================
// DANH SÁCH FILE KHÔNG PHẢI COMMAND
// ======================================================

const IGNORE_FILES = new Set([
    "index.js",
    "database.js",
    "db.js",
    "config.js",
    "package.json"
]);

const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    "systems",
    "data",
    "database",
    "assets",
    "events"
]);

// ======================================================
// LẤY TOÀN BỘ FILE JS
// ======================================================

function getJSFiles(dir) {

    let result = [];

    if (!fs.existsSync(dir)) {
        return result;
    }

    let files;

    try {
        files = fs.readdirSync(dir);
    } catch (error) {
        console.error(
            `❌ Không thể đọc thư mục: ${dir}`
        );

        return result;
    }

    for (const file of files) {

        const fullPath = path.join(
            dir,
            file
        );

        let stat;

        try {
            stat = fs.statSync(fullPath);
        } catch {
            continue;
        }

        // ------------------------------
        // THƯ MỤC
        // ------------------------------

        if (stat.isDirectory()) {

            if (IGNORE_DIRS.has(file)) {
                continue;
            }

            result.push(
                ...getJSFiles(fullPath)
            );

            continue;
        }

        // ------------------------------
        // FILE
        // ------------------------------

        if (!stat.isFile()) {
            continue;
        }

        if (!file.endsWith(".js")) {
            continue;
        }

        if (IGNORE_FILES.has(file)) {
            continue;
        }

        // File bắt đầu bằng _
        if (file.startsWith("_")) {
            continue;
        }

        result.push(fullPath);
    }

    return result;
}

// ======================================================
// CHUẨN HÓA TÊN COMMAND
// ======================================================

function normalizeCommandName(name) {

    if (!name) {
        return null;
    }

    name = String(name)
        .trim()
        .toLowerCase();

    // bỏ dấu chấm nếu file/module có .
    if (name.startsWith(".")) {
        name = name.substring(1);
    }

    // chỉ lấy command đầu tiên
    name = name.split(/\s+/)[0];

    if (!name) {
        return null;
    }

    return name;
}

// ======================================================
// ĐĂNG KÝ COMMAND
// ======================================================

function registerCommand(name, handler, source) {

    const commandName =
        normalizeCommandName(name);

    if (!commandName) {
        return false;
    }

    if (
        typeof handler !== "function"
    ) {
        return false;
    }

    // Nếu trùng command
    if (commands.has(commandName)) {

        console.warn(
            `⚠️ Trùng .${commandName}`
        );

        console.warn(
            `   File: ${source}`
        );

        return false;
    }

    commands.set(
        commandName,
        {
            name: commandName,
            execute: handler,
            source
        }
    );

    loadedCommands++;

    return true;
}

// ======================================================
// LOAD MODULE
// ======================================================

function loadModule(filePath) {

    const relativePath =
        path.relative(
            __dirname,
            filePath
        );

    try {

        delete require.cache[
            require.resolve(filePath)
        ];

        let moduleExport =
            require(filePath);

        // ES module default
        if (
            moduleExport &&
            moduleExport.default
        ) {
            moduleExport =
                moduleExport.default;
        }

        // ==============================================
        // TRƯỜNG HỢP 1:
        // module export function
        // ==============================================

        if (
            typeof moduleExport === "function"
        ) {

            const commandName =
                path.basename(
                    filePath,
                    ".js"
                );

            // bỏ số đầu file:
            // 01_combat.js -> combat
            const cleanName =
                commandName
                    .replace(
                        /^\d+[_-]?/,
                        ""
                    )
                    .toLowerCase();

            registerCommand(
                cleanName,
                moduleExport,
                relativePath
            );

            loadedFiles++;

            return;
        }

        // ==============================================
        // TRƯỜNG HỢP 2:
        // module có execute
        // ==============================================

        if (
            moduleExport &&
            typeof moduleExport.execute === "function"
        ) {

            let commandName =
                moduleExport.name;

            // Nếu không có name
            // lấy tên file
            if (!commandName) {

                commandName =
                    path.basename(
                        filePath,
                        ".js"
                    )
                    .replace(
                        /^\d+[_-]?/,
                        ""
                    );
            }

            registerCommand(
                commandName,
                moduleExport.execute,
                relativePath
            );

            loadedFiles++;

            return;
        }

        // ==============================================
        // TRƯỜNG HỢP 3:
        // module có run
        // ==============================================

        if (
            moduleExport &&
            typeof moduleExport.run === "function"
        ) {

            let commandName =
                moduleExport.name;

            if (!commandName) {

                commandName =
                    path.basename(
                        filePath,
                        ".js"
                    )
                    .replace(
                        /^\d+[_-]?/,
                        ""
                    );
            }

            registerCommand(
                commandName,
                moduleExport.run,
                relativePath
            );

            loadedFiles++;

            return;
        }

        // ==============================================
        // TRƯỜNG HỢP 4:
        // module có handler
        // ==============================================

        if (
            moduleExport &&
            typeof moduleExport.handler === "function"
        ) {

            let commandName =
                moduleExport.name;

            if (!commandName) {

                commandName =
                    path.basename(
                        filePath,
                        ".js"
                    )
                    .replace(
                        /^\d+[_-]?/,
                        ""
                    );
            }

            registerCommand(
                commandName,
                moduleExport.handler,
                relativePath
            );

            loadedFiles++;

            return;
        }

        // ==============================================
        // TRƯỜNG HỢP 5:
        // export object commands
        // ==============================================

        if (
            moduleExport &&
            moduleExport.commands &&
            typeof moduleExport.commands === "object"
        ) {

            let count = 0;

            for (
                const [name, handler]
                of Object.entries(
                    moduleExport.commands
                )
            ) {

                if (
                    typeof handler === "function"
                ) {

                    if (
                        registerCommand(
                            name,
                            handler,
                            relativePath
                        )
                    ) {
                        count++;
                    }
                }

                else if (
                    handler &&
                    typeof handler.execute === "function"
                ) {

                    if (
                        registerCommand(
                            name,
                            handler.execute,
                            relativePath
                        )
                    ) {
                        count++;
                    }
                }
            }

            if (count > 0) {
                loadedFiles++;
                return;
            }
        }

        // ==============================================
        // TRƯỜNG HỢP 6:
        // export array
        // ==============================================

        if (
            Array.isArray(moduleExport)
        ) {

            let count = 0;

            for (
                const command
                of moduleExport
            ) {

                if (!command) {
                    continue;
                }

                if (
                    typeof command === "function"
                ) {

                    const name =
                        command.name;

                    if (
                        registerCommand(
                            name,
                            command,
                            relativePath
                        )
                    ) {
                        count++;
                    }

                    continue;
                }

                if (
                    typeof command.execute ===
                    "function"
                ) {

                    if (
                        registerCommand(
                            command.name,
                            command.execute,
                            relativePath
                        )
                    ) {
                        count++;
                    }
                }
            }

            if (count > 0) {
                loadedFiles++;
                return;
            }
        }

        // ==============================================
        // KHÔNG PHẢI PREFIX COMMAND
        // ==============================================

        skippedFiles++;

        console.warn(
            `⚠️ Bỏ qua ${relativePath}: không nhận diện được prefix command.`
        );

    } catch (error) {

        failedFiles++;

        console.error("");
        console.error(
            `❌ Không thể load ${relativePath}`
        );

        console.error(
            error.message
        );

        console.error("");
    }
}

// ======================================================
// LOAD TẤT CẢ COMMAND
// ======================================================

function loadCommands() {

    console.log("");
    console.log(
        "========================================"
    );

    console.log(
        "📦 ĐANG QUÉT PREFIX COMMANDS"
    );

    console.log(
        "========================================"
    );

    // ----------------------------------------------
    // Quét /app
    // ----------------------------------------------

    const rootFiles =
        getJSFiles(__dirname);

    // ----------------------------------------------
    // Load
    // ----------------------------------------------

    for (
        const filePath
        of rootFiles
    ) {

        // index.js
        if (
            path.basename(filePath) ===
            "index.js"
        ) {
            continue;
        }

        loadModule(filePath);
    }

    console.log("");
    console.log(
        "========================================"
    );

    console.log(
        `📁 File command đã load: ${loadedFiles}`
    );

    console.log(
        `⚔️ Prefix commands: ${loadedCommands}`
    );

    console.log(
        `⚠️ File bỏ qua: ${skippedFiles}`
    );

    console.log(
        `❌ File lỗi: ${failedFiles}`
    );

    console.log(
        `📌 Prefix: ${PREFIX}`
    );

    console.log(
        "========================================"
    );

    console.log("");

    // ----------------------------------------------
    // IN DANH SÁCH COMMAND
    // ----------------------------------------------

    if (commands.size > 0) {

        console.log(
            "📋 DANH SÁCH COMMAND:"
        );

        const names =
            [...commands.keys()]
                .sort();

        let line = "";

        for (
            let i = 0;
            i < names.length;
            i++
        ) {

            line +=
                `${PREFIX}${names[i]} `;

            // mỗi dòng 10 command
            if (
                (i + 1) % 10 === 0
            ) {

                console.log(
                    line
                );

                line = "";
            }
        }

        if (line) {
            console.log(line);
        }

        console.log("");
    }
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

            // Bot khác
            if (message.author.bot) {
                return;
            }

            // Không có content
            if (
                !message.content ||
                typeof message.content !== "string"
            ) {
                return;
            }

            // Không bắt đầu bằng prefix
            if (
                !message.content.startsWith(
                    PREFIX
                )
            ) {
                return;
            }

            // ------------------------------------------
            // BỎ PREFIX
            // ------------------------------------------

            const content =
                message.content
                    .slice(
                        PREFIX.length
                    )
                    .trim();

            if (!content) {
                return;
            }

            // ------------------------------------------
            // TÁCH COMMAND + ARGS
            // ------------------------------------------

            const parts =
                content.split(/\s+/);

            const commandName =
                parts
                    .shift()
                    .toLowerCase();

            const args = parts;

            // ------------------------------------------
            // TÌM COMMAND
            // ------------------------------------------

            const command =
                commands.get(
                    commandName
                );

            if (!command) {
                return;
            }

            // ------------------------------------------
            // CONTEXT
            // ------------------------------------------

            const ctx = {
                message,
                client,
                args,
                commandName,
                prefix: PREFIX,
                commands
            };

            // ------------------------------------------
            // CHẠY COMMAND
            // ------------------------------------------

            await command.execute(
                message,
                args,
                ctx
            );

        } catch (error) {

            console.error(
                "❌ LỖI PREFIX COMMAND:"
            );

            console.error(error);

            try {

                if (
                    message &&
                    message.channel
                ) {

                    await message.channel.send(
                        "❌ Có lỗi xảy ra khi thực hiện lệnh."
                    );
                }

            } catch {}
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
            "========================================"
        );

        console.log(
            `🟢 ${client.user.tag} ONLINE`
        );

        console.log(
            `📌 Prefix: ${PREFIX}`
        );

        console.log(
            `⚔️ Commands: ${commands.size}`
        );

        console.log(
            `🌐 Servers: ${client.guilds.cache.size}`
        );

        console.log(
            "========================================"
        );

        console.log("");

        console.log(
            "💡 Ví dụ:"
        );

        console.log(
            `${PREFIX}help`
        );

        console.log(
            `${PREFIX}boss`
        );

        console.log(
            `${PREFIX}tu`
        );

        console.log(
            `${PREFIX}phoban`
        );

        console.log("");
    }
);

// ======================================================
// LOGIN ERROR
// ======================================================

client.on(
    "error",
    error => {

        console.error(
            "❌ Discord Client Error:"
        );

        console.error(error);
    }
);

// ======================================================
// DISCONNECT
// ======================================================

client.on(
    "shardDisconnect",
    (event, shardId) => {

        console.error(
            `⚠️ Discord shard ${shardId} disconnected.`
        );
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
            "✅ Đã gửi yêu cầu đăng nhập Discord."
        );

    })
    .catch(error => {

        console.error("");
        console.error(
            "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD"
        );

        console.error(
            error.message
        );

        console.error("");

        process.exit(1);
    });
