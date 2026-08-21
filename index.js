require("dotenv").config();

const { Client, GatewayIntentBits, Events } = require("discord.js");
const db = require("./database");

let factions = [];
try { factions = require("./factions.json"); } catch (_) {
  console.warn("⚠️ Không có factions.json; button faction sẽ không dùng được.");
}

const { buildGroupedCommands } = require("./grouped-commands");
const { commands } = buildGroupedCommands();

const PREFIX = ".";
const commandMap = new Map();
for (const entry of commands) {
  const command = entry.command;
  const name = command?.data?.name;
  if (!name || typeof command.execute !== "function") continue;
  if (commandMap.has(name)) {
    console.warn(`⚠️ Trùng lệnh .${name}; giữ lệnh đầu tiên.`);
    continue;
  }
  commandMap.set(name, command);
}

console.log(`📦 Tổng command gốc: ${commands.length}`);
console.log(`📜 Prefix commands: ${commandMap.size}`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

function tokenize(text) {
  const out = [];
  const re = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|(\S+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push(m[1] ?? m[2] ?? m[3]);
  }
  return out;
}

function makePrefixInteraction(message, command, args) {
  let replied = false;
  let deferred = false;
  let lastReply = null;
  const json = typeof command.data?.toJSON === "function" ? command.data.toJSON() : {};
  const options = Array.isArray(json.options) ? json.options : [];
  const values = new Map();

  // Prefix arguments are mapped to the command's existing Slash string options
  // in the same order. This preserves command logic without rewriting 276 execute() functions.
  let positional = [...args];
  for (let idx = 0; idx < options.length; idx++) {
    const opt = options[idx];
    if (opt.type === 3) {
      values.set(opt.name, positional.length ? positional.shift() : null);
    }
  }

  const reply = async payload => {
    replied = true;
    lastReply = await message.reply(payload);
    return lastReply;
  };

  const interaction = {
    user: message.author,
    member: message.member,
    guild: message.guild,
    channel: message.channel,
    client: message.client,
    createdTimestamp: message.createdTimestamp,
    commandName: command.data.name,
    replied: false,
    deferred: false,
    options: {
      getString(name, required = false) {
        const value = values.get(name) ?? null;
        if (required && value === null) throw new Error(`Thiếu tham số: ${name}`);
        return value;
      },
      get(name) {
        const value = values.get(name) ?? null;
        return value === null ? null : { name, value, type: 3 };
      }
    },
    isChatInputCommand: () => true,
    reply: async payload => {
      const result = await reply(payload);
      interaction.replied = true;
      return result;
    },
    followUp: async payload => message.channel.send(payload),
    editReply: async payload => {
      if (lastReply) return lastReply.edit(payload);
      return reply(payload);
    },
    deferReply: async () => {
      deferred = true;
      interaction.deferred = true;
    },
    deleteReply: async () => {
      if (lastReply) return lastReply.delete().catch(() => {});
    },
    fetchReply: async () => lastReply,
    update: async payload => {
      if (lastReply) return lastReply.edit(payload);
      return reply(payload);
    },
    showModal: async () => {
      throw new Error("Modal không thể mở từ prefix command; hãy dùng button/menu đã tạo bởi bot.");
    }
  };

  Object.defineProperty(interaction, "replied", { get: () => replied });
  Object.defineProperty(interaction, "deferred", { get: () => deferred });
  return interaction;
}

function helpText() {
  const names = [...commandMap.keys()].sort();
  const lines = [`📜 **HUYỀN VŨ — ${names.length} LỆNH PREFIX**`, `Dùng: **.tên_lệnh**`, ""];
  for (const name of names) lines.push(`• .${name}`);
  return lines.join("\n");
}

client.once(Events.ClientReady, clientUser => {
  console.log(`🐢 ${clientUser.user.tag} ONLINE`);
  console.log(`🌌 Servers: ${clientUser.guilds.cache.size}`);
  console.log(`⚔️ Commands: ${commandMap.size}`);
  console.log(`⌨️ Prefix: ${PREFIX}`);
});

// =====================================================
// ⌨️ PREFIX COMMANDS — .command [tham số]
// =====================================================
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const body = message.content.slice(PREFIX.length).trim();
  if (!body) return;

  const parts = tokenize(body);
  const name = String(parts.shift() || "").toLowerCase();
  if (!name) return;

  if (name === "help" || name === "lenh") {
    return message.reply(helpText());
  }

  const command = commandMap.get(name);
  if (!command) return;

  try {
    const interaction = makePrefixInteraction(message, command, parts);
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Lỗi .${name}:`, error);
    const content = `❌ Lỗi khi thực hiện **.${name}**: ${error.message || "Không xác định"}`;
    try { await message.reply(content); } catch (_) {}
  }
});

// =====================================================
// 🔘 BUTTON / SELECT MENU
// =====================================================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isUserSelectMenu()) return;

    const parts = interaction.customId.split(":");
    const type = parts[0];
    const uid = parts[1];
    const id = parts[2];

    if (uid && uid !== interaction.user.id) {
      return interaction.reply({ content: "❌ Menu này không thuộc về bạn.", ephemeral: true }).catch(() => {});
    }

    if (type === "faction" && interaction.isButton()) {
      const faction = factions.find(x => String(x.id) === String(id));
      if (!faction) return interaction.reply({ content: "❌ Không tìm thấy Tứ Tượng.", ephemeral: true });
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

      const skills = Array.isArray(faction.skills) ? faction.skills.join(" • ") : "Chưa có";
      return interaction.update({
        content: `🌟 **THỨC TỈNH THÀNH CÔNG**\n\n🐾 Tứ Tượng: **${faction.name}**\n🩸 Huyết mạch: **${faction.name}**\n\n⚔️ Công kích: +${attack}\n🛡️ Phòng thủ: +${defense}\n💨 Tốc độ: +${speed}\n❤️ HP tối đa: +${maxHp}\n\n✨ **Kỹ năng:** ${skills}`,
        embeds: [],
        components: []
      });
    }

    // Các button/select khác do command tự xử lý trong interactionCreate cũ
    // cần giữ nguyên tại đây nếu bundle có handler riêng.
  } catch (error) {
    console.error("❌ INTERACTION ERROR:", error);
    try {
      if (interaction.replied || interaction.deferred) await interaction.followUp({ content: `❌ ${error.message || "Lỗi hệ thống"}`, ephemeral: true });
      else await interaction.reply({ content: `❌ ${error.message || "Lỗi hệ thống"}`, ephemeral: true });
    } catch (_) {}
  }
});

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
