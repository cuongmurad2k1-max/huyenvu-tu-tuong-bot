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
  console.warn("⚠️ Không tìm thấy factions.json.");
}

const {
  GROUPS,
  DESCRIPTIONS,
  buildGroupedCommands
} = require("./grouped-commands");

const PREFIX = ".";
const TOKEN = process.env.DISCORD_TOKEN;

// =====================================================
// KIỂM TRA TOKEN
// =====================================================

if (!TOKEN) {
  console.error("❌ THIẾU DISCORD_TOKEN!");
  console.error(
    "👉 Railway → Variables → DISCORD_TOKEN"
  );
  process.exit(1);
}

// =====================================================
// LOAD 276 LỆNH GỘP
// =====================================================

let grouped;

try {
  grouped = buildGroupedCommands();
} catch (error) {
  console.error(
    "❌ KHÔNG THỂ LOAD 276 LỆNH!"
  );

  console.error(error);

  process.exit(1);
}

const commandMap = new Map();

const groupMap =
  grouped.byGroup || new Map();

// =====================================================
// ĐƯA TỪNG LỆNH VÀO COMMAND MAP
// =====================================================

for (
  const entry of grouped.commands || []
) {
  const command =
    entry.command;

  const name =
    command?.data?.name;

  if (
    !name ||
    typeof command.execute !==
      "function"
  ) {
    continue;
  }

  if (
    commandMap.has(name)
  ) {
    console.warn(
      `⚠️ Trùng lệnh .${name}, giữ lệnh đầu tiên.`
    );

    continue;
  }

  commandMap.set(
    name,
    command
  );
}

// =====================================================
// LOG LOAD COMMAND
// =====================================================

console.log(
  "========================================"
);

console.log(
  "📚 HUYỀN VŨ TỨ TƯỢNG"
);

console.log(
  "========================================"
);

console.log(
  `📦 Tổng lệnh gốc: ${grouped.commands.length}`
);

console.log(
  `✅ Lệnh PREFIX: ${commandMap.size}`
);

console.log(
  "🔑 Tiền tố: ."
);

console.log(
  "========================================"
);

for (
  const [group, list]
  of groupMap
) {
  console.log(
    `📁 ${group}: ${list.length} lệnh`
  );
}

console.log(
  "========================================"
);

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
// TÁCH THAM SỐ
// =====================================================

function tokenize(text) {

  const result = [];

  const regex =
    /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|(\\S+)/g;

  let match;

  while (
    (match = regex.exec(text)) !==
    null
  ) {

    result.push(

      match[1] !== undefined

        ? match[1]

        : match[2] !== undefined

          ? match[2]

          : match[3]

    );

  }

  return result;
}

// =====================================================
// OPTIONS CHO LỆNH CŨ
// =====================================================

function makeOptions(
  command,
  args
) {

  const json =
    typeof command.data?.toJSON ===
      "function"

      ? command.data.toJSON()

      : {};

  const definitions =
    Array.isArray(
      json.options
    )

      ? json.options

      : [];

  const values =
    new Map();

  let position = 0;

  for (
    const option
    of definitions
  ) {

    /*
     * Toàn bộ 276 lệnh hiện tại
     * chủ yếu dùng getString().
     */

    if (
      option.type === 3
    ) {

      values.set(

        option.name,

        args[position++] ??
          null

      );

    }

  }

  return {

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

    get(name) {

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

    },

    getInteger() {
      return null;
    },

    getNumber() {
      return null;
    },

    getBoolean() {
      return null;
    },

    getUser() {
      return null;
    },

    getMember() {
      return null;
    },

    getChannel() {
      return null;
    },

    getRole() {
      return null;
    },

    getMentionable() {
      return null;
    },

    getAttachment() {
      return null;
    },

    getSubcommand() {
      return null;
    },

    getSubcommandGroup() {
      return null;
    }

  };

}

// =====================================================
// CHUYỂN MESSAGE PREFIX
// THÀNH INTERACTION GIẢ
// =====================================================

