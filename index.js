require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Events,
    Partials
} = require("discord.js");

const db = require("./database");

// =====================================================
// 🐢 HUYỀN VŨ – PREFIX COMMAND SYSTEM
// =====================================================

const PREFIX = ".";

// =====================================================
// 🐾 FACTIONS
// =====================================================

let factions = [];

try {
    factions = require("./factions.json");

    if (!Array.isArray(factions)) {
        factions = [];
    }
} catch (error) {
    console.warn("⚠️ Không tìm thấy factions.json.");
    factions = [];
}

// =====================================================
// 📦 LOAD COMMANDS
// =====================================================

let commands = [];

try {
    commands = require("./commands");

    if (!Array.isArray(commands)) {
        console.warn("⚠️ ./commands không trả về Array.");
        commands = [];
    }

    console.log(
        `✅ Đã load ${commands.length} commands.`
    );

} catch (error) {

    console.error(
        "❌ Không thể load ./commands:"
    );

    console.error(error);

    commands = [];
}

// =====================================================
// 🤖 CLIENT
// =====================================================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent

    ],

    partials: [
        Partials.Channel,
        Partials.Message
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
            typeof command.data.name === "string" &&
            typeof command.execute === "function"
        ) {

            commandMap.set(
                command.data.name.toLowerCase(),
                command
            );

        }

    } catch (error) {

        console.error(
            "❌ Lỗi load command:",
            error
        );

    }

}

console.log(
    `📜 Command Map: ${commandMap.size} commands`
);

// =====================================================
// 🧹 XÓA TOÀN BỘ SLASH COMMAND
// =====================================================

async function deleteAllSlashCommands() {

    try {

        console.log(
            "🧹 Đang xóa toàn bộ Slash Commands..."
        );

        // Global commands
        if (client.application) {

            await client.application.commands.set([]);

            console.log(
                "✅ Đã xóa Global Slash Commands."
            );

        }

        // Guild commands
        for (const guild of client.guilds.cache.values()) {

            try {

                await guild.commands.set([]);

                console.log(
                    `✅ Đã xóa Slash Commands tại server: ${guild.name}`
                );

            } catch (error) {

                console.error(
                    `❌ Không thể xóa Slash Commands tại ${guild.name}:`,
                    error.message
                );

            }

        }

        console.log(
            "🧹 HOÀN TẤT XÓA SLASH COMMAND."
        );

    } catch (error) {

        console.error(
            "❌ LỖI XÓA SLASH COMMAND:"
        );

        console.error(error);

    }

}

// =====================================================
// 🧩 TẠO OPTIONS GIẢ LẬP CHO PREFIX COMMAND
// =====================================================

