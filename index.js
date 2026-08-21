require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes
} = require("discord.js");

const db = require("./database");

let factions = [];

try {
  factions = require("./factions.json");
} catch (_) {
  console.warn(
    "⚠️ Không có factions.json; button faction sẽ không dùng được."
  );
}

const { buildGroupedCommands } = require("./grouped-commands");

const { commands } = buildGroupedCommands();

const PREFIX = ".";

// =====================================================
// 📜 COMMAND MAP
// =====================================================

const commandMap = new Map();

for (const entry of commands) {
  const command = entry.command;

  const name =
    command?.data?.name;

  if (
    !name ||
    typeof command.execute !== "function"
  ) {
    continue;
  }

  if (commandMap.has(name)) {
    console.warn(
      `⚠️ Trùng lệnh .${name}; giữ lệnh đầu tiên.`
    );

    continue;
  }

  commandMap.set(
    name,
    command
  );
}

console.log(
  `📦 Tổng command gốc: ${commands.length}`
);

console.log(
  `📜 Prefix commands: ${commandMap.size}`
);

// =====================================================
// 🤖 CLIENT
// =====================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =====================================================
// 🗑️ XÓA TOÀN BỘ SLASH COMMAND
// =====================================================

async function deleteAllSlashCommands() {

  try {

    const token =
      process.env.DISCORD_TOKEN;

    if (!token) {

      console.error(
        "❌ Không có DISCORD_TOKEN."
      );

      return;
    }

    const rest =
      new REST({
        version: "10"
      }).setToken(token);

    const applicationId =
      client.user.id;

    console.log(
      "🗑️ Đang xóa toàn bộ Slash Commands..."
    );

    // =================================================
    // XÓA GLOBAL SLASH COMMAND
    // =================================================

    try {

      await rest.put(
        Routes.applicationCommands(
          applicationId
        ),
        {
          body: []
        }
      );

      console.log(
        "✅ Đã xóa toàn bộ Global Slash Commands."
      );

    } catch (error) {

      console.error(
        "❌ Không xóa được Global Slash Commands:"
      );

      console.error(
        error.message
      );
    }

    // =================================================
    // XÓA SLASH COMMAND TRONG TỪNG SERVER
    // =================================================

    const guilds =
      client.guilds.cache;

    for (
      const [guildId, guild]
      of guilds
    ) {

      try {

        await rest.put(
          Routes.applicationGuildCommands(
            applicationId,
            guildId
          ),
          {
            body: []
          }
        );

        console.log(
          `✅ Đã xóa Slash Commands ở: ${guild.name}`
        );

      } catch (error) {

        console.error(
          `❌ Không xóa được Slash Commands ở ${guildId}:`
        );

        console.error(
          error.message
        );
      }
    }

    console.log(
      "🟢 Hoàn tất: BOT CHỈ DÙNG PREFIX ."
    );

  } catch (error) {

    console.error(
      "❌ Lỗi khi xóa Slash Commands:"
    );

    console.error(
      error
    );
  }
}

// =====================================================
// 🔤 TOKENIZE
// =====================================================

function tokenize(text) {

  const out = [];

  const re =
    /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|(\S+)/g;

  let m;

  while (
    (m = re.exec(text)) !== null
  ) {

    out.push(
      m[1] ??
      m[2] ??
      m[3]
    );
  }

  return out;
}

// =====================================================
// 🔄 PREFIX INTERACTION
// =====================================================

