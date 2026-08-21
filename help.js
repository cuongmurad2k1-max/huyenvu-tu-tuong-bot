const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================================================
// CẤU HÌNH
// ======================================================

const PREFIX = ".";

// Số lệnh hiển thị mỗi trang
const COMMANDS_PER_PAGE = 15;

// ======================================================
// TÊN NHÓM
// ======================================================

const GROUP_NAMES = {

    "01_combat": "⚔️ COMBAT",
    "02_tutuong": "🌀 TU TƯỞNG",
    "03_thanhthu": "🔥 THẦN THÚ",
    "04_nhanvat": "👤 NHÂN VẬT",
    "05_boss_raid": "👑 BOSS",
    "06_pvp": "⚔️ PVP",
    "07_guild": "🏯 GUILD",

    "08_phoban": "🏰 PHÓ BẢN",
    "09_item": "🎒 VẬT PHẨM",
    "10_shop": "🛒 CỬA HÀNG",
    "11_economy": "💰 KINH TẾ",
    "12_rank": "🏆 XẾP HẠNG",
    "13_event": "🎉 SỰ KIỆN",
    "14_admin": "🛡️ ADMIN",
    "15_system": "⚙️ HỆ THỐNG"
};

// ======================================================
// LẤY TÊN NHÓM TỪ FILE
// ======================================================

function getGroupName(filePath) {

    const fileName = path.basename(filePath, ".js")
        .toLowerCase();

    // Ví dụ:
    // 01_combat.js
    // 02_tutuong.js

    if (GROUP_NAMES[fileName]) {
        return GROUP_NAMES[fileName];
    }

    // Nếu file nằm trong thư mục
    const parent = path.basename(
        path.dirname(filePath)
    ).toLowerCase();

    if (GROUP_NAMES[parent]) {
        return GROUP_NAMES[parent];
    }

    // Tự lấy tên file
    return `📁 ${fileName
        .replace(/^\d+[_-]?/, "")
        .replace(/[_-]/g, " ")
        .toUpperCase()}`;
}

// ======================================================
// LẤY COMMAND TỪ COMMAND MAP
// ======================================================

function getCommands(commandMap) {

    const groups = new Map();

    for (const [name, command] of commandMap.entries()) {

        if (!command) {
            continue;
        }

        let group = "📚 KHÁC";

        if (command.file) {
            group = getGroupName(command.file);
        }

        if (!groups.has(group)) {
            groups.set(group, []);
        }

        groups.get(group).push({
            name,
            command
        });
    }

    // Sắp xếp tên lệnh
    for (const list of groups.values()) {

        list.sort((a, b) =>
            a.name.localeCompare(
                b.name,
                "vi",
                {
                    sensitivity: "base"
                }
            )
        );
    }

    return groups;
}

// ======================================================
// LẤY DESCRIPTION
// ======================================================

function getDescription(command) {

    if (!command) {
        return "";
    }

    // description trực tiếp
    if (
        typeof command.description === "string" &&
        command.description.trim()
    ) {
        return command.description;
    }

    // Slash command data
    if (
        command.data &&
        typeof command.data.description === "string"
    ) {
        return command.data.description;
    }

    return "Không có mô tả";
}

// ======================================================
// TẠO EMBED DANH SÁCH NHÓM
// ======================================================

function createMainHelp(groups) {

    let total = 0;

    for (const commands of groups.values()) {
        total += commands.length;
    }

    const embed = new EmbedBuilder()
        .setTitle("📚 HUYỀN VŨ TỨ TƯỢNG")
        .setDescription(
            [
                "Danh sách toàn bộ command của bot.",
                "",
                `📦 **Tổng cộng: ${total} lệnh**`,
                "",
                "👇 Chọn một nhóm bên dưới để xem lệnh.",
                "",
                "💡 Bạn vẫn dùng lệnh bình thường:",
                `\`${PREFIX}boss\``,
                `\`${PREFIX}tu\``,
                `\`${PREFIX}combat\``,
                `\`${PREFIX}help\``
            ].join("\n")
        )
        .setColor(0x5865F2)
        .setFooter({
            text: "Huyền Vũ Tứ Tượng • Hệ thống command"
        });

    let text = "";

    for (const [group, commands] of groups) {

        text += `\n${group} — **${commands.length} lệnh**`;
    }

    if (text.length <= 3900) {
        embed.addFields({
            name: "📂 CÁC NHÓM COMMAND",
            value: text.trim()
        });
    }

    return embed;
}