function createOptions(command, args) {

    const values = {};

    let optionDefinitions = [];

    try {

        if (
            command &&
            command.data &&
            typeof command.data.toJSON === "function"
        ) {

            const json =
                command.data.toJSON();

            optionDefinitions =
                Array.isArray(json.options)
                    ? json.options
                    : [];

        }

    } catch (error) {

        optionDefinitions = [];

    }

    // -------------------------------------------------
    // Nếu command không có option definition
    // -------------------------------------------------

    if (!optionDefinitions.length) {

        args.forEach(
            (value, index) => {

                values[`arg${index}`] =
                    value;

            }
        );

    } else {

        let argIndex = 0;

        for (const option of optionDefinitions) {

            if (!option) continue;

            // Subcommand
            if (
                option.type === 1 ||
                option.type === 2
            ) {

                continue;

            }

            const name =
                option.name;

            const raw =
                args[argIndex];

            if (
                raw === undefined
            ) {

                continue;

            }

            let value = raw;

            // STRING
            if (option.type === 3) {

                value =
                    String(raw);

            }

            // INTEGER
            else if (option.type === 4) {

                const number =
                    Number.parseInt(
                        raw,
                        10
                    );

                value =
                    Number.isNaN(number)
                        ? 0
                        : number;

            }

            // BOOLEAN
            else if (option.type === 5) {

                value =
                    [
                        "true",
                        "1",
                        "yes",
                        "y",
                        "co",
                        "có"
                    ].includes(
                        String(raw)
                            .toLowerCase()
                    );

            }

            // NUMBER
            else if (option.type === 10) {

                const number =
                    Number(raw);

                value =
                    Number.isNaN(number)
                        ? 0
                        : number;

            }

            values[name] =
                value;

            argIndex++;

        }

    }

    // =================================================
    // OPTIONS API
    // =================================================

    return {

        getString(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                value === undefined
            ) {

                throw new Error(
                    `Thiếu tham số: ${name}`
                );

            }

            return value === undefined
                ? null
                : String(value);

        },

        getInteger(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                value === undefined
            ) {

                throw new Error(
                    `Thiếu tham số: ${name}`
                );

            }

            if (value === undefined) {
                return null;
            }

            return Number.parseInt(
                value,
                10
            );

        },

        getNumber(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                value === undefined
            ) {

                throw new Error(
                    `Thiếu tham số: ${name}`
                );

            }

            if (value === undefined) {
                return null;
            }

            return Number(value);

        },

        getBoolean(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                value === undefined
            ) {

                throw new Error(
                    `Thiếu tham số: ${name}`
                );

            }

            if (value === undefined) {
                return null;
            }

            return Boolean(value);

        },

        getUser(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                !value
            ) {

                throw new Error(
                    `Thiếu user: ${name}`
                );

            }

            return null;

        },

        getMember(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                !value
            ) {

                throw new Error(
                    `Thiếu member: ${name}`
                );

            }

            return null;

        },

        getRole(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                !value
            ) {

                throw new Error(
                    `Thiếu role: ${name}`
                );

            }

            return null;

        },

        getChannel(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                !value
            ) {

                throw new Error(
                    `Thiếu channel: ${name}`
                );

            }

            return null;

        },

        getMentionable(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                !value
            ) {

                throw new Error(
                    `Thiếu mentionable: ${name}`
                );

            }

            return null;

        },

        getAttachment(
            name,
            required = false
        ) {

            const value =
                values[name];

            if (
                required &&
                !value
            ) {

                throw new Error(
                    `Thiếu attachment: ${name}`
                );

            }

            return null;

        },

        getSubcommand(
            required = false
        ) {

            return null;

        },

        getSubcommandGroup(
            required = false
        ) {

            return null;

        }

    };

}

// =====================================================
// 💬 PREFIX INTERACTION ADAPTER
// =====================================================