function makePrefixInteraction(
  message,
  command,
  args
) {

  let replied = false;

  let deferred = false;

  let lastReply = null;

  const interaction = {

    user:
      message.author,

    member:
      message.member,

    guild:
      message.guild,

    guildId:
      message.guildId,

    channel:
      message.channel,

    channelId:
      message.channelId,

    client:
      message.client,

    message,

    createdTimestamp:
      message.createdTimestamp,

    commandName:
      command.data.name,

    options:
      makeOptions(
        command,
        args
      ),

    isChatInputCommand:
      () => true,

    isCommand:
      () => true,

    get replied() {
      return replied;
    },

    get deferred() {
      return deferred;
    },

    async reply(
      payload
    ) {

      replied = true;

      lastReply =
        await message.reply(
          payload
        );

      return lastReply;

    },

    async followUp(
      payload
    ) {

      return message.channel.send(

        cleanPayload(
          payload
        )

      );

    },

    async editReply(
      payload
    ) {

      const data =
        cleanPayload(
          payload
        );

      if (
        lastReply
      ) {

        return lastReply.edit(
          data
        );

      }

      lastReply =
        await message.reply(
          data
        );

      return lastReply;

    },

    async deferReply() {

      deferred = true;

      await message.channel.sendTyping();

    },

    async deleteReply() {

      if (
        lastReply
      ) {

        await lastReply
          .delete()
          .catch(
            () => {}
          );

      }

    },

    async fetchReply() {

      return lastReply;

    },

    async update(
      payload
    ) {

      const data =
        cleanPayload(
          payload
        );

      if (
        lastReply
      ) {

        return lastReply.edit(
          data
        );

      }

      lastReply =
        await message.reply(
          data
        );

      return lastReply;

    },

    async showModal() {

      throw new Error(
        "Lệnh này yêu cầu Modal Discord và không thể mở bằng prefix."
      );

    }

  };

  return interaction;

}

// =====================================================
// LÀM SẠCH NỘI DUNG REPLY
// =====================================================

function cleanPayload(
  payload
) {

  if (
    typeof payload ===
    "string"
  ) {

    return {

      content:
        payload

    };

  }

  if (
    !payload
  ) {

    return {

      content:
        "✅"

    };

  }

  const result =
    {
      ...payload
    };

  /*
   * ephemeral và flags là
   * thuộc tính dành cho Interaction.
   */

  delete result.ephemeral;

  delete result.flags;

  return result;

}

// =====================================================
// TÊN NHÓM HELP
// =====================================================

const GROUP_NAMES = {

  combat:
    "⚔️ CHIẾN ĐẤU",

  tutuong:
    "🐉 TỨ TƯỢNG",

  thanthu:
    "🐾 THẦN THÚ",

  nhanvat:
    "👤 NHÂN VẬT",

  bossraid:
    "👹 BOSS / RAID",

  pvp:
    "🏆 PVP",

  guild:
    "🏰 BANG HỘI",

  quest:
    "📜 NHIỆM VỤ / CỐT TRUYỆN",

  world:
    "🌎 THẾ GIỚI",

  item:
    "🎒 VẬT PHẨM / CHẾ TẠO",

  economy:
    "💰 KINH TẾ",

  social:
    "👥 XÃ HỘI",

  progress:
    "📈 TIẾN TRÌNH",

  misc:
    "🧩 KHÁC"

};

// =====================================================
// .HELP TẤT CẢ NHÓM
// =====================================================

function helpAll() {

  const lines = [

    `📚 **HUYỀN VŨ TỨ TƯỢNG — ${commandMap.size} LỆNH**`,

    "",

    "🔑 Tất cả lệnh đều dùng dấu **.**",

    "👉 Dùng **.help <nhóm>** để xem chi tiết.",

    ""

  ];

  for (
    const [
      group,
      name
    ]
    of Object.entries(
      GROUP_NAMES
    )
  ) {

    const list =
      groupMap.get(
        group
      ) || [];

    lines.push(

      `${name} — **${list.length} lệnh**`

    );

    lines.push(

      `• Dùng: **.help ${group}**`

    );

    lines.push("");

  }

  return lines.join(
    "\n"
  );

}

