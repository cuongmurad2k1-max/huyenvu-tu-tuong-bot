const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// ======================================================
// CẤU HÌNH 14 NHÓM LỚN
// ======================================================

const GROUPS = [
    {
        name: "🌟 NHÂN VẬT",
        keywords: [
            "batdau",
            "trangthai",
            "tuv",
            "me",
            "profile",
            "nhanvat",
            "thongtin",
            "hoso",
            "avatar",
            "info"
        ]
    },

    {
        name: "🔥 TU LUYỆN",
        keywords: [
            "tuluyen",
            "tuyenluyen",
            "tuvi",
            "canhgioi",
            "dotpha",
            "linhthu",
            "kinhnghiem",
            "linhluc",
            "khang",
            "congphap",
            "tamphap"
        ]
    },

    {
        name: "⚔️ CHIẾN ĐẤU",
        keywords: [
            "combat",
            "danh",
            "chien",
            "arena",
            "pvp",
            "pk",
            "battle",
            "dautruong",
            "phoban",
            "boss",
            "raid"
        ]
    },

    {
        name: "🌎 THẾ GIỚI",
        keywords: [
            "thegioi",
            "khuvuc",
            "map",
            "ban do",
            "thanh",
            "lang",
            "vung",
            "di",
            "tele",
            "dichuyen"
        ]
    },

    {
        name: "📜 NHIỆM VỤ",
        keywords: [
            "nhiemvu",
            "quest",
            "daily",
            "dailyquest",
            "nhiemvu",
            "nhiemvutuan",
            "nhiemvungay"
        ]
    },

    {
        name: "🎒 VẬT PHẨM",
        keywords: [
            "item",
            "vatpham",
            "tui",
            "kho",
            "khodo",
            "inventory",
            "inv",
            "nhat",
            "drop",
            "loot",
            "useitem"
        ]
    },

    {
        name: "💰 KINH TẾ",
        keywords: [
            "shop",
            "mua",
            "ban",
            "muasam",
            "money",
            "coin",
            "gold",
            "tien",
            "bank",
            "nganhang",
            "trade",
            "giao"
        ]
    },

    {
        name: "🏆 XẾP HẠNG",
        keywords: [
            "top",
            "rank",
            "ranking",
            "xephang",
            "leaderboard",
            "bxh",
            "diem",
            "thanh tich"
        ]
    },

    {
        name: "📖 CỐT TRUYỆN",
        keywords: [
            "cottruyen",
            "story",
            "truyen",
            "chuong",
            "chapter",
            "su kien",
            "sukien",
            "lichsu"
        ]
    },

    {
        name: "🎯 KỸ NĂNG",
        keywords: [
            "kynang",
            "skill",
            "ky nang",
            "chieu",
            "cong",
            "phap",
            "skilltree",
            "thongthao"
        ]
    },

    {
        name: "🐉 BOSS / PHÓ BẢN",
        keywords: [
            "boss",
            "bossraid",
            "raid",
            "phoban",
            "dungeon",
            "raidboss",
            "worldboss",
            "bosshunt"
        ]
    },

    {
        name: "👥 TƯƠNG TÁC",
        keywords: [
            "tuongtac",
            "friend",
            "banbe",
            "ketban",
            "gift",
            "give",
            "invite",
            "team",
            "party",
            "guild"
        ]
    },

    {
        name: "⚙️ HỆ THỐNG",
        keywords: [
            "help",
            "data",
            "reset",
            "settings",
            "setting",
            "config",
            "ping",
            "uptime",
            "server",
            "bot",
            "admin"
        ]
    }
];

// ======================================================
// TÌM NHÓM CHO COMMAND
// ======================================================

function findGroup(commandName) {

    const name = commandName
        .toLowerCase()
        .replace(/[_\-]/g, "");

    for (const group of GROUPS) {

        for (const keyword of group.keywords) {

            const key = keyword
                .toLowerCase()
                .replace(/[_\-\s]/g, "");

            if (
                name === key ||
                name.includes(key) ||
                key.includes(name)
            ) {
                return group.name;
            }
        }
    }

    return "📦 KHÁC";
}

// ======================================================
// LẤY MÔ TẢ COMMAND
// ======================================================

function getDescription(command) {

    if (!command) {
        return "Không có mô tả";
    }

    if (
        command.data &&
        typeof command.data.description === "string" &&
        command.data.description.length
    ) {
        return command.data.description;
    }

    if (
        typeof command.description === "string" &&
        command.description.length
    ) {
        return command.description;
    }

    if (
        typeof command.desc === "string" &&
        command.desc.length
    ) {
        return command.desc;
    }

    return "Không có mô tả";
}

// ======================================================
// TẠO DANH SÁCH NHÓM
// ======================================================

function buildGroups(commandMap) {

    const result = {};

    // Tạo đủ 14 nhóm
    for (const group of GROUPS) {
        result[group.name] = [];
    }

    // Thêm nhóm KHÁC
    result["📦 KHÁC"] = [];

    // Duyệt toàn bộ command
    for (const [name, command] of commandMap) {

        const groupName = findGroup(name);

        result[groupName].push({
            name,
            description: getDescription(command)
        });
    }

    // Sắp xếp alphabet
    for (const groupName of Object.keys(result)) {

        result[groupName].sort((a, b) =>
            a.name.localeCompare(
                b.name,
                "vi"
            )
        );
    }

    // Xóa nhóm KHÁC nếu không có command
    if (result["📦 KHÁC"].length === 0) {
        delete result["📦 KHÁC"];
    }

    return result;
}

// ======================================================
// CHIA DANH SÁCH COMMAND THÀNH CÁC DÒNG
// ======================================================