function makePrefixInteraction(
  message,
  command,
  args
) {

  let replied = false;

  let deferred = false;

  let lastReply = null;

  const json =
    typeof command.data?.toJSON ===
    "function"
      ? command.data.toJSON()
      : {};

  const options =
    Array.isArray(json.options)
      ? json.options
      : [];

  const values =
    new Map();

  // =================================================
  // MAP ARGUMENTS
  // =================================================

  let positional = [
    ...args
  ];

  for (
    let idx = 0;
    idx < options.length;
    idx++
  ) {

    const opt =
      options[idx];

    if (
      opt.type === 3
    ) {

      values.set(
        opt.name,
        positional.length
          ? positional.shift()
          : null
      );
    }
  }

  // =================================================
  // REPLY
  // =================================================

  const reply =
    async payload => {

      replied = true;

      lastReply =
        await message.reply(
          payload
        );

      return lastReply;
    };

  // =================================================
  // INTERACTION GIẢ
  // =================================================

  const interaction = {

    user:
      message.author,

    member:
      message.member,

    guild:
      message.guild,

    channel:
      message.channel,

    client:
      message.client,

    createdTimestamp:
      message.createdTimestamp,

    commandName:
      command.data.name,

    replied: false,

    deferred: false,

    options: {

      getString(
        name,
        required = false
      ) {

        const value =
          values.get(name) ??
          null;

        if (
          required &&
          value === null
        ) {

          throw new Error(
            `Thiếu tham số: ${name}`
          );
        }

        return value;
      },

      get(
        name
      ) {

        const value =
          values.get(name) ??
          null;

        if (
          value === null
        ) {

          return null;
        }

        return {
          name,
          value,
          type: 3
        };
      }
    },

    isChatInputCommand:
      () => true,

    reply:
      async payload => {

        const result =
          await reply(
            payload
          );

        interaction.replied =
          true;

        return result;
      },

    followUp:
      async payload =>
        message.channel.send(
          payload
        ),

    editReply:
      async payload => {

        if (lastReply) {

          return lastReply.edit(
            payload
          );
        }

        return reply(
          payload
        );
      },

    deferReply:
      async () => {

        deferred = true;

        interaction.deferred =
          true;
      },

    deleteReply:
      async () => {

        if (lastReply) {

          return lastReply
            .delete()
            .catch(
              () => {}
            );
        }
      },

    fetchReply:
      async () =>
        lastReply,

    update:
      async payload => {

        if (lastReply) {

          return lastReply.edit(
            payload
          );
        }

        return reply(
          payload
        );
      },

    showModal:
      async () => {

        throw new Error(
          "Modal không thể mở từ prefix command; hãy dùng button/menu đã tạo bởi bot."
        );
      }
  };

  Object.defineProperty(
    interaction,
    "replied",
    {
      get: () =>
        replied
    }
  );

  Object.defineProperty(
    interaction,
    "deferred",
    {
      get: () =>
        deferred
    }
  );

  return interaction;
}

// =====================================================
// 📜 HELP
// =====================================================

function helpText() {

  const names =
    [
      ...commandMap.keys()
    ].sort();

  const lines = [

    `📜 **HUYỀN VŨ — ${names.length} LỆNH PREFIX**`,

    `Dùng: **.tên_lệnh**`,

    ""
  ];

  for (
    const name
    of names
  ) {

    lines.push(
      `• .${name}`
    );
  }

  return lines.join(
    "\n"
  );
}

// =====================================================
// 🟢 BOT READY
// =====================================================

client.once(
  Events.ClientReady,
  async clientUser => {

    console.log(
      `🐢 ${clientUser.user.tag} ONLINE`
    );

    console.log(
      `🌌 Servers: ${clientUser.guilds.cache.size}`
    );

    console.log(
      `⚔️ Commands: ${commandMap.size}`
    );

    console.log(
      `⌨️ Prefix: ${PREFIX}`
    );

    // =================================================
    // XÓA SLASH COMMAND SAU KHI LOGIN
    // =================================================

    await deleteAllSlashCommands();

    console.log("");
    console.log(
      "=========================================="
    );

    console.log(
      "🟢 HUYỀN VŨ PREFIX BOT"
    );

    console.log(
      "🔰 Chỉ nhận lệnh bắt đầu bằng ."
    );

    console.log(
      "❌ Slash Commands đã bị xóa"
    );

    console.log(
      `📜 Tổng lệnh: ${commandMap.size}`
    );

    console.log(
      "=========================================="
    );

  }
);

// =====================================================
// ⌨️ PREFIX COMMANDS
// =====================================================