// =====================================================
// .HELP THEO NHÓM
// =====================================================

function helpGroup(
  groupName
) {

  const group =
    String(
      groupName || ""
    ).toLowerCase();

  const list =
    groupMap.get(
      group
    );

  if (
    !list
  ) {

    return (

      `❌ Không tìm thấy nhóm **${groupName}**.\n` +

      "👉 Dùng **.help** để xem danh sách nhóm."

    );

  }

  const lines = [

    GROUP_NAMES[group] ||
      `📁 ${group}`,

    `📦 **${list.length} lệnh**`,

    ""

  ];

  for (
    const entry
    of list
  ) {

    const command =
      entry.command;

    const data =
      command.data.toJSON();

    lines.push(

      `• **.${data.name}** — ${data.description || "Không có mô tả"}`

    );

  }

  return lines.join(
    "\n"
  );

}

// =====================================================
// XÓA TOÀN BỘ SLASH COMMAND
// =====================================================

async function deleteAllSlashCommands() {

  try {

    const applicationId =

      client.application?.id ||

      process.env.CLIENT_ID ||

      process.env.DISCORD_CLIENT_ID;

    if (
      !applicationId
    ) {

      console.warn(

        "⚠️ Không tìm thấy CLIENT_ID, không thể xóa Slash Command."

      );

      return;

    }

    const rest =
      new REST({

        version:
          "10"

      }).setToken(
        TOKEN
      );

    console.log(
      "🗑️ Đang xóa toàn bộ Slash Command..."
    );

    // =============================================
    // XÓA SLASH TOÀN CỤC
    // =============================================

    await rest.put(

      Routes.applicationCommands(
        applicationId
      ),

      {
        body: []
      }

    );

    console.log(
      "✅ Đã xóa Slash Command toàn cục."
    );

    // =============================================
    // XÓA SLASH TRONG TỪNG SERVER
    // =============================================

    for (
      const guild
      of client.guilds.cache.values()
    ) {

      try {

        await rest.put(

          Routes.applicationGuildCommands(

            applicationId,

            guild.id

          ),

          {
            body: []
          }

        );

        console.log(

          `✅ Đã xóa Slash tại: ${guild.name}`

        );

      } catch (
        error
      ) {

        console.warn(

          `⚠️ Không xóa được Slash tại ${guild.name}: ${error.message}`

        );

      }

    }

  } catch (
    error
  ) {

    console.error(

      "❌ Lỗi khi xóa Slash Command:",

      error

    );

  }

}

// =====================================================
// BOT READY
// =====================================================

client.once(

  Events.ClientReady,

  async clientUser => {

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "🟢 BOT ĐÃ ONLINE"
    );

    console.log(
      "========================================"
    );

    console.log(

      `👤 Bot: ${clientUser.user.tag}`

    );

    console.log(

      `🌐 Server: ${clientUser.guilds.cache.size}`

    );

    console.log(

      `📦 Lệnh: ${commandMap.size}`

    );

    console.log(
      "🔑 Prefix: ."
    );

    console.log(
      "========================================"
    );

    /*
     * Xóa toàn bộ Slash cũ.
     */

    await deleteAllSlashCommands();

    clientUser.user.setPresence({

      activities: [

        {

          name:
            ".help | Huyền Vũ Tứ Tượng",

          type:
            0

        }

      ],

      status:
        "online"

    });

  }

);

// =====================================================
// PREFIX COMMAND
// =====================================================

