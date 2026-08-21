require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Events
} = require("discord.js");

const db = require("./database");

// =====================================================
// 🐢 HUYỀN VŨ – TỨ TƯỢNG ULTRA
// =====================================================

// factions.json nằm cùng thư mục với index.js
const factions = require("./factions.json");

// =====================================================
// 📦 LOAD COMMANDS AN TOÀN
// =====================================================

let commands = [];

try {
    commands = require("./commands");

    if (!Array.isArray(commands)) {
        console.warn("⚠️ ./commands không trả về Array.");
        commands = [];
    }

    console.log(`✅ Đã load ${commands.length} commands.`);
} catch (error) {
    console.warn("⚠️ Không tìm thấy ./commands.");
    console.warn("⚠️ Bot vẫn khởi động nhưng Slash Commands chưa được load.");
    console.warn("📌 Chi tiết:", error.message);

    commands = [];
}

// =====================================================
// 🤖 CLIENT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// =====================================================
// 🗺️ COMMAND MAP
// =====================================================

const commandMap = new Map();

for (const command of commands) {
    try {
        if (
            command &&
            command.data &&
            typeof command.data.name === "string"
        ) {
            commandMap.set(
                command.data.name,
                command
            );
        }
    } catch (error) {
        console.error(
            "❌ Không thể load command:",
            error
        );
    }
}

console.log(
    `📜 Command Map: ${commandMap.size} commands`
);

// =====================================================
// 🟢 READY
// =====================================================

client.once(
    Events.ClientReady,
    (clientUser) => {

        console.log(
            `🐢 ${clientUser.user.tag} ONLINE — HUYỀN VŨ MEGA`
        );

        console.log(
            `🌌 Servers: ${clientUser.guilds.cache.size}`
        );

        console.log(
            `⚔️ Commands: ${commandMap.size}`
        );
    }
);

// =====================================================
// 🎮 INTERACTION CREATE
// =====================================================

client.on(
    Events.InteractionCreate,
    async (interaction) => {

        try {

            // =================================================
            // ⚔️ SLASH COMMAND
            // =================================================

            if (interaction.isChatInputCommand()) {

                const command =
                    commandMap.get(
                        interaction.commandName
                    );

                if (!command) {

                    return interaction.reply({
                        content:
                            "❌ Lệnh này chưa được tải vào bot.",
                        ephemeral: true
                    }).catch(() => {});
                }

                if (
                    typeof command.execute !==
                    "function"
                ) {

                    console.error(
                        `❌ Command ${interaction.commandName} thiếu execute().`
                    );

                    return interaction.reply({
                        content:
                            "❌ Command này đang bị lỗi cấu hình.",
                        ephemeral: true
                    }).catch(() => {});
                }

                return await command.execute(
                    interaction
                );
            }

            // =================================================
            // 🔘 BUTTON
            // =================================================

            if (interaction.isButton()) {

                const parts =
                    interaction.customId.split(":");

                const type = parts[0];
                const uid = parts[1];
                const id = parts[2];

                // ---------------------------------------------
                // 🔒 KIỂM TRA USER
                // ---------------------------------------------

                if (
                    uid &&
                    uid !== interaction.user.id
                ) {

                    return interaction.reply({
                        content:
                            "❌ Menu này không thuộc về bạn.",
                        ephemeral: true
                    });
                }

                // =================================================
                // 🐾 THỨC TỈNH TỨ TƯỢNG
                // =================================================

                if (type === "faction") {

                    const faction =
                        factions.find(
                            x =>
                                String(x.id) ===
                                String(id)
                        );

                    if (!faction) {

                        return interaction.reply({
                            content:
                                "❌ Không tìm thấy Tứ Tượng.",
                            ephemeral: true
                        });
                    }

                    // ---------------------------------------------
                    // 🛡️ BONUS
                    // ---------------------------------------------

                    const bonuses =
                        faction.bonuses || {};

                    const attack =
                        Number(
                            bonuses.attack || 0
                        );

                    const defense =
                        Number(
                            bonuses.defense || 0
                        );

                    const speed =
                        Number(
                            bonuses.speed || 0
                        );

                    const maxHp =
                        Number(
                            bonuses.maxHp || 0
                        );

                    // ---------------------------------------------
                    // 💾 DATABASE
                    // ---------------------------------------------

                    db.mutate(
                        interaction.user.id,
                        player => {

                            player.attack =
                                Number(
                                    player.attack || 0
                                );

                            player.defense =
                                Number(
                                    player.defense || 0
                                );

                            player.speed =
                                Number(
                                    player.speed || 0
                                );

                            player.maxHp =
                                Number(
                                    player.maxHp || 0
                                );

                            player.hp =
                                Number(
                                    player.hp || 0
                                );

                            // -------------------------------------
                            // 🐢 FACTION
                            // -------------------------------------

                            player.faction =
                                faction.name;

                            player.bloodline =
                                faction.name;

                            // -------------------------------------
                            // ⚔️ BONUS
                            // -------------------------------------

                            player.attack +=
                                attack;

                            player.defense +=
                                defense;

                            player.speed +=
                                speed;

                            player.maxHp +=
                                maxHp;

                            // -------------------------------------
                            // ❤️ HP
                            // -------------------------------------

                            player.hp =
                                player.maxHp;

                            return player;
                        }
                    );

                    // ---------------------------------------------
                    // ✨ SKILLS
                    // ---------------------------------------------

                    const skills =
                        Array.isArray(
                            faction.skills
                        )
                            ? faction.skills.join(
                                " • "
                            )
                            : "Chưa có";

                    return interaction.update({

                        content:
                            `🌟 **THỨC TỈNH THÀNH CÔNG**\n\n` +
                            `🐾 Tứ Tượng: **${faction.name}**\n` +
                            `🩸 Huyết mạch: **${faction.name}**\n\n` +
                            `⚔️ Công kích: +${attack}\n` +
                            `🛡️ Phòng thủ: +${defense}\n` +
                            `💨 Tốc độ: +${speed}\n` +
                            `❤️ HP tối đa: +${maxHp}\n\n` +
                            `✨ **Kỹ năng:** ${skills}`,

                        embeds: [],

                        components: []
                    });
                }

                // =================================================
                // ❓ BUTTON KHÔNG XÁC ĐỊNH
                // =================================================

                return interaction.reply({
                    content:
                        "❌ Nút này chưa được hệ thống hỗ trợ.",
                    ephemeral: true
                }).catch(() => {});
            }

        } catch (error) {

            console.error(
                "❌ INTERACTION ERROR:",
                error
            );

            const message =
                "❌ Lỗi hệ thống: " +
                (
                    error.message ||
                    "Không xác định"
                );

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({
                        content: message,
                        ephemeral: true
                    }).catch(() => {});

                } else {

                    await interaction.reply({
                        content: message,
                        ephemeral: true
                    }).catch(() => {});
                }

            } catch (_) {}
        }
    }
);

// =====================================================
// 🔐 DISCORD TOKEN
// =====================================================

if (!process.env.DISCORD_TOKEN) {

    console.error(
        "❌ THIẾU DISCORD_TOKEN!"
    );

    console.error(
        "📌 Railway → Variables → DISCORD_TOKEN"
    );

} else {

    client.login(
        process.env.DISCORD_TOKEN
    ).then(() => {

        console.log(
            "🔐 Đang kết nối Discord..."
        );

    }).catch(error => {

        console.error(
            "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:"
        );

        console.error(error);
    });
}