client.on(
  Events.MessageCreate,
  async message => {

    // Không xử lý bot
    if (
      message.author.bot
    ) {
      return;
    }

    // Chỉ server
    if (
      !message.guild
    ) {
      return;
    }

    // Chỉ nhận .
    if (
      !message.content.startsWith(
        PREFIX
      )
    ) {

      return;
    }

    const body =
      message.content
        .slice(
          PREFIX.length
        )
        .trim();

    if (!body) {
      return;
    }

    const parts =
      tokenize(
        body
      );

    const name =
      String(
        parts.shift() ||
        ""
      ).toLowerCase();

    if (!name) {
      return;
    }

    // =================================================
    // HELP
    // =================================================

    if (
      name === "help" ||
      name === "lenh"
    ) {

      return message.reply(
        helpText()
      );
    }

    // =================================================
    // TÌM COMMAND
    // =================================================

    const command =
      commandMap.get(
        name
      );

    if (!command) {

      return;
    }

    // =================================================
    // EXECUTE
    // =================================================

    try {

      const interaction =
        makePrefixInteraction(
          message,
          command,
          parts
        );

      await command.execute(
        interaction
      );

    } catch (error) {

      console.error(
        `❌ Lỗi .${name}:`,
        error
      );

      const content =
        `❌ Lỗi khi thực hiện **.${name}**: ${
          error.message ||
          "Không xác định"
        }`;

      try {

        await message.reply(
          content
        );

      } catch (_) {}
    }
  }
);

// =====================================================
// 🔘 BUTTON / SELECT MENU
// =====================================================

client.on(
  Events.InteractionCreate,
  async interaction => {

    try {

      // Chỉ xử lý button/menu
      if (
        !interaction.isButton() &&
        !interaction.isStringSelectMenu() &&
        !interaction.isUserSelectMenu()
      ) {

        return;
      }

      const parts =
        interaction.customId
          .split(":");

      const type =
        parts[0];

      const uid =
        parts[1];

      const id =
        parts[2];

      // =================================================
      // KIỂM TRA USER
      // =================================================

      if (
        uid &&
        uid !== interaction.user.id
      ) {

        return interaction.reply({

          content:
            "❌ Menu này không thuộc về bạn.",

          ephemeral:
            true

        }).catch(
          () => {}
        );
      }

      // =================================================
      // TỨ TƯỢNG
      // =================================================

      if (
        type === "faction" &&
        interaction.isButton()
      ) {

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

            ephemeral:
              true

          });
        }

        const bonuses =
          faction.bonuses ||
          {};

        const attack =
          Number(
            bonuses.attack ||
            0
          );

        const defense =
          Number(
            bonuses.defense ||
            0
          );

        const speed =
          Number(
            bonuses.speed ||
            0
          );

        const maxHp =
          Number(
            bonuses.maxHp ||
            0
          );

        // =================================================
        // DATABASE
        // =================================================

        db.mutate(
          interaction.user.id,
          player => {

            player.attack =
              Number(
                player.attack ||
                0
              );

            player.defense =
              Number(
                player.defense ||
                0
              );

            player.speed =
              Number(
                player.speed ||
                0
              );

            player.maxHp =
              Number(
                player.maxHp ||
                0
              );

            player.hp =
              Number(
                player.hp ||
                0
              );

            player.faction =
              faction.name;

            player.bloodline =
              faction.name;

            player.attack +=
              attack;

            player.defense +=
              defense;

            player.speed +=
              speed;

            player.maxHp +=
              maxHp;

            player.hp =
              player.maxHp;

            return player;
          }
        );

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

    } catch (error) {

      console.error(
        "❌ INTERACTION ERROR:",
        error
      );

      try {

        if (
          interaction.replied ||
          interaction.deferred
        ) {

          await interaction.followUp({

            content:
              `❌ ${
                error.message ||
                "Lỗi hệ thống"
              }`,

            ephemeral:
              true

          });

        } else {

          await interaction.reply({

            content:
              `❌ ${
                error.message ||
                "Lỗi hệ thống"
              }`,

            ephemeral:
              true

          });
        }

      } catch (_) {}
    }
  }
);

// =====================================================
// 🔐 CHECK TOKEN
// =====================================================

if (
  !process.env.DISCORD_TOKEN
) {

  console.error(
    "❌ THIẾU DISCORD_TOKEN!"
  );

  console.error(
    "📌 Railway → Variables → DISCORD_TOKEN"
  );

  process.exit(1);
}

// =====================================================
// 🚀 LOGIN
// =====================================================

client.login(
  process.env.DISCORD_TOKEN
)
.then(() => {

  console.log(
    "🔐 Đang kết nối Discord..."
  );

})
.catch(error => {

  console.error(
    "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:"
  );

  console.error(
    error
  );

});
