require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require("discord.js");

// =====================================================
// CONFIG
// =====================================================

const PREFIX = ".";

const TOKEN = process.env.TOKEN || process.env.DISCORD_TOKEN;
const CLIENT_ID =
    process.env.CLIENT_ID ||
    process.env.DISCORD_CLIENT_ID;

if (!TOKEN) {
    console.error("❌ Không tìm thấy TOKEN trong Variables.");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ Không tìm thấy CLIENT_ID trong Variables.");
    process.exit(1);
}

// =====================================================
// CLIENT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =====================================================
// COMMAND MAP
// =====================================================

client.commands = new Collection();

let loadedCommands = 0;
let loadedFiles = 0;
let failedFiles = 0;

// =====================================================
// LOAD COMMAND BUNDLES
// =====================================================

function loadCommands() {

    const appDir = __dirname;

    const files = fs
        .readdirSync(appDir)
        .filter(file => file.endsWith(".js"))
        .filter(file => file !== "index.js")
        .filter(file => file !== "database.js")
        .filter(file => /^\d+_.+\.js$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, {
            numeric: true
        }));

    console.log(`📂 Tìm thấy ${files.length} command bundle.`);

    for (const file of files) {

        const fullPath = path.join(appDir, file);

        try {

            delete require.cache[require.resolve(fullPath)];

            const bundle = require(fullPath);

            loadedFiles++;

            let commands = [];

            // -----------------------------------------
            // Trường hợp file export mảng
            // -----------------------------------------

            if (Array.isArray(bundle)) {
                commands = bundle;
            }

            // -----------------------------------------
            // Trường hợp:
            // module.exports = {
            //     commands: [...]
            // }
            // -----------------------------------------

            else if (
                bundle &&
                Array.isArray(bundle.commands)
            ) {
                commands = bundle.commands;
            }

            // -----------------------------------------
            // Trường hợp:
            // module.exports = {
            //     command1: {...},
            //     command2: {...}
            // }
            // -----------------------------------------

            else if (
                bundle &&
                typeof bundle === "object"
            ) {

                const values = Object.values(bundle);

                const possibleCommands = values.filter(item =>
                    item &&
                    typeof item === "object" &&
                    (
                        item.data ||
                        item.name ||
                        item.execute
                    )
                );

                if (possibleCommands.length > 0) {
                    commands = possibleCommands;
                }

                // -----------------------------------------
                // Trường hợp bundle chính là 1 command
                // -----------------------------------------

                else if (
                    bundle.data ||
                    bundle.name ||
                    bundle.execute
                ) {
                    commands = [bundle];
                }
            }

            // -----------------------------------------
            // LOAD TỪNG COMMAND
            // -----------------------------------------

            let fileCount = 0;

            for (const command of commands) {

                if (!command) continue;

                let name = null;

                // Discord SlashCommandBuilder
                if (
                    command.data &&
                    typeof command.data.name === "string"
                ) {
                    name = command.data.name;
                }

                // Prefix command
                else if (
                    typeof command.name === "string"
                ) {
                    name = command.name;
                }

                if (!name) {
                    continue;
                }

                // Chuẩn hóa tên command
                name = name
                    .toLowerCase()
                    .trim()
                    .replace(/^\//, "")
                    .replace(/^\./, "");

                if (!name) {
                    continue;
                }

                // Nếu trùng tên
                if (client.commands.has(name)) {

                    console.warn(
                        `⚠️ Trùng command .${name} trong ${file}`
                    );

                    continue;
                }

                client.commands.set(name, command);

                loadedCommands++;
                fileCount++;
            }

            console.log(
                `✅ ${file}: ${fileCount} commands`
            );

        } catch (error) {

            failedFiles++;

            console.error(
                `❌ Không thể load ${fullPath}:`
            );

            console.error(error.message);
        }
    }

    console.log("");
    console.log("📦 Đã quét toàn bộ command bundle.");
    console.log(
        `📜 Command Map: ${client.commands.size} commands`
    );
    console.log(
        `📁 Bundle thành công: ${loadedFiles}`
    );
    console.log(
        `❌ Bundle lỗi: ${failedFiles}`
    );
}

// =====================================================
// XÓA TOÀN BỘ SLASH COMMAND
// =====================================================

async function deleteSlashCommands() {

    try {

        const rest = new REST({
            version: "10"
        }).setToken(TOKEN);

        console.log("🧹 Đang xóa toàn bộ Slash Commands...");

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            {
                body: []
            }
        );

        console.log(
            "✅ Đã xóa toàn bộ Global Slash Commands."
        );

    } catch (error) {

        console.error(
            "⚠️ Không thể xóa Global Slash Commands:"
        );

        console.error(error.message);
    }
}

// =====================================================
// MESSAGE COMMAND
// =====================================================

client.on("messageCreate", async message => {

    try {

        // Bỏ qua bot
        if (message.author.bot) return;

        // Chỉ nhận prefix .
        if (!message.content.startsWith(PREFIX)) {
            return;
        }

        // -----------------------------------------
        // Tách command + arguments
        // -----------------------------------------

        const content = message.content.slice(PREFIX.length).trim();

        if (!content) return;

        const args = content.split(/\s+/);

        const commandName = args
            .shift()
            .toLowerCase();

        // -----------------------------------------
        // Tìm command
        // -----------------------------------------

        const command = client.commands.get(commandName);

        if (!command) {
            return;
        }

        // -----------------------------------------
        // Execute
        // -----------------------------------------

        if (typeof command.execute !== "function") {

            console.warn(
                `⚠️ Command .${commandName} không có execute().`
            );

            return;
        }

        // -----------------------------------------
        // Hỗ trợ nhiều kiểu command cũ
        // -----------------------------------------

        await command.execute(
            message,
            args,
            client
        );

    } catch (error) {

        console.error(
            `❌ Lỗi khi chạy .${message.content}:`
        );

        console.error(error);

        try {

            if (!message.replied) {

                await message.reply(
                    "❌ Đã xảy ra lỗi khi thực hiện lệnh."
                );

            }

        } catch {}
    }
});

// =====================================================
// READY
// =====================================================

client.once("ready", async () => {

    console.log("");
    console.log("======================================");
    console.log("🐢 HUỲỀN VŨ TỨ TƯỢNG");
    console.log("======================================");

    console.log(
        `🤖 ${client.user.tag} ONLINE`
    );

    console.log(
        `📜 Prefix: ${PREFIX}`
    );

    console.log(
        `📚 Commands: ${client.commands.size}`
    );

    console.log(
        `🌐 Servers: ${client.guilds.cache.size}`
    );

    console.log("======================================");

    // Xóa Slash Command
    await deleteSlashCommands();

    console.log("");
    console.log(
        `✅ BOT SẴN SÀNG - DÙNG PREFIX ${PREFIX}`
    );

    console.log(
        `💡 Ví dụ: ${PREFIX}help`
    );
});

// =====================================================
// LOAD COMMANDS
// =====================================================

loadCommands();

// =====================================================
// LOGIN
// =====================================================

console.log("🔐 Đang đăng nhập Discord...");

client.login(TOKEN)
    .then(() => {

        console.log(
            "🔗 Đang kết nối Discord..."
        );

    })
    .catch(error => {

        console.error(
            "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:"
        );

        console.error(error);

        process.exit(1);
    });
