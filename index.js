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
        console.log(`⚠️ Không tìm thấy thư mục: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });

    for (const file of files) {

        const fullPath = path.join(dir, file.name);

        // Folder
        if (file.isDirectory()) {
            loadCommands(fullPath);
            continue;
        }

        // Chỉ load JS
        if (!file.name.endsWith(".js")) {
            continue;
        }

        // Không load index.js
        if (file.name === "index.js") {
            continue;
        }

        try {
            delete require.cache[require.resolve(fullPath)];

            const command = require(fullPath);

            if (!command) {
                skipped++;
                continue;
            }

            // ==================================================
            // HỖ TRỢ NHIỀU KIỂU COMMAND
            // ==================================================

            let name = null;

            // Kiểu:
            // module.exports = {
            //   name: "boss",
            //   execute(...)
            // }
            if (typeof command.name === "string") {
                name = command.name;
            }

            // Kiểu SlashCommandBuilder
            // data.name
            if (!name && command.data && command.data.name) {
                name = command.data.name;
            }

            // Kiểu:
            // module.exports = {
            //   command: "boss"
            // }
            if (!name && typeof command.command === "string") {
                name = command.command;
            }

            if (!name) {
                skipped++;
                console.log(
                    `⚠️ Bỏ qua ${fullPath}: không tìm thấy tên command`
                );
                continue;
            }

            name = name.toLowerCase();

            commandMap.set(name, {
                ...command,
                name,
                file: fullPath
            });

            loaded++;

        } catch (error) {

            errors++;

            console.error(
                `❌ Lỗi load ${fullPath}:`
            );

            console.error(error.message);
        }
    }
}

// ======================================================
// LOAD
// ======================================================

console.log("========================================");
console.log("📚 ĐANG LOAD COMMAND");
console.log("========================================");

loadCommands(path.join(__dirname, "commands"));

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

    console.log(`👤 Bot: ${client.user.tag}`);
    console.log(`🆔 ID: ${client.user.id}`);
    console.log(`🔑 Prefix: ${PREFIX}`);
    console.log(`📦 Commands: ${commandMap.size}`);

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

client.on("messageCreate", async (message) => {

    try {

        // Bỏ bot
        if (message.author.bot) {
            return;
        }

        // Không có prefix
        if (!message.content.startsWith(PREFIX)) {
            return;
        }

        // Cắt prefix
        const content = message.content.slice(PREFIX.length).trim();

        if (!content) {
            return;
        }

        // Tách command + args
        const args = content.split(/\s+/);

        const commandName = args.shift().toLowerCase();

        // Tìm command
        const command = commandMap.get(commandName);

        if (!command) {
            return;
        }

        console.log(
            `📥 ${message.author.tag}: ${PREFIX}${commandName}`
        );

        // ==================================================
        // EXECUTE PREFIX COMMAND
        // ==================================================

        if (typeof command.execute !== "function") {

            await message.reply(
                "❌ Command này chưa có hàm `execute`."
            );

            return;
        }

        /*
         * Hỗ trợ command prefix dạng:
         *
         * execute(message, args)
         */

        await command.execute(message, args);

    } catch (error) {

        console.error(
            `❌ Lỗi khi chạy .${message.content}:`
        );

        console.error(error);

        try {

            if (!message.replied && !message.deferred) {

                await message.reply(
                    "❌ Có lỗi xảy ra khi thực hiện lệnh."
                );

            }

        } catch {}
    }
});

// ======================================================
// ERROR HANDLERS
// ======================================================

client.on("error", (error) => {
    console.error("❌ Discord Client Error:");
    console.error(error);
});

process.on("unhandledRejection", (error) => {
    console.error("❌ Unhandled Rejection:");
    console.error(error);
});

process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:");
    console.error(error);
});

// ======================================================
// LOGIN
// ======================================================

console.log("🔐 Đang đăng nhập Discord...");

client.login(TOKEN)
    .then(() => {
        console.log("✅ Login Discord thành công");
    })
    .catch((error) => {

        console.error("❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD!");

        console.error(error);

        process.exit(1);
    });
