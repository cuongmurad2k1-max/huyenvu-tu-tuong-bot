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
// LOAD COMMAND FILES
// ======================================================

function loadCommands(dir) {

    if (!fs.existsSync(dir)) {

        console.log(
            `⚠️ Không tìm thấy thư mục: ${dir}`
        );

        return;
    }

    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });

    for (const file of files) {

        const fullPath =
            path.join(dir, file.name);

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
        // KHÔNG LOAD INDEX
        // ==================================================

        if (file.name === "index.js") {
            continue;
        }

        try {

            delete require.cache[
                require.resolve(fullPath)
            ];

            const command =
                require(fullPath);

            if (!command) {

                skipped++;

                continue;
            }

            // ==================================================
            // TÌM TÊN COMMAND
            // ==================================================

            let name = null;

            // name
            if (
                typeof command.name ===
                "string"
            ) {

                name = command.name;
            }

            // SlashCommandBuilder
            if (
                !name &&
                command.data &&
                command.data.name
            ) {

                name =
                    command.data.name;
            }

            // command
            if (
                !name &&
                typeof command.command ===
                "string"
            ) {

                name =
                    command.command;
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

            name =
                name.toLowerCase();

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

        } catch (error) {

            errors++;

            console.error(
                `❌ Lỗi load ${fullPath}:`
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

console.log(
    "========================================"
);

console.log(
    "📚 ĐANG LOAD COMMAND"
);

console.log(
    "========================================"
);

loadCommands(
    path.join(
        __dirname,
        "commands"
    )
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
    "========================================"
);

// ======================================================
// READY
// ======================================================

client.once("ready", () => {

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

    console.log(
        "🟢 BOT ĐÃ ONLINE"
    );
});

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

            if (message.author.bot) {
                return;
            }

            // ==================================================
            // KHÔNG CÓ PREFIX
            // ==================================================

            if (
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
                    .slice(PREFIX.length)
                    .trim();

            if (!content) {
                return;
            }

            // ==================================================
            // TÁCH COMMAND + ARGS
            // ==================================================

            const args =
                content.split(/\s+/);

            const commandName =
                args.shift()
                    .toLowerCase();

            // ==================================================
            // TÌM COMMAND
            // ==================================================

            const command =
                commandMap.get(
                    commandName
                );

            if (!command) {
                return;
            }

            console.log(
                `📥 ${message.author.tag}: ${PREFIX}${commandName}`
            );

            // ==================================================
            // KIỂM TRA EXECUTE
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

            // ==================================================
            // EXECUTE COMMAND
            // ==================================================
            //
            // QUAN TRỌNG:
            // Truyền commandMap vào tham số thứ 3.
            //
            // Các command cũ:
            // execute(message, args)
            //
            // vẫn hoạt động bình thường.
            //
            // Riêng help:
            // execute(message, args, commandMap)
            //
            // sẽ lấy được toàn bộ command.
            // ==================================================

            await command.execute(
                message,
                args,
                commandMap
            );

        } catch (error) {

            console.error(
                `❌ Lỗi khi chạy .${message.content}:`
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
// ERROR HANDLERS
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
