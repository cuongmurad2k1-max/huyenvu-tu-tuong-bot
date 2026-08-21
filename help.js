const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const path = require("path");

// ======================================================
// CONFIG
// ======================================================

const PREFIX = ".";

// Số command hiển thị trên 1 trang
const COMMANDS_PER_PAGE = 15;

// ======================================================
// TÊN NHÓM
// ======================================================

const GROUP_NAMES = {

    "01_combat":
        "⚔️ COMBAT",

    "02_tutuong":
        "🌀 TU TƯỞNG",

    "03_thanthu":
        "🔥 THẦN THÚ",

    "04_nhanvat":
        "👤 NHÂN VẬT",

    "05_boss_raid":
        "👑 BOSS",

    "06_pvp":
        "⚔️ PVP",

    "07_guild":
        "🏯 GUILD"
};

// ======================================================
// LẤY TÊN NHÓM
// ======================================================

function getGroupName(filePath) {

    if (!filePath) {
        return "📚 KHÁC";
    }

    const fileName =
        path.basename(
            filePath,
            ".js"
        ).toLowerCase();

    // ==================================================
    // FILE GỐC
    // ==================================================

    if (
        GROUP_NAMES[fileName]
    ) {

        return GROUP_NAMES[
            fileName
        ];
    }

    // ==================================================
    // THƯ MỤC CHA
    // ==================================================

    const parent =
        path.basename(
            path.dirname(filePath)
        ).toLowerCase();

    if (
        GROUP_NAMES[parent]
    ) {

        return GROUP_NAMES[
            parent
        ];
    }

    // ==================================================
    // TỰ TẠO TÊN
    // ==================================================

    const cleanName =
        fileName
            .replace(
                /^\d+[_-]?/,
                ""
            )
            .replace(
                /[_-]/g,
                " "
            )
            .trim()
            .toUpperCase();

    if (!cleanName) {
        return "📚 KHÁC";
    }

    return `📁 ${cleanName}`;
}

// ======================================================
// LẤY DESCRIPTION
// ======================================================

function getDescription(command) {

    if (!command) {
        return "Không có mô tả";
    }

    // ==================================================
    // DESCRIPTION TRỰC TIẾP
    // ==================================================

    if (
        typeof command.description ===
        "string" &&
        command.description.trim()
    ) {

        return command.description
            .trim();
    }

    // ==================================================
    // SLASH DATA
    // ==================================================

    if (
        command.data &&
        typeof command.data.description ===
        "string" &&
        command.data.description.trim()
    ) {

        return command.data.description
            .trim();
    }

    return "Không có mô tả";
}

// ======================================================
// TẠO GROUP
// ======================================================

function buildGroups(commandMap) {

    const groups = new Map();

    // ==================================================
    // ĐỌC TOÀN BỘ COMMAND
    // ==================================================

    for (
        const [name, command]
        of commandMap.entries()
    ) {

        if (!command) {
            continue;
        }

        let group =
            getGroupName(
                command.file
            );

        if (!groups.has(group)) {

            groups.set(
                group,
                []
            );
        }

        groups
            .get(group)
            .push({
                name,
                command
            });
    }

    // ==================================================
    // SẮP XẾP COMMAND
    // ==================================================

    for (
        const commands
        of groups.values()
    ) {

        commands.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    "vi",
                    {
                        sensitivity:
                            "base"
                    }
                )
        );
    }

    return groups;
}

// ======================================================
// TỔNG COMMAND
// ======================================================

function getTotalCommands(groups) {

    let total = 0;

    for (
        const commands
        of groups.values()
    ) {

        total +=
            commands.length;
    }

    return total;
}

// ======================================================
// LẤY GROUP THEO INDEX
// ======================================================

function getGroupByIndex(
    groups,
    index
) {

    let current = 0;

    for (
        const [name, commands]
        of groups
    ) {

        if (
            current === index
        ) {

            return {
                name,
                commands
            };
        }

        current++;
    }

    return null;
}

// ======================================================
// TẠO TRANG CHÍNH
// ======================================================

