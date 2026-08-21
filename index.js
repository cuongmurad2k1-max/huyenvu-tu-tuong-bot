require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events
} = require("discord.js");

const db = require("./database");
let factions = [];
try {
  factions = require("./factions.json");
} catch (_) {
  console.warn("⚠️ Không có factions.json; button faction sẽ không dùng được.");
}
const {
  buildGroupedCommands,
  getCommandForInteraction
} = require("./grouped-commands");

// =====================================================
// 📦 LOAD 276 COMMANDS
// =====================================================

const {
  commands,
  dispatch
} = buildGroupedCommands();

console.log(`📦 Tổng command gốc: ${commands.length}`);
console.log(`📜 Command Map grouped: ${dispatch.size}`);

// =====================================================
// 🤖 CLIENT
// =====================================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// =====================================================
// 🟢 READY
// =====================================================

client.once(Events.ClientReady, clientUser => {
  console.log(`🐢 ${clientUser.user.tag} ONLINE`);
  console.log(`🌌 Servers: ${clientUser.guilds.cache.size}`);
  console.log(`⚔️ Commands: ${commands.length}`);
  console.log(`📜 Grouped routes: ${dispatch.size}`);
});

// =====================================================
// 🎮 INTERACTION
// =====================================================

client.on(Events.InteractionCreate, async interaction => {
  try {
    // ===================================================
    // ⚔️ GROUPED SLASH COMMAND
    // ===================================================

    if (interaction.isChatInputCommand()) {
      const command =
        getCommandForInteraction(interaction, dispatch);

      if (!command) {
        return interaction.reply({
          content: "❌ Không tìm thấy lệnh con này.",
          ephemeral: true
        }).catch(() => {});
      }

      return await command.execute(interaction);
    }

    // ===================================================
    // 🔘 BUTTON TỨ TƯỢNG
    // ===================================================

    if (interaction.isButton()) {
      const parts = interaction.customId.split(":");
      const type = parts[0];
      const uid = parts[1];
      const id = parts[2];

      if (uid && uid !== interaction.user.id) {
        return interaction.reply({
          content: "❌ Menu này không thuộc về bạn.",
          ephemeral: true
        }).catch(() => {});
      }

      if (type === "faction") {
        const faction = factions.find(
          x => String(x.id) === String(id)
        );

        if (!faction) {
          return interaction.reply({
            content: "❌ Không tìm thấy Tứ Tượng.",
            ephemeral: true
          });
        }

        const bonuses = faction.bonuses || {};

        const attack = Number(bonuses.attack || 0);
        const defense = Number(bonuses.defense || 0);
        const speed = Number(bonuses.speed || 0);
        const maxHp = Number(bonuses.maxHp || 0);

        db.mutate(interaction.user.id, player => {
          player.attack = Number(player.attack || 0);
          player.defense = Number(player.defense || 0);
          player.speed = Number(player.speed || 0);
          player.maxHp = Number(player.maxHp || 0);
          player.hp = Number(player.hp || 0);

          player.faction = faction.name;
          player.bloodline = faction.name;

          player.attack += attack;
          player.defense += defense;
          player.speed += speed;
          player.maxHp += maxHp;
          player.hp = player.maxHp;

          return player;
        });

        const skills = Array.isArray(faction.skills)
          ? faction.skills.join(" • ")
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
    }
  } catch (error) {
    console.error("❌ INTERACTION ERROR:", error);

    const message =
      `❌ Lỗi hệ thống: ${error.message || "Không xác định"}`;

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: message,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: message,
          ephemeral: true
        });
      }
    } catch (_) {}
  }
});

// =====================================================
// 🔐 LOGIN
// =====================================================

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ THIẾU DISCORD_TOKEN!");
  console.error("📌 Railway → Variables → DISCORD_TOKEN");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("🔐 Đang kết nối Discord..."))
  .catch(error => {
    console.error("❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:");
    console.error(error);
  });