function createPrefixInteraction(
    message,
    command,
    args
) {

    let replied = false;
    let deferred = false;

    let lastMessage = null;

    const interaction = {

        // ---------------------------------------------
        // USER
        // ---------------------------------------------

        user: message.author,

        member:
            message.member,

        guild:
            message.guild,

        channel:
            message.channel,

        client,

        message,

        commandName:
            command.data?.name || "",

        customId:
            null,

        args,

        options:
            createOptions(
                command,
                args
            ),

        replied: false,

        deferred: false,

        // ---------------------------------------------
        // REPLY
        // ---------------------------------------------

        async reply(payload) {

            if (
                typeof payload ===
                "string"
            ) {

                payload = {
                    content: payload
                };

            }

            if (!payload) {
                payload = {};
            }

            // ephemeral không có ý nghĩa
            // với prefix message
            delete payload.ephemeral;

            replied = true;

            this.replied = true;

            lastMessage =
                await message.channel.send(
                    payload
                );

            return lastMessage;

        },

        // ---------------------------------------------
        // DEFER REPLY
        // ---------------------------------------------

        async deferReply() {

            deferred = true;

            this.deferred = true;

            return;

        },

        // ---------------------------------------------
        // EDIT REPLY
        // ---------------------------------------------

        async editReply(payload) {

            if (
                typeof payload ===
                "string"
            ) {

                payload = {
                    content: payload
                };

            }

            if (lastMessage) {

                return lastMessage.edit(
                    payload
                );

            }

            return this.reply(
                payload
            );

        },

        // ---------------------------------------------
        // DELETE REPLY
        // ---------------------------------------------

        async deleteReply() {

            if (lastMessage) {

                try {

                    await lastMessage.delete();

                } catch {}

            }

        },

        // ---------------------------------------------
        // FOLLOW UP
        // ---------------------------------------------

        async followUp(payload) {

            if (
                typeof payload ===
                "string"
            ) {

                payload = {
                    content: payload
                };

            }

            if (!payload) {
                payload = {};
            }

            delete payload.ephemeral;

            return message.channel.send(
                payload
            );

        },

        // ---------------------------------------------
        // FETCH REPLY
        // ---------------------------------------------

        async fetchReply() {

            return lastMessage;

        },

        // ---------------------------------------------
        // IS CHAT INPUT
        // ---------------------------------------------

        isChatInputCommand() {

            return true;

        },

        // ---------------------------------------------
        // IS BUTTON
        // ---------------------------------------------

        isButton() {

            return false;

        },

        // ---------------------------------------------
        // UPDATE
        // ---------------------------------------------

        async update(payload) {

            if (
                typeof payload ===
                "string"
            ) {

                payload = {
                    content: payload
                };

            }

            delete payload?.ephemeral;

            return this.reply(
                payload
            );

        }

    };

    return interaction;

}

// =====================================================
// 🟢 READY
// =====================================================

client.once(
    Events.ClientReady,
    async (clientUser) => {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "🐢 HUYỀN VŨ PREFIX BOT"
        );

        console.log(
            `🤖 Bot: ${clientUser.user.tag}`
        );

        console.log(
            `🌐 Servers: ${clientUser.guilds.cache.size}`
        );

        console.log(
            `📜 Commands: ${commandMap.size}`
        );

        console.log(
            `🔰 Prefix: ${PREFIX}`
        );

        console.log(
            "======================================"
        );

        // Xóa Slash Commands
        await deleteAllSlashCommands();

        console.log(
            "🟢 Bot sẵn sàng nhận lệnh PREFIX."
        );

    }
);

// =====================================================
// 💬 PREFIX COMMAND
// =====================================================

client.on(
    Events.MessageCreate,
    async message => {

        try {

            // Không xử lý bot
            if (message.author.bot) {
                return;
            }

            // Không có prefix
            if (
                !message.content.startsWith(
                    PREFIX
                )
            ) {

                return;

            }

            // Bỏ dấu .
            const content =
                message.content
                    .slice(PREFIX.length)
                    .trim();

            if (!content) {
                return;
            }

            // -----------------------------------------
            // TÁCH LỆNH + ARGUMENT
            // -----------------------------------------

            const parts =
                content.split(/\s+/);

            const commandName =
                parts.shift()
                    .toLowerCase();

            const args =
                parts;

            // -----------------------------------------
            // TÌM COMMAND
            // -----------------------------------------

            const command =
                commandMap.get(
                    commandName
                );

            if (!command) {

                return;

            }

            console.log(
                `📥 ${message.author.tag}: .${commandName}`
            );

            // -----------------------------------------
            // TẠO INTERACTION GIẢ
            // -----------------------------------------

            const interaction =
                createPrefixInteraction(
                    message,
                    command,
                    args
                );

            // -----------------------------------------
            // EXECUTE
            // -----------------------------------------

            await command.execute(
                interaction
            );

        } catch (error) {

            console.error(
                "❌ PREFIX COMMAND ERROR:"
            );

            console.error(error);

            try {

                await message.channel.send(
                    "❌ Đã xảy ra lỗi khi thực hiện lệnh."
                );

            } catch {}

        }

    }
);

// =====================================================
// 🔘 BUTTON / SELECT / MODAL
// =====================================================

