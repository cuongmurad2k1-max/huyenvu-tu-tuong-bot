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

// Cho các file command khác, đặc biệt help.js,
// có thể lấy trực tiếp danh sách command.
client.commands = commandMap;

// Thông tin file command
client.commandFiles = new Collection();

// ======================================================
// THỐNG KÊ
// ======================================================

let loaded = 0;
let skipped = 0;
let errors = 0;

// ======================================================
// HÀM LẤY TÊN COMMAND
// ======================================================

function getCommandName(command) {

    if (!command) {
        return null;
    }

    // ------------------------------------------
    // name
    // ------------------------------------------

    if (
        typeof command.name === "string" &&
        command.name.trim()
    ) {
        return command.name.trim();
    }

    // ------------------------------------------
    // data.name
    // ------------------------------------------

    if (
        command.data &&
        typeof command.data.name === "string" &&
        command.data.name.trim()
    ) {
        return command.data.name.trim();
    }

    // ------------------------------------------
    // command
    // ------------------------------------------

    if (
        typeof command.command === "string" &&
        command.command.trim()
    ) {
        return command.command.trim();
    }

    return null;
}

// ======================================================
// HÀM ĐĂNG KÝ COMMAND
// ======================================================

function registerCommand(command, fullPath) {

    if (!command) {
        skipped++;
        return;
    }

    // ==================================================
    // TRƯỜNG HỢP MODULE EXPORT ARRAY
    // ==================================================

    if (Array.isArray(command)) {

        for (const item of command) {
            registerCommand(item, fullPath);
        }

        return;
    }

    // ==================================================
    // TRƯỜNG HỢP:
    //
    // module.exports = {
    //     commands: [...]
    // }
    // ==================================================

    if (Array.isArray(command.commands)) {

        for (const item of command.commands) {
            registerCommand(item, fullPath);
        }

        // Nếu object này chỉ là container
        // thì không xử lý tiếp
        if (!getCommandName(command)) {
            return;
        }
    }

    // ==================================================
    // TRƯỜNG HỢP:
    //
    // module.exports = {
    //     command: {...}
    // }
    // ==================================================

    if (
        command.command &&
        typeof command.command === "object" &&
        !Array.isArray(command.command)
    ) {

        registerCommand(command.command, fullPath);

        if (!getCommandName(command)) {
            return;
        }
    }

    // ==================================================
    // LẤY TÊN
    // ==================================================

    let name = getCommandName(command);

    if (!name) {

        skipped++;

        console.log(
            `⚠️ Bỏ qua ${fullPath}: không tìm thấy tên command`
        );

        return;
    }

    name = name
        .toLowerCase()
        .trim();

    // ==================================================
    // KHÔNG CHO TRÙNG COMMAND
    // ==================================================

    if (commandMap.has(name)) {

        const oldCommand = commandMap.get(name);

        console.log(
            `⚠️ Command trùng: .${name}`
        );

        console.log(
            `   Cũ: ${oldCommand.file || "không rõ"}`
        );

        console.log(
            `   Mới: ${fullPath}`
        );

        // Giữ command đầu tiên
        return;
    }

    // ==================================================
    // LƯU COMMAND
    // ==================================================

    const commandData = {
        ...command,
        name,
        file: fullPath
    };

    commandMap.set(name, commandData);

    client.commandFiles.set(
        name,
        fullPath
    );

    loaded++;

    console.log(
        `✅ Loaded .${name}`
    );
}

// ======================================================
// LOAD 1 FILE
// ======================================================

function loadCommandFile(fullPath) {

    // Không load index.js
    if (
        path.basename(fullPath).toLowerCase() ===
        "index.js"
    ) {
        return;
    }

    try {

        // Xóa cache
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

        console.error("");
        console.error(
            `❌ LỖI LOAD: ${fullPath}`
        );

        console.error(
            error.stack || error.message
        );
    }
}

// ======================================================
// LOAD THƯ MỤC
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

        console.error(
            error.message
        );

        return;
    }

    // Sắp xếp để thứ tự ổn định
    files.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            )
    );

    for (const file of files) {

        const fullPath = path.join(
            dir,
            file.name
        );

        // ------------------------------------------
        // FOLDER
        // ------------------------------------------

        if (file.isDirectory()) {

            // Không load node_modules
            if (
                file.name === "node_modules"
            ) {
                continue;
            }

            // Không load .git
            if (
                file.name === ".git"
            ) {
                continue;
            }

            loadCommands(fullPath);

            continue;
        }

        // ------------------------------------------
        // CHỈ LOAD JS
        // ------------------------------------------

        if (
            !file.name
                .toLowerCase()
                .endsWith(".js")
        ) {
            continue;
        }

        // ------------------------------------------
        // KHÔNG LOAD INDEX
        // ------------------------------------------

        if (
            file.name
                .toLowerCase() ===
            "index.js"
        ) {
            continue;
        }

        // ------------------------------------------
        // LOAD FILE
        // ------------------------------------------

        loadCommandFile(fullPath);
    }
}

// ======================================================
// BẮT ĐẦU LOAD COMMAND
// ======================================================

