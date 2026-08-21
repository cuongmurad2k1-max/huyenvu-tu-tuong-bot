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

// QUAN TRỌNG
// Cho help.js và các hệ thống khác lấy toàn bộ command
client.commandMap = commandMap;

let loaded = 0;
let skipped = 0;
let errors = 0;

// ======================================================
// LOAD COMMAND FILES
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

        console.error(error);

        return;
    }

    for (const file of files) {

        const fullPath =
            path.join(
                dir,
                file.name
            );

        // ==================================================
        // FOLDER
        // ==================================================

        if (file.isDirectory()) {

            loadCommands(fullPath);

            continue;
        }

        // ==================================================
        // CHỈ LOAD JS
        // ==================================================

        if (!file.name.endsWith(".js")) {

            continue;
        }

        // ==================================================
        // KHÔNG LOAD INDEX.JS
        // ==================================================

        if (
            file.name.toLowerCase() ===
            "index.js"
        ) {

            continue;
        }

        try {

            // Xóa cache
            delete require.cache[
                require.resolve(fullPath)
            ];

            const command =
                require(fullPath);

            // ==================================================
            // COMMAND KHÔNG HỢP LỆ
            // ==================================================

            if (!command) {

                skipped++;

                console.log(
                    `⚠️ Bỏ qua ${fullPath}: file rỗng`
                );

                continue;
            }

            // ==================================================
            // TÌM TÊN COMMAND
            // ==================================================

            let name = null;

            // ----------------------------------------------
            // Kiểu:
            //
            // module.exports = {
            //     name: "boss",
            //     execute(...)
            // }
            // ----------------------------------------------

            if (
                typeof command.name ===
                "string"
            ) {

                name =
                    command.name;
            }

            // ----------------------------------------------
            // SlashCommandBuilder
            //
            // data.name
            // ----------------------------------------------

            if (
                !name &&
                command.data &&
                typeof command.data.name ===
                "string"
            ) {

                name =
                    command.data.name;
            }

            // ----------------------------------------------
            // Kiểu:
            //
            // command: "boss"
            // ----------------------------------------------

            if (
                !name &&
                typeof command.command ===
                "string"
            ) {

                name =
                    command.command;
            }

            // ----------------------------------------------
            // Kiểu:
            //
            // command.name.name
            // ----------------------------------------------

            if (
                !name &&
                command.data &&
                command.data.name
            ) {

                name =
                    String(
                        command.data.name
                    );
            }

            // ==================================================
            // KHÔNG CÓ TÊN
            // ==================================================

            if (!name) {

                skipped++;

                console.log(
                    `⚠️ Bỏ qua ${fullPath}: không tìm thấy tên command`
                );

                continue;
            }

            // ==================================================
            // CHUẨN HÓA TÊN
            // ==================================================

            name =
                String(name)
                    .trim()
                    .toLowerCase();

            // ==================================================
            // KIỂM TRA TRÙNG COMMAND
            // ==================================================

            if (
                commandMap.has(name)
            ) {

                console.log(
                    `⚠️ Trùng command .${name}`
                );

                console.log(
                    `   File cũ: ${commandMap.get(name).file}`
                );

                console.log(
                    `   File mới: ${fullPath}`
                );

                // Giữ command đầu tiên
                skipped++;

                continue;
            }

            // ==================================================
            // LƯU COMMAND
            // ==================================================

            commandMap.set(
                name,
                {
                    ...command,

                    name,

                    file: fullPath
                }
            );

            loaded++;

            console.log(
                `✅ [${loaded}] .${name}`
            );

        } catch (error) {

            errors++;

            console.error(
                `❌ Lỗi load ${fullPath}:`
            );

            console.error(
                error
            );
        }
    }
}

// ======================================================
// LOAD
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

const commandsPath =
    path.join(
        __dirname,
        "commands"
    );

console.log(
    `📂 Thư mục command: ${commandsPath}`
);

loadCommands(
    commandsPath
);

console.log(
    "========================================"
);

console.log(
    `📦 Đã load: ${loaded} commands`
);

console.log(
    `⚠️ Bỏ qua: ${skipped} files`
);

console.log(
    `❌ Lỗi: ${errors} files`
);

console.log(
    `🗺️ CommandMap: ${commandMap.size}`
);

console.log(
    "========================================"
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
                "⚠️ Không thể đặt presence:"
            );

            console.error(
                error
            );
        }

        console.log(
            "🟢 BOT ĐÃ ONLINE"
        );
    }
);

// ======================================================
// PREFIX COMMAND
// ======================================================

client.on(
    "messageCreate",
    async (message) => {

        try {

            // ==================================================
            // BỎ QUA BOT
            // ==================================================

            if (
                message.author.bot
            ) {

                return;
            }

            // ==================================================
            // KHÔNG CÓ PREFIX
            // ==================================================

            if (
                !message.content ||
                !message.content.startsWith(
                    PREFIX
                )
            ) {

                return;
            }

            // ==================================================
            // CẮT PREFIX
            // ==================================================

            const content =
                message.content
                    .slice(
                        PREFIX.length
                    )
                    .trim();

            if (!content) {

                return;
            }

            // ==================================================
            // TÁCH COMMAND + ARGS
            // ==================================================

            const args =
                content.split(
                    /\s+/
                );

            const commandName =
                args
                    .shift()
                    .toLowerCase();

            // ==================================================
            // TÌM COMMAND
            // ==================================================

            const command =
                commandMap.get(
                    commandName
                );

            // ==================================================
            // KHÔNG TÌM THẤY
            // ==================================================

            if (!command) {

                console.log(
                    `⚠️ Không tìm thấy command: .${commandName}`
                );

                return;
            }

            // ==================================================
            // LOG
            // ==================================================

            console.log(
                `📥 ${message.author.tag}: .${commandName}`
            );

            console.log(
                `📄 File: ${command.file || "Không rõ"}`
            );

            // ==================================================
            // KIỂM TRA EXECUTE
            // ==================================================

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

            // ==================================================
            // CHẠY PREFIX COMMAND
            // ==================================================

            await command.execute(
                message,
                args
            );

        } catch (error) {

            console.error(
                `❌ Lỗi khi chạy command:`
            );

            console.error(
                error
            );

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
                    replyError
                );
            }
        }
    }
);

// ======================================================
// DISCORD CLIENT ERROR
// ======================================================

client.on(
    "error",
    (error) => {

        console.error(
            "❌ Discord Client Error:"
        );

        console.error(
            error
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
            "⚠️ Discord Warning:"
        );

        console.warn(
            warning
        );
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

        console.error(
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
            "❌ Uncaught Exception:"
        );

        console.error(
            error
        );
    }
);

// ======================================================
// PROCESS WARNING
// ======================================================

process.on(
    "warning",
    (warning) => {

        console.warn(
            "⚠️ Node Warning:"
        );

        console.warn(
            warning
        );
    }
);

// ======================================================
// LOGIN
// ======================================================

console.log("");

console.log(
    "🔐 Đang đăng nhập Discord..."
);

client.login(
    TOKEN
)
    .then(
        () => {

            console.log(
                "✅ Login Discord thành công"
            );
        }
    )
    .catch(
        (error) => {

            console.error(
                "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD!"
            );

            console.error(
                error
            );

            process.exit(1);
        }
    );