function createMainEmbed(groups) {

    const total =
        getTotalCommands(
            groups
        );

    let text = "";

    for (
        const [group, commands]
        of groups
    ) {

        text +=
            `${group} — **${commands.length} lệnh**\n`;
    }

    const embed =
        new EmbedBuilder()
            .setTitle(
                "📚 HUYỀN VŨ TỨ TƯỢNG"
            )
            .setDescription(
                [
                    "Danh sách toàn bộ command.",
                    "",
                    `📦 **Tổng cộng: ${total} lệnh**`,
                    "",
                    "👇 Chọn nhóm để xem command.",
                    "",
                    "💡 Ví dụ:",
                    "`.boss`",
                    "`.tu`",
                    "`.combat`",
                    "`.shop`",
                    "`.help`"
                ].join("\n")
            )
            .addFields({
                name:
                    "📂 CÁC NHÓM COMMAND",
                value:
                    text ||
                    "Không có command."
            })
            .setColor(
                0x5865F2
            )
            .setFooter({
                text:
                    "Huyền Vũ Tứ Tượng • Tất cả command vẫn dùng bằng dấu ."
            });

    return embed;
}

// ======================================================
// TẠO BUTTON NHÓM
// ======================================================

function createGroupButtons(groups) {

    const buttons = [];

    let index = 0;

    for (
        const [group]
        of groups
    ) {

        // Discord tối đa 25 button
        if (
            index >= 25
        ) {
            break;
        }

        let label =
            group
                .replace(
                    /^[^\p{L}\p{N}]+/u,
                    ""
                )
                .trim();

        if (
            label.length > 80
        ) {

            label =
                label.slice(
                    0,
                    80
                );
        }

        buttons.push(
            new ButtonBuilder()
                .setCustomId(
                    `help_group_${index}`
                )
                .setLabel(
                    label
                )
                .setStyle(
                    ButtonStyle.Primary
                )
        );

        index++;
    }

    const rows = [];

    for (
        let i = 0;
        i < buttons.length;
        i += 5
    ) {

        rows.push(
            new ActionRowBuilder()
                .addComponents(
                    buttons.slice(
                        i,
                        i + 5
                    )
                )
        );
    }

    return rows;
}

// ======================================================
// TẠO TRANG COMMAND
// ======================================================

function createCommandPage(
    groupName,
    commands,
    page
) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                commands.length /
                COMMANDS_PER_PAGE
            )
        );

    // ==================================================
    // GIỚI HẠN PAGE
    // ==================================================

    if (
        page < 0
    ) {

        page = 0;
    }

    if (
        page >= totalPages
    ) {

        page =
            totalPages - 1;
    }

    // ==================================================
    // LẤY COMMAND
    // ==================================================

    const start =
        page *
        COMMANDS_PER_PAGE;

    const end =
        Math.min(
            start +
            COMMANDS_PER_PAGE,
            commands.length
        );

    const current =
        commands.slice(
            start,
            end
        );

    // ==================================================
    // TẠO TEXT
    // ==================================================

    let description = "";

    for (
        const item
        of current
    ) {

        let desc =
            getDescription(
                item.command
            );

        // Tránh embed quá dài
        if (
            desc.length > 150
        ) {

            desc =
                desc.slice(
                    0,
                    147
                ) + "...";
        }

        description +=
            `\`${PREFIX}${item.name}\` — ${desc}\n`;
    }

    if (!description) {

        description =
            "Không có command.";
    }

    // ==================================================
    // EMBED
    // ==================================================

    const embed =
        new EmbedBuilder()
            .setTitle(
                groupName
            )
            .setDescription(
                description
            )
            .setColor(
                0x5865F2
            )
            .setFooter({
                text:
                    `Trang ${page + 1}/${totalPages} • ${commands.length} lệnh`
            });

    return {
        embed,
        page,
        totalPages
    };
}

// ======================================================
// BUTTON TRANG
// ======================================================

function createPageButtons(
    groupIndex,
    page,
    totalPages
) {

    return new ActionRowBuilder()
        .addComponents(

            // ==================================================
            // TRANG TRƯỚC
            // ==================================================

            new ButtonBuilder()
                .setCustomId(
                    `help_prev_${groupIndex}_${page}`
                )
                .setLabel(
                    "⬅️ Trước"
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    page <= 0
                ),

            // ==================================================
            // VỀ NHÓM
            // ==================================================

            new ButtonBuilder()
                .setCustomId(
                    `help_home`
                )
                .setLabel(
                    "🏠 Nhóm"
                )
                .setStyle(
                    ButtonStyle.Primary
                ),

            // ==================================================
            // TRANG SAU
            // ==================================================

            new ButtonBuilder()
                .setCustomId(
                    `help_next_${groupIndex}_${page}`
                )
                .setLabel(
                    "Sau ➡️"
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    page >=
                    totalPages - 1
                )
        );
}

// ======================================================
// MODULE
// ======================================================