console.log("");
console.log("========================================");
console.log("📚 ĐANG LOAD COMMAND");
console.log("========================================");

// ======================================================
// LOAD COMMANDS TRONG /commands
// ======================================================

const commandsDir = path.join(
    __dirname,
    "commands"
);

if (fs.existsSync(commandsDir)) {

    console.log("");
    console.log(
        "📁 Đang load: /commands"
    );

    loadCommands(
        commandsDir
    );
}

// ======================================================
// LOAD CÁC FILE JS Ở ROOT /app
// ======================================================
//
// Ví dụ:
//
// /app/01_combat.js
// /app/02_tutuong.js
// /app/03_thanth u.js
//
// ======================================================

console.log("");
console.log(
    "📁 Đang load: /app"
);

const rootFiles = fs.readdirSync(
    __dirname,
    {
        withFileTypes: true
    }
);

rootFiles.sort(
    (a, b) =>
        a.name.localeCompare(
            b.name,
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        )
);

for (const file of rootFiles) {

    if (!file.isFile()) {
        continue;
    }

    if (
        !file.name
            .toLowerCase()
            .endsWith(".js")
    ) {
        continue;
    }

    if (
        file.name
            .toLowerCase() ===
        "index.js"
    ) {
        continue;
    }

    const fullPath = path.join(
        __dirname,
        file.name
    );

    loadCommandFile(
        fullPath
    );
}

// ======================================================
// KẾT QUẢ LOAD
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

// ======================================================
// IN DANH SÁCH COMMAND
// ======================================================

console.log("");

if (commandMap.size > 0) {

    console.log(
        "📚 DANH SÁCH COMMAND ĐÃ LOAD:"
    );

    let number = 1;

    for (const [
        name,
        command
    ] of commandMap) {

        console.log(
            `${number}. .${name}`
        );

        number++;
    }

} else {

    console.log(
        "❌ KHÔNG CÓ COMMAND NÀO ĐƯỢC LOAD!"
    );
}

console.log("");
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

    // ==================================================
    // PRESENCE
    // ==================================================

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

        console.error(
            error.message
        );
    }

    console.log("");
    console.log(
        "🟢 BOT ĐÃ ONLINE"
    );

    console.log(
        `📚 Sẵn sàng nhận ${commandMap.size} command`
    );

    console.log("");
});

// ======================================================
// PREFIX COMMAND
// ======================================================

client.on(
    "messageCreate",
    async (message) => {

        try {

            // ------------------------------------------
            // BỎ QUA BOT
            // ------------------------------------------

            if (message.author.bot) {
                return;
            }

            // ------------------------------------------
            // CHỈ NHẬN PREFIX .
            // ------------------------------------------

            if (
                !message.content.startsWith(
                    PREFIX
                )
            ) {
                return;
            }

            // ------------------------------------------
            // CẮT PREFIX
            // ------------------------------------------

            const content =
                message.content
                    .slice(PREFIX.length)
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
                commandMap.get(
                    commandName
                );

            if (!command) {

                // Không phản hồi linh tinh
                return;
            }

            // ------------------------------------------
            // LOG
            // ------------------------------------------

            console.log(
                `📥 ${message.author.tag}: ${PREFIX}${commandName}`
            );

            // ------------------------------------------
            // KIỂM TRA EXECUTE
            // ------------------------------------------

            if (
                typeof command.execute !==
                "function"
            ) {

                console.error(
                    `❌ .${commandName} không có execute()`
                );

                await message.reply(
                    "❌ Command này chưa có hàm `execute`."
                );

                return;
            }

            // ------------------------------------------
            // CHẠY COMMAND
            // ------------------------------------------

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
                `❌ LỖI KHI CHẠY .${message.content}`
            );

            console.error(
                error.stack || error.message
            );

            console.error(
                "========================================"
            );

            // ------------------------------------------
            // BÁO LỖI CHO USER
            // ------------------------------------------

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

                console.error(
                    replyError.message
                );
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
            "❌ DISCORD CLIENT ERROR:"
        );

        console.error(
            error.stack || error.message
        );
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

        console.warn(
            warning
        );
    }
);

// ======================================================
// DEBUG
// ======================================================

client.on(
    "debug",
    (message) => {

        // Không cần in toàn bộ debug
        // để Railway Console không bị spam

        if (
            message.includes(
                "Heartbeat"
            )
        ) {
            return;
        }

        if (
            message.includes(
                "Session"
            )
        ) {
            console.log(
                `🔧 ${message}`
            );
        }
    }
);

// ======================================================
// UNHANDLED REJECTION
// ======================================================

process.on(
    "unhandledRejection",
    (error) => {

        console.error(
            "❌ UNHANDLED REJECTION:"
        );

        console.error(
            error?.stack ||
            error
        );
    }
);

// ======================================================
// UNCAUGHT EXCEPTION
// ======================================================

process.on(
    "uncaughtException",
    (error) => {

        console.error(
            "❌ UNCAUGHT EXCEPTION:"
        );

        console.error(
            error?.stack ||
            error
        );
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

        console.error(
            error?.stack ||
            error
        );

        process.exit(1);
    });