function makeCommandText(commands) {

    let text = "";

    for (const command of commands) {

        const line =
            `\`.${command.name}\` — ${command.description}\n`;

        // Không vượt quá giới hạn Embed
        if ((text + line).length > 3900) {
            break;
        }

        text += line;
    }

    return text || "Không có command.";
}

// ======================================================
// TẠO EMBED
// ======================================================

function createEmbed(groupName, commands, page, totalPages, totalCommands) {

    const text = makeCommandText(commands);

    const embed = new EmbedBuilder()
        .setTitle("📚 HUYỀN VŨ TỨ TƯỢNG — DANH SÁCH LỆNH")
        .setDescription(
            `## ${groupName}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            text
        )
        .setFooter({
            text:
                `Tổng ${totalCommands} lệnh • ` +
                `Nhóm ${page + 1}/${totalPages}`
        })
        .setTimestamp();

    return embed;
}

// ======================================================
// NÚT ĐIỀU HƯỚNG
// ======================================================

function createButtons(page, totalPages) {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("help_first")
                .setLabel("⏮️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),

            new ButtonBuilder()
                .setCustomId("help_prev")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0),

            new ButtonBuilder()
                .setCustomId("help_page")
                .setLabel(`${page + 1}/${totalPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId("help_next")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page >= totalPages - 1),

            new ButtonBuilder()
                .setCustomId("help_last")
                .setLabel("⏭️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page >= totalPages - 1)
        );
}

// ======================================================
// COMMAND .HELP
// ======================================================

module.exports = {

    name: "help",

    description: "Hiển thị toàn bộ danh sách 291 lệnh",

    async execute(message) {

        try {

            // ==============================================
            // LẤY COMMAND MAP TỪ CLIENT
            // ==============================================

            const commandMap = message.client.commandMap;

            if (
                !commandMap ||
                commandMap.size === 0
            ) {

                await message.reply(
                    "❌ Không có command nào được tải."
                );

                return;
            }

            // ==============================================
            // CHIA 291 COMMAND THÀNH 14 NHÓM
            // ==============================================

            const groups = buildGroups(commandMap);

            const groupNames = Object.keys(groups);

            // ==============================================
            // CHỈ LẤY 14 NHÓM CHÍNH
            // ==============================================

            const pages = [];

            for (const groupName of groupNames) {

                const commands = groups[groupName];

                pages.push({
                    name: groupName,
                    commands
                });
            }

            // ==============================================
            // TỔNG COMMAND
            // ==============================================

            let totalCommands = 0;

            for (const page of pages) {
                totalCommands += page.commands.length;
            }

            // ==============================================
            // TRANG ĐẦU
            // ==============================================

            let currentPage = 0;

            const embed = createEmbed(
                pages[currentPage].name,
                pages[currentPage].commands,
                currentPage,
                pages.length,
                totalCommands
            );

            const row = createButtons(
                currentPage,
                pages.length
            );

            const reply = await message.reply({
                embeds: [embed],
                components: [row]
            });

            // ==============================================
            // BUTTON COLLECTOR
            // ==============================================

            const collector =
                reply.createMessageComponentCollector({
                    time: 10 * 60 * 1000
                });

            collector.on(
                "collect",
                async (interaction) => {

                    // Chỉ người gọi .help
                    if (
                        interaction.user.id !==
                        message.author.id
                    ) {

                        await interaction.reply({
                            content:
                                "❌ Chỉ người sử dụng `.help` mới có thể chuyển trang.",
                            ephemeral: true
                        });

                        return;
                    }

                    // ======================================
                    // XỬ LÝ NÚT
                    // ======================================

                    if (
                        interaction.customId ===
                        "help_first"
                    ) {

                        currentPage = 0;

                    } else if (
                        interaction.customId ===
                        "help_prev"
                    ) {

                        if (currentPage > 0) {
                            currentPage--;
                        }

                    } else if (
                        interaction.customId ===
                        "help_next"
                    ) {

                        if (
                            currentPage <
                            pages.length - 1
                        ) {
                            currentPage++;
                        }

                    } else if (
                        interaction.customId ===
                        "help_last"
                    ) {

                        currentPage =
                            pages.length - 1;
                    }

                    // ======================================
                    // CẬP NHẬT EMBED
                    // ======================================

                    const newEmbed = createEmbed(
                        pages[currentPage].name,
                        pages[currentPage].commands,
                        currentPage,
                        pages.length,
                        totalCommands
                    );

                    const newRow = createButtons(
                        currentPage,
                        pages.length
                    );

                    await interaction.update({
                        embeds: [newEmbed],
                        components: [newRow]
                    });
                }
            );

            // ==============================================
            // HẾT THỜI GIAN
            // ==============================================

            collector.on("end", async () => {

                try {

                    const disabledRow =
                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId("help_first_end")
                                    .setLabel("⏮️")
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true),

                                new ButtonBuilder()
                                    .setCustomId("help_prev_end")
                                    .setLabel("⬅️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(true),

                                new ButtonBuilder()
                                    .setCustomId("help_page_end")
                                    .setLabel(
                                        `${currentPage + 1}/${pages.length}`
                                    )
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true),

                                new ButtonBuilder()
                                    .setCustomId("help_next_end")
                                    .setLabel("➡️")
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(true),

                                new ButtonBuilder()
                                    .setCustomId("help_last_end")
                                    .setLabel("⏭️")
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true)
                            );

                    await reply.edit({
                        components: [disabledRow]
                    });

                } catch {}
            });

        } catch (error) {

            console.error(
                "❌ Lỗi .help:"
            );

            console.error(error);

            try {

                await message.reply(
                    "❌ Có lỗi khi tạo danh sách command."
                );

            } catch {}
        }
    }
};