client.on(
    Events.InteractionCreate,
    async interaction => {

        try {

            // =========================================
            // BUTTON
            // =========================================

            if (
                interaction.isButton()
            ) {

                const parts =
                    interaction.customId
                        .split(":");

                const type =
                    parts[0];

                const uid =
                    parts[1];

                const id =
                    parts[2];

                // -------------------------------------
                // USER CHECK
                // -------------------------------------

                if (
                    uid &&
                    uid !==
                    interaction.user.id
                ) {

                    return interaction.reply({
                        content:
                            "❌ Menu này không thuộc về bạn.",
                        ephemeral: true
                    });

                }

                // -------------------------------------
                // TỨ TƯỢNG
                // -------------------------------------

                if (
                    type ===
                    "faction"
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
                            ephemeral: true
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

                    // ---------------------------------
                    // DATABASE
                    // ---------------------------------

                    try {

                        if (
                            typeof db.mutate ===
                            "function"
                        ) {

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

                        }

                    } catch (error) {

                        console.error(
                            "❌ Lỗi faction database:",
                            error
                        );

                    }

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

                return interaction.reply({
                    content:
                        "❌ Nút này chưa được hệ thống hỗ trợ.",
                    ephemeral: true
                });

            }

            // =========================================
            // SELECT MENU
            // =========================================

            if (
                interaction.isStringSelectMenu()
            ) {

                const customId =
                    interaction.customId;

                // Phó bản
                if (
                    customId ===
                    "chon_pho_ban"
                ) {

                    const phoban =
                        commandMap.get(
                            "phoban"
                        );

                    if (
                        phoban &&
                        typeof phoban.execute ===
                        "function"
                    ) {

                        return await phoban.execute(
                            interaction
                        );

                    }

                }

                // Cho command xử lý riêng
                for (
                    const command of commandMap.values()
                ) {

                    try {

                        if (
                            typeof command.handleSelectMenu ===
                            "function"
                        ) {

                            const handled =
                                await command.handleSelectMenu(
                                    interaction
                                );

                            if (handled) {
                                return;
                            }

                        }

                    } catch (error) {

                        console.error(
                            "❌ Select Menu Error:",
                            error
                        );

                    }

                }

                return;

            }

            // =========================================
            // USER SELECT
            // =========================================

            if (
                interaction.isUserSelectMenu()
            ) {

                for (
                    const command of commandMap.values()
                ) {

                    if (
                        typeof command.handleUserSelect ===
                        "function"
                    ) {

                        return await command.handleUserSelect(
                            interaction
                        );

                    }

                }

                return;

            }

            // =========================================
            // MODAL
            // =========================================

            if (
                interaction.isModalSubmit()
            ) {

                for (
                    const command of commandMap.values()
                ) {

                    if (
                        typeof command.handleModal ===
                        "function"
                    ) {

                        const customId =
                            interaction.customId;

                        if (
                            customId.startsWith(
                                "admin_modal_"
                            ) ||
                            customId.startsWith(
                                "tm_"
                            )
                        ) {

                            return await command.handleModal(
                                interaction
                            );

                        }

                    }

                }

                return;

            }

            // =========================================
            // TUYỆT ĐỐI KHÔNG XỬ LÝ SLASH COMMAND
            // =========================================

            if (
                interaction.isChatInputCommand()
            ) {

                return;

            }

        } catch (error) {

            console.error(
                "❌ INTERACTION ERROR:"
            );

            console.error(error);

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({
                        content:
                            "❌ Đã xảy ra lỗi hệ thống.",
                        ephemeral: true
                    });

                } else {

                    await interaction.reply({
                        content:
                            "❌ Đã xảy ra lỗi hệ thống.",
                        ephemeral: true
                    });

                }

            } catch {}

        }

    }
);

// =====================================================
// 🔐 LOGIN
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

} else {

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

        console.error(error);

    });

}