// ======================================================
// TẠO NÚT NHÓM
// ======================================================

function createGroupButtons(groups) {

    const buttons = [];

    let index = 0;

    for (const [group] of groups) {

        if (index >= 20) {
            break;
        }

        const id = `help_group_${index}`;

        buttons.push(
            new ButtonBuilder()
                .setCustomId(id)
                .setLabel(
                    group
                        .replace(
                            /^[^\p{L}\p{N}]+/u,
                            ""
                        )
                        .slice(0, 80)
                )
                .setStyle(ButtonStyle.Primary)
        );

        index++;
    }

    const rows = [];

    for (let i = 0; i < buttons.length; i += 5) {

        rows.push(
            new ActionRowBuilder()
                .addComponents(
                    buttons.slice(i, i + 5)
                )
        );
    }

    return rows;
}

// ======================================================
// TẠO DANH SÁCH NHÓM THEO INDEX
// ======================================================

function getGroupByIndex(groups, index) {

    let i = 0;

    for (const [group, commands] of groups) {

        if (i === index) {
            return {
                name: group,
                commands
            };
        }

        i++;
    }

    return null;
}

// ======================================================
// TẠO EMBED COMMAND
// ======================================================

function createCommandEmbed(
    groupName,
    commands,
    page
) {

    const totalPages = Math.max(
        1,
        Math.ceil(
            commands.length /
            COMMANDS_PER_PAGE
        )
    );

    if (page < 0) {
        page = 0;
    }

    if (page >= totalPages) {
        page = totalPages - 1;
    }

    const start =
        page * COMMANDS_PER_PAGE;

    const end =
        Math.min(
            start + COMMANDS_PER_PAGE,
            commands.length
        );

    const current =
        commands.slice(start, end);

    let description = "";

    for (const item of current) {

        const desc =
            getDescription(item.command);

        description +=
            `\`${PREFIX}${item.name}\` — ${desc}\n`;
    }

    const embed = new EmbedBuilder()
        .setTitle(
            `${groupName}`
        )
        .setDescription(
            description ||
            "Không có command."
        )
        .setColor(0x5865F2)
        .setFooter({
            text:
                `Trang ${page + 1}/${totalPages} • ` +
                `${commands.length} lệnh`
        });

    return {
        embed,
        page,
        totalPages
    };
}

// ======================================================
// NÚT TRANG
// ======================================================

function createPageButtons(
    groupIndex,
    page,
    totalPages
) {

    const row =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `help_prev_${groupIndex}_${page}`
                    )
                    .setLabel("⬅️ Trước")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page <= 0),

                new ButtonBuilder()
                    .setCustomId(
                        `help_home_${groupIndex}`
                    )
                    .setLabel("🏠 Nhóm")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId(
                        `help_next_${groupIndex}_${page}`
                    )
                    .setLabel("Sau ➡️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(
                        page >= totalPages - 1
                    )
            );

    return row;
}

// ======================================================
// MODULE
// ======================================================