client.on(

  Events.MessageCreate,

  async message => {

    try {

      // Không xử lý bot.

      if (
        message.author.bot
      ) {

        return;

      }

      // Chỉ dùng trong server.

      if (
        !message.guild
      ) {

        return;

      }

      // Không có dấu .

      if (

        !message.content.startsWith(
          PREFIX
        )

      ) {

        return;

      }

      // Cắt dấu .

      const body =

        message.content
          .slice(
            PREFIX.length
          )
          .trim();

      if (
        !body
      ) {

        return;

      }

      // Tách lệnh + tham số.

      const parts =
        tokenize(
          body
        );

      const name =

        String(
          parts.shift() || ""
        ).toLowerCase();

      if (
        !name
      ) {

        return;

      }

      // =================================================
      // .HELP
      // =================================================

      if (

        name === "help" ||

        name === "lenh"

      ) {

        if (
          parts[0]
        ) {

          return message.reply(

            helpGroup(
              parts[0]
            )

          );

        }

        return message.reply(
          helpAll()
        );

      }

      // =================================================
      // TÌM LỆNH
      // =================================================

      const command =
        commandMap.get(
          name
        );

      if (
        !command
      ) {

        return;

      }

      console.log(

        `📥 ${message.author.tag}: .${name}`

      );

      // =================================================
      // TẠO INTERACTION GIẢ
      // =================================================

      const interaction =

        makePrefixInteraction(

          message,

          command,

          parts

        );

      // =================================================
      // CHẠY LỆNH
      // =================================================

      await command.execute(

        interaction

      );

    } catch (
      error
    ) {

      console.error(

        "❌ LỖI PREFIX COMMAND:",

        error

      );

      try {

        await message.reply(

          `❌ Có lỗi khi thực hiện lệnh.\n${error.message || "Lỗi không xác định."}`

        );

      } catch (_) {}

    }

  }

);

// =====================================================
// BUTTON / SELECT MENU
// =====================================================

client.on(

  Events.InteractionCreate,

  async interaction => {

    try {

      /*
       * Không xử lý Slash Command.
       *
       * Chỉ xử lý:
       * - Button
       * - Select Menu
       */

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
      // KIỂM TRA NGƯỜI DÙNG
      // =================================================

      if (

        uid &&

        uid !==
          interaction.user.id

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

        if (
          !faction
        ) {

          return interaction.reply({

            content:
              "❌ Không tìm thấy Tứ Tượng.",

            ephemeral:
              true

          });

        }

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

        // =================================================
        // CẬP NHẬT DATA
        // =================================================

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

        // =================================================
        // THÔNG BÁO THỨC TỈNH
        // =================================================

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

    } catch (
      error
    ) {

      console.error(

        "❌ LỖI TƯƠNG TÁC:",

        error

      );

      try {

        if (

          interaction.replied ||

          interaction.deferred

        ) {

          await interaction.followUp({

            content:

              `❌ ${error.message || "Lỗi hệ thống"}`,

            ephemeral:
              true

          });

        } else {

          await interaction.reply({

            content:

              `❌ ${error.message || "Lỗi hệ thống"}`,

            ephemeral:
              true

          });

        }

      } catch (_) {}

    }

  }

);

// =====================================================
// XỬ LÝ LỖI DISCORD
// =====================================================

client.on(

  Events.Error,

  error => {

    console.error(

      "❌ Discord Client Error:",

      error

    );

  }

);

// =====================================================
// UNHANDLED REJECTION
// =====================================================

process.on(

  "unhandledRejection",

  error => {

    console.error(

      "❌ Unhandled Rejection:",

      error

    );

  }

);

// =====================================================
// UNCAUGHT EXCEPTION
// =====================================================

process.on(

  "uncaughtException",

  error => {

    console.error(

      "❌ Uncaught Exception:",

      error

    );

  }

);

// =====================================================
// ĐĂNG NHẬP
// =====================================================

console.log(
  "🔐 Đang đăng nhập Discord..."
);

client.login(
  TOKEN
)

  .then(() => {

    console.log(
      "✅ Đăng nhập Discord thành công."
    );

  })

  .catch(
    error => {

      console.error(

        "❌ KHÔNG THỂ ĐĂNG NHẬP DISCORD:",

        error

      );

      process.exit(1);

    }
  );
