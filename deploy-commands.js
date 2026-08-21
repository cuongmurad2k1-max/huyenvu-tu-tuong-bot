require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const {
    loadCommands
} = require("./command-loader");

// =====================================================
// ⚔️ LOAD TOÀN BỘ COMMAND
// =====================================================

let commands = [];

try {

    commands = loadCommands();

    if (!Array.isArray(commands)) {
        throw new Error(
            "command-loader không trả về Array."
        );
    }

} catch (error) {

    console.error(
        "❌ LỖI LOAD COMMANDS:"
    );

    console.error(error);

    process.exit(1);
}

// =====================================================
// 🔎 KIỂM TRA COMMAND
// =====================================================

const validCommands = [];
const commandNames = new Set();

for (const command of commands) {

    if (
        !command ||
        !command.data ||
        typeof command.data.toJSON !== "function" ||
        typeof command.execute !== "function"
    ) {

        console.warn(
            "⚠️ Bỏ qua command không hợp lệ."
        );

        continue;
    }

    const name =
        command.data.name;

    if (!name) {

        console.warn(
            "⚠️ Command không có tên."
        );

        continue;
    }

    // =================================================
    // 🔁 CHỐNG TRÙNG TÊN
    // =================================================

    if (commandNames.has(name)) {

        console.warn(
            `⚠️ Bỏ qua command trùng tên: /${name}`
        );

        continue;
    }

    commandNames.add(name);

    validCommands.push(command);
}

commands = validCommands;

// =====================================================
// 📊 THỐNG KÊ
// =====================================================

console.log("");
console.log("======================================");
console.log("📜 DEPLOY COMMANDS");
console.log("======================================");

console.log(
    `📦 Tổng command load được: ${commands.length}`
);

console.log(
    `📊 Command tên duy nhất: ${commandNames.size}`
);

// =====================================================
// 🔐 KIỂM TRA ENV
// =====================================================

const token =
    process.env.DISCORD_TOKEN;

const clientId =
    process.env.CLIENT_ID;

const guildId =
    process.env.GUILD_ID;

// =====================================================
// ❌ THIẾU TOKEN
// =====================================================

if (!token) {

    console.error(
        "❌ Thiếu DISCORD_TOKEN."
    );

    console.error(
        "📌 Railway → Variables → DISCORD_TOKEN"
    );

    process.exit(1);
}

// =====================================================
// ❌ THIẾU CLIENT ID
// =====================================================

if (!clientId) {

    console.error(
        "❌ Thiếu CLIENT_ID."
    );

    console.error(
        "📌 Railway → Variables → CLIENT_ID"
    );

    process.exit(1);
}

// =====================================================
// 📝 CHUYỂN COMMAND → JSON
// =====================================================

let commandData = [];

try {

    commandData =
        commands.map(
            command =>
                command.data.toJSON()
        );

} catch (error) {

    console.error(
        "❌ Không thể chuyển command sang JSON:"
    );

    console.error(error);

    process.exit(1);
}

// =====================================================
// 📊 HIỂN THỊ SỐ LƯỢNG
// =====================================================

console.log(
    `📝 Command JSON: ${commandData.length}`
);

// =====================================================
// ⚠️ GIỚI HẠN DISCORD
// =====================================================

const MAX_COMMANDS = 100;

if (
    commandData.length >
    MAX_COMMANDS
) {

    console.warn("");
    console.warn(
        "⚠️ CẢNH BÁO DISCORD COMMAND LIMIT"
    );

    console.warn(
        `⚠️ Bot đang có ${commandData.length} commands.`
    );

    console.warn(
        `⚠️ Discord chỉ cho tối đa ${MAX_COMMANDS} slash commands trong một scope.`
    );

    console.warn(
        `⚠️ ${commandData.length - MAX_COMMANDS} commands không thể đăng ký dạng top-level / cùng lúc.`
    );

    console.warn("");

    console.warn(
        "👉 Bot vẫn LOAD ĐỦ COMMAND trong commandMap."
    );

    console.warn(
        "👉 Muốn dùng đủ 276 lệnh trên Discord cần chuyển chúng sang hệ thống command group/subcommand."
    );

    process.exit(1);
}

// =====================================================
// 🌐 REST
// =====================================================

const rest =
    new REST({
        version: "10"
    }).setToken(token);

// =====================================================
// 🚀 DEPLOY
// =====================================================

(async () => {

    try {

        console.log("");
        console.log(
            "🔄 Đang đăng ký slash commands..."
        );

        // =================================================
        // 🏠 GUILD DEPLOY
        // =================================================

        if (guildId) {

            console.log(
                `🏠 Guild ID: ${guildId}`
            );

            await rest.put(

                Routes.applicationGuildCommands(
                    clientId,
                    guildId
                ),

                {
                    body: commandData
                }
            );

            console.log("");
            console.log(
                `✅ Đăng ký thành công ${commandData.length} commands vào SERVER.`
            );

            console.log(
                "⚡ Guild commands thường cập nhật nhanh hơn global commands."
            );

        }

        // =================================================
        // 🌍 GLOBAL DEPLOY
        // =================================================

        else {

            console.log(
                "🌍 Không có GUILD_ID → deploy GLOBAL."
            );

            await rest.put(

                Routes.applicationCommands(
                    clientId
                ),

                {
                    body: commandData
                }
            );

            console.log("");
            console.log(
                `✅ Đăng ký thành công ${commandData.length} GLOBAL commands.`
            );
        }

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "🎉 DEPLOY HOÀN TẤT"
        );

        console.log(
            "======================================"
        );

    } catch (error) {

        console.error("");
        console.error(
            "❌ DEPLOY COMMANDS THẤT BẠI"
        );

        console.error("");

        console.error(error);

        process.exit(1);
    }

})();