module.exports = {

    name: "help",

    description:
        "📚 Hiển thị toàn bộ command theo từng nhóm",

    async execute(message, args, commandMap) {

        try {

            // ==================================================
            // KIỂM TRA COMMAND MAP
            // ==================================================

            if (
                !commandMap ||
                typeof commandMap.entries !== "function"
            ) {

                await message.reply(
                    "❌ Không thể lấy danh sách command."
                );

                return;
            }

            // ==================================================
            // TẠO GROUP
            // ==================================================

            const groups =
                getCommands(commandMap);

            if (groups.size === 0) {

                await message.reply(
                    "❌ Không tìm thấy command nào."
                );

                return;
            }

            // ==================================================
            // EMBED CHÍNH
            // ==================================================

            const embed =
                createMainHelp(groups);

            const rows =
                createGroupButtons(groups);

            // ==================================================
            // GỬI HELP
            // ==================================================

            const helpMessage =
                await message.reply({
                    embeds: [embed],
                    components: rows
                });

            // ==================================================
            // COLLECTOR
            // ==================================================

            const collector =
                helpMessage.createMessageComponentCollector({
                    time: 5 * 60 * 1000
                });

            // ==================================================
            // XỬ LÝ BUTTON
            // ==================================================

            collector.on(
                "collect",
                async (interaction) => {

                    try {

                        // Chỉ người gọi .help
                        // được điều khiển menu

                        if (
                            interaction.user.id !==
                            message.author.id
                        ) {

                            await interaction.reply({
                                content:
                                    "❌ Đây không phải menu help của bạn.",
                                ephemeral: true
                            });

                            return;
                        }

                        const customId =
                            interaction.customId;

                        // ==================================================
                        // VỀ TRANG NHÓM
                        // ==================================================

                        if (
                            customId.startsWith(
                                "help_home_"
                            )
                        ) {

                            const mainEmbed =
                                createMainHelp(groups);

                            const mainRows =
                                createGroupButtons(groups);

                            await interaction.update({
                                embeds: [
                                    mainEmbed
                                ],
                                components:
                                    mainRows
                            });

                            return;
                        }

                        // ==================================================
                        // CHỌN NHÓM
                        // ==================================================

                        if (
                            customId.startsWith(
                                "help_group_"
                            )
                        ) {

                            const index =
                                Number(
                                    customId
                                        .replace(
                                            "help_group_",
                                            ""
                                        )
                                );

                            const group =
                                getGroupByIndex(
                                    groups,
                                    index
                                );

                            if (!group) {

                                await interaction.reply({
                                    content:
                                        "❌ Không tìm thấy nhóm.",
                                    ephemeral: true
                                });

                                return;
                            }

                            const result =
                                createCommandEmbed(
                                    group.name,
                                    group.commands,
                                    0
                                );

                            const pageRow =
                                createPageButtons(
                                    index,
                                    result.page,
                                    result.totalPages
                                );

                            await interaction.update({
                                embeds: [
                                    result.embed
                                ],
                                components: [
                                    pageRow
                                ]
                            });

                            return;
                        }

                        // ==================================================
                        // NÚT TRANG
                        // ==================================================

                        if (
                            customId.startsWith(
                                "help_prev_"
                            ) ||
                            customId.startsWith(
                                "help_next_"
                            )
                        ) {

                            const parts =
                                customId.split("_");

                            const action =
                                parts[1];

                            const groupIndex =
                                Number(parts[2]);

                            const oldPage =
                                Number(parts[3]);

                            let newPage =
                                oldPage;

                            if (
                                action === "prev"
                            ) {
                                newPage--;
                            }

                            if (
                                action === "next"
                            ) {
                                newPage++;
                            }

                            const group =
                                getGroupByIndex(
                                    groups,
                                    groupIndex
                                );

                            if (!group) {

                                await interaction.reply({
                                    content:
                                        "❌ Không tìm thấy nhóm.",
                                    ephemeral: true
                                });

                                return;
                            }

                            const result =
                                createCommandEmbed(
                                    group.name,
                                    group.commands,
                                    newPage
                                );

                            const pageRow =
                                createPageButtons(
                                    groupIndex,
                                    result.page,
                                    result.totalPages
                                );

                            await interaction.update({
                                embeds: [
                                    result.embed
                                ],
                                components: [
                                    pageRow
                                ]
                            });

                            return;
                        }

                    } catch (error) {

                        console.error(
                            "❌ Lỗi HELP BUTTON:"
                        );

                        console.error(error);

                        try {

                            if (
                                !interaction.replied &&
                                !interaction.deferred
                            ) {

                                await interaction.reply({
                                    content:
                                        "❌ Có lỗi khi sử dụng menu help.",
                                    ephemeral: true
                                });

                            }

                        } catch {}
                    }
                }
            );

            // ==================================================
            // HẾT THỜI GIAN
            // ==================================================

            collector.on(
                "end",
                async () => {

                    try {

                        await helpMessage.edit({
                            components: []
                        });

                    } catch {}
                }
            );

        } catch (error) {

            console.error(
                "❌ LỖI COMMAND .HELP:"
            );

            console.error(error);

            try {

                await message.reply(
                    "❌ Có lỗi khi mở danh sách lệnh."
                );

            } catch {}
        }
    }
};
