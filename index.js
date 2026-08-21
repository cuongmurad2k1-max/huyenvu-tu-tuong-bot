const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const Module = require("module");

// ===============================
// CLIENT
// ===============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ===============================
// CONFIG
// ===============================

const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || process.env.DISCORD_CLIENT_ID;

if (!TOKEN) {
    console.error("❌ Không tìm thấy DISCORD_TOKEN/TOKEN trong Variables.");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ Không tìm thấy CLIENT_ID/DISCORD_CLIENT_ID trong Variables.");
    process.exit(1);
}

// ===============================
// COLLECTION
// ===============================

client.commands = new Collection();

const commands = [];

// ===============================
// THƯ MỤC BOT
// ===============================

const ROOT = __dirname;

// ===============================
// TÌM TOÀN BỘ FILE JS
// ===============================

function getAllJSFiles(dir) {
    let result = [];

    if (!fs.existsSync(dir)) {
        return result;
    }

    const files = fs.readdirSync(dir, {
        withFileTypes: true
    });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {

            // Không quét node_modules
            if (file.name === "node_modules") {
                continue;
            }

            result = result.concat(
                getAllJSFiles(fullPath)
            );

        } else if (
            file.isFile() &&
            file.name.endsWith(".js")
        ) {
            result.push(fullPath);
        }
    }

    return result;
}

// ===============================
// LOAD COMMAND AN TOÀN
// ===============================

function loadCommand(filePath) {

    try {

        // Không load index chính
        if (path.resolve(filePath) === path.resolve(__filename)) {
            return;
        }

        const fileName = path.basename(filePath);

        // Không load database như command
        if (
            fileName === "database.js" ||
            fileName === "db.js"
        ) {
            return;
        }

        let source = fs.readFileSync(
            filePath,
            "utf8"
        );

        // =========================================
        // TỰ ĐỘNG SỬA require("../database")
        // THÀNH require("./database")
        // =========================================

        source = source
            .replace(
                /require\s*\(\s*["']\.\.\/database["']\s*\)/g,
                'require("./database")'
            )
            .replace(
                /require\s*\(\s*["']\.\.\/database\.js["']\s*\)/g,
                'require("./database.js")'
            );

        // =========================================
        // TỰ ĐỘNG SỬA ../database/... 
        // =========================================

        source = source.replace(
            /require\s*\(\s*["']\.\.\/database\/([^"']+)["']\s*\)/g,
            'require("./database/$1")'
        );

        // =========================================
        // TẠO MODULE
        // =========================================

        const commandModule = new Module(
            filePath,
            module
        );

        commandModule.filename = filePath;

        commandModule.paths =
            Module._nodeModulePaths(
                path.dirname(filePath)
            );

        // Compile code sau khi đã sửa đường dẫn
        commandModule._compile(
            source,
            filePath
        );

        const command = commandModule.exports;

        // =========================================
        // KIỂM TRA COMMAND
        // =========================================

        if (
            !command ||
            !command.data ||
            !command.data.name
        ) {
            console.warn(
                `⚠️ Bỏ qua ${filePath}: không phải slash command hợp lệ.`
            );
            return;
        }

        if (typeof command.execute !== "function") {
            console.warn(
                `⚠️ Bỏ qua ${filePath}: thiếu execute().`
            );
            return;
        }

        const name = command.data.name;

        // =========================================
        // TRÁNH TRÙNG COMMAND
        // =========================================

        if (client.commands.has(name)) {
            console.warn(
                `⚠️ Command trùng tên: /${name}`
            );
            console.warn(
                `   File mới: ${filePath}`
            );
            return;
        }

        client.commands.set(
            name,
            command
        );

        commands.push(
            command.data.toJSON()
        );

        console.log(
            `✅ Loaded /${name} ← ${path.relative(ROOT, filePath)}`
        );

    } catch (error) {

        console.error(
            `❌ Không thể load ${filePath}:`
        );

        console.error(
            error.message
        );

    }
}

// ===============================
// LOAD TẤT CẢ COMMAND
// ===============================

const allFiles = getAllJSFiles(ROOT);

console.log(
    `📦 Tìm thấy ${allFiles.length} file JS.`
);

for (const file of allFiles) {
    loadCommand(file);
}

console.log(
    `\n📚 Đã load ${client.commands.size} commands.`
);

console.log(
    `📝 Command Map: ${commands.length} commands`
);

// ===============================
// REGISTER SLASH COMMANDS
// ===============================

async function registerCommands() {

    try {

        const rest = new REST({
            version: "10"
        }).setToken(TOKEN);

        console.log(
            "🔄 Đang đăng ký slash commands..."
        );

        await rest.put(
            Routes.applicationCommands(
                CLIENT_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            `✅ Đã đăng ký ${commands.length} slash commands.`
        );

    } catch (error) {

        console.error(
            "❌ Lỗi đăng ký slash commands:"
        );

        console.error(error);

    }
}

// ===============================
// INTERACTION
// ===============================

client.on(
    "interactionCreate",
    async interaction => {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command =
            client.commands.get(
                interaction.commandName
            );

        if (!command) {

            console.warn(
                `⚠️ Không tìm thấy command /${interaction.commandName}`
            );

            return;
        }

        try {

            await command.execute(
                interaction
            );

        } catch (error) {

            console.error(
                `❌ Lỗi /${interaction.commandName}:`
            );

            console.error(error);

            try {

                if (interaction.replied ||
                    interaction.deferred) {

                    await interaction.followUp({
                        content:
                            "❌ Đã xảy ra lỗi khi thực hiện lệnh.",
                        ephemeral: true
                    });

                } else {

                    await interaction.reply({
                        content:
                            "❌ Đã xảy ra lỗi khi thực hiện lệnh.",
                        ephemeral: true
                    });

                }

            } catch (e) {
                console.error(
                    "Không thể gửi thông báo lỗi:",
                    e.message
                );
            }
        }
    }
);

// ===============================
// READY
// ===============================

client.once(
    "ready",
    async () => {

        console.log("");
        console.log(
            "🟢 =================================="
        );

        console.log(
            `🐢 ${client.user.tag} ONLINE`
        );

        console.log(
            `📚 Commands: ${client.commands.size}`
        );

        console.log(
            `🌐 Servers: ${client.guilds.cache.size}`
        );

        console.log(
            "🟢 =================================="
        );

        // Đăng ký commands sau khi bot login
        await registerCommands();

    }
);

// ===============================
// LOGIN
// ===============================

console.log(
    "🔐 Đang đăng nhập Discord..."
);

client.login(TOKEN).catch(error => {

    console.error(
        "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:"
    );

    console.error(error);

});