module.exports = {

    name: "help",

    description:
        "📚 Hiển thị toàn bộ 291 command theo nhóm",

    async execute(
        message,
        args,
        commandMap
    ) {

        try {

            // ==================================================
            // KIỂM TRA COMMAND MAP
            // ==================================================

            if (
                !commandMap ||
                typeof commandMap.entries !==
                "function"
            ) {

                console.error(
                    "❌ HELP: commandMap không được truyền vào."
                );

                await message.reply(
                    "❌ Không thể lấy danh sách command."
                );

                return;
            }

            // ==================================================
            // TẠO GROUP
            // ==================================================

            const groups =
                buildGroups(
                    commandMap
                );

            if (
                groups.size === 0
            ) {

                await message.reply(
                    "❌ Không tìm thấy command nào."
                );

                return;
            }

            // ==================================================
            // TẠO EMBED CHÍNH
            // ==================================================

            const mainEmbed =
                createMainEmbed(
                    groups
                );

            const groupButtons =
                createGroupButtons(
                    groups
                );

            // ==================================================
            // GỬI MESSAGE
            // ==================================================

            const helpMessage =
                await message.reply({

                    embeds: [
                        mainEmbed
                    ],

                    components:
                        groupButtons
                });

            // ==================================================
            // COLLECTOR
            // ==================================================

            const collector =
                helpMessage.createMessageComponentCollector({

                    time:
                        5 * 60 * 1000
                });

            // ==================================================
            // BUTTON COLLECT
            // ==================================================

            collector.on(
                "collect",
                async (
                    interaction
                ) => {

                    try {

                        // ==================================================
                        // CHỈ NGƯỜI DÙNG .HELP
                        // ==================================================

                        if (
                            interaction.user.id !==
                            message.author.id
                        ) {

                            await interaction.reply({

                                content:
                                    "❌ Bạn không thể điều khiển menu `.help` của người khác.",

                                ephemeral:
                                    true
                            });

                            return;
                        }

                        const customId =
                            interaction.customId;

                        // ==================================================
                        // VỀ TRANG NHÓM
                        // ==================================================

                        if (
                            customId ===
                            "help_home"
                        ) {

                            const embed =
                                createMainEmbed(
                                    groups
                                );

                            const buttons =
                                createGroupButtons(
                                    groups
                                );

                            await interaction.update({

                                embeds: [
                                    embed
                                ],

                                components:
                                    buttons
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
                                    customId.replace(
                                        "help_group_",
                                        ""
                                    )
                                );

                            if (
                                Number.isNaN(
                                    index
                                )
                            ) {

                                await interaction.reply({

                                    content:
                                        "❌ Nhóm không hợp lệ.",

                                    ephemeral:
                                        true
                                });

                                return;
                            }

                            const group =
                                getGroupByIndex(
                                    groups,
                                    index
                                );

                            if (!group) {

                                await interaction.reply({

                                    content:
                                        "❌ Không tìm thấy nhóm.",

                                    ephemeral:
                                        true
                                });

                                return;
                            }

                            const result =
                                createCommandPage(
                                    group.name,
                                    group.commands,
                                    0
                                );

                            const pageButtons =
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
                                    pageButtons
                                ]
                            });

                            return;
                        }

                        // ==================================================
                        // TRANG TRƯỚC / SAU
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
                                customId.split(
                                    "_"
                                );

                            const action =
                                parts[1];

                            const groupIndex =
                                Number(
                                    parts[2]
                                );

                            const oldPage =
                                Number(
                                    parts[3]
                                );

                            let newPage =
                                oldPage;

                            // ==================================================
                            // TRANG TRƯỚC
                            // ==================================================

                            if (
                                action ===
                                "prev"
                            ) {

                                newPage--;
                            }

                            // ==================================================
                            // TRANG SAU
                            // ==================================================

                            if (
                                action ===
                                "next"
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

                                    ephemeral:
                                        true
                                });

                                return;
                            }

                            const result =
                                createCommandPage(
                                    group.name,
                                    group.commands,
                                    newPage
                                );

                            const pageButtons =
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
                                    pageButtons
                                ]
                            });

                            return;
                        }

                    } catch (error) {

                        console.error(
                            "❌ LỖI HELP BUTTON:"
                        );

                        console.error(
                            error
                        );

                        try {

                            if (
                                !interaction.replied &&
                                !interaction.deferred
                            ) {

                                await interaction.reply({

                                    content:
                                        "❌ Có lỗi khi sử dụng menu help.",

                                    ephemeral:
                                        true
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

            console.error(
                error
            );

            try {

                if (
                    !message.replied &&
                    !message.deferred
                ) {

                    await message.reply(
                        "❌ Có lỗi khi mở danh sách lệnh."
                    );
                }

            } catch {}
        }
    }
};
