const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// ======================================================
// .HELP
// HIỂN THỊ TOÀN BỘ COMMAND ĐÃ LOAD
// ======================================================

module.exports = {

    name: "help",

    description: "📚 Hiển thị toàn bộ lệnh của bot",

    async execute(message, args) {

        try {

            // ==================================================
            // LẤY COMMAND MAP
            // ==================================================

            const commandMap = global.commandMap;

            if (!commandMap) {

                await message.reply(
                    "❌ Không tìm thấy hệ thống command."
                );

                return;
            }

            // ==================================================
            // LẤY DANH SÁCH COMMAND
            // ==================================================

            const commands = [];

            for (const [name, command] of commandMap.entries()) {

                if (!name) {
                    continue;
                }

                commands.push({
                    name: name.toString().toLowerCase(),
                    command: command
                });

            }

            // ==================================================
            // SORT A → Z
            // ==================================================

            commands.sort((a, b) =>
                a.name.localeCompare(
                    b.name,
                    "vi"
                )
            );

            // ==================================================
            // KHÔNG CÓ COMMAND
            // ==================================================

            if (commands.length === 0) {

                await message.reply(
                    "❌ Hiện chưa có command nào được load."
                );

                return;
            }

            // ==================================================
            // SỐ COMMAND
            // ==================================================

            const totalCommands =
                commands.length;

            // ==================================================
            // SỐ COMMAND MỖI TRANG
            // ==================================================

            const perPage = 25;

            const totalPages =
                Math.ceil(
                    totalCommands / perPage
                );

            // ==================================================
            // TẠO TRANG
            // ==================================================

            function createPage(page) {

                const start =
                    page * perPage;

                const end =
                    Math.min(
                        start + perPage,
                        totalCommands
                    );

                const current =
                    commands.slice(
                        start,
                        end
                    );

                // ----------------------------------------------
                // DANH SÁCH COMMAND
                // ----------------------------------------------

                let commandList = "";

                for (
                    let i = 0;
                    i < current.length;
                    i++
                ) {

                    const item =
                        current[i];

                    const command =
                        item.command;

                    let description =
                        "";

                    // ------------------------------------------
                    // description
                    // ------------------------------------------

                    if (
                        command &&
                        typeof command.description ===
                            "string"
                    ) {

                        description =
                            command.description;

                    }

                    // ------------------------------------------
                    // data.description
                    // ------------------------------------------

                    if (
                        !description &&
                        command &&
                        command.data &&
                        typeof command.data.description ===
                            "string"
                    ) {

                        description =
                            command.data.description;
                    }

                    // ------------------------------------------
                    // data.toJSON()
                    // ------------------------------------------

                    if (
                        !description &&
                        command &&
                        command.data &&
                        typeof command.data.toJSON ===
                            "function"
                    ) {

                        try {

                            const data =
                                command.data.toJSON();

                            if (
                                data &&
                                typeof data.description ===
                                    "string"
                            ) {

                                description =
                                    data.description;
                            }

                        } catch {}
                    }

                    // ------------------------------------------
                    // Nếu không có mô tả
                    // ------------------------------------------

                    if (!description) {

                        description =
                            "Không có mô tả";
                    }

                    // ------------------------------------------
                    // Giới hạn mô tả
                    // ------------------------------------------

                    if (
                        description.length > 80
                    ) {

                        description =
                            description.substring(
                                0,
                                77
                            ) + "...";
                    }

                    commandList +=
                        `\`${start + i + 1}.\` **.${item.name}** — ${description}\n`;
                }

                // ==================================================
                // EMBED
                // ==================================================

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            "📚 HỆ THỐNG LỆNH HUYỀN VŨ TỨ TƯỢNG"
                        )
                        .setDescription(
                            [
                                `⚔️ **Tổng số lệnh: ${totalCommands}**`,
                                "",
                                commandList
                            ].join("\n")
                        )
                        .setFooter({
                            text:
                                `Trang ${page + 1}/${totalPages} • Dùng .<lệnh> để sử dụng`
                        })
                        .setTimestamp();

                return embed;
            }

            // ==================================================
            // BUTTON
            // ==================================================

            function createButtons(page) {

                const first =
                    new ButtonBuilder()
                        .setCustomId(
                            "help_first"
                        )
                        .setEmoji("⏮️")
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                        .setDisabled(
                            page === 0
                        );

                const previous =
                    new ButtonBuilder()
                        .setCustomId(
                            "help_previous"
                        )
                        .setEmoji("◀️")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                        .setDisabled(
                            page === 0
                        );

                const pageButton =
                    new ButtonBuilder()
                        .setCustomId(
                            "help_page"
                        )
                        .setLabel(
                            `${page + 1}/${totalPages}`
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                        .setDisabled(true);

                const next =
                    new ButtonBuilder()
                        .setCustomId(
                            "help_next"
                        )
                        .setEmoji("▶️")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                        .setDisabled(
                            page >= totalPages - 1
                        );

                const last =
                    new ButtonBuilder()
                        .setCustomId(
                            "help_last"
                        )
                        .setEmoji("⏭️")
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                        .setDisabled(
                            page >= totalPages - 1
                        );

                return new ActionRowBuilder()
                    .addComponents(
                        first,
                        previous,
                        pageButton,
                        next,
                        last
                    );
            }

            // ==================================================
            // GỬI HELP
            // ==================================================

            let currentPage = 0;

            const helpMessage =
                await message.reply({

                    embeds: [
                        createPage(
                            currentPage
                        )
                    ],

                    components: [
                        createButtons(
                            currentPage
                        )
                    ]

                });

            // ==================================================
            // COLLECTOR
            // ==================================================

            const collector =
                helpMessage.createMessageComponentCollector({
                    time: 5 * 60 * 1000
                });

            // ==================================================
            // BUTTON CLICK
            // ==================================================

            collector.on(
                "collect",
                async (interaction) => {

                    try {

                        // --------------------------------------
                        // Chỉ người gọi .help
                        // --------------------------------------

                        if (
                            interaction.user.id !==
                            message.author.id
                        ) {

                            await interaction.reply({

                                content:
                                    "❌ Đây không phải bảng help của bạn.",

                                ephemeral: true

                            });

                            return;
                        }

                        // --------------------------------------
                        // FIRST
                        // --------------------------------------

                        if (
                            interaction.customId ===
                            "help_first"
                        ) {

                            currentPage = 0;
                        }

                        // --------------------------------------
                        // PREVIOUS
                        // --------------------------------------

                        else if (
                            interaction.customId ===
                            "help_previous"
                        ) {

                            currentPage--;

                            if (
                                currentPage < 0
                            ) {

                                currentPage = 0;
                            }
                        }

                        // --------------------------------------
                        // NEXT
                        // --------------------------------------

                        else if (
                            interaction.customId ===
                            "help_next"
                        ) {

                            currentPage++;

                            if (
                                currentPage >=
                                totalPages
                            ) {

                                currentPage =
                                    totalPages - 1;
                            }
                        }

                        // --------------------------------------
                        // LAST
                        // --------------------------------------

                        else if (
                            interaction.customId ===
                            "help_last"
                        ) {

                            currentPage =
                                totalPages - 1;
                        }

                        // --------------------------------------
                        // UPDATE
                        // --------------------------------------

                        await interaction.update({

                            embeds: [
                                createPage(
                                    currentPage
                                )
                            ],

                            components: [
                                createButtons(
                                    currentPage
                                )
                            ]

                        });

                    } catch (error) {

                        console.error(
                            "❌ Lỗi nút .help:"
                        );

                        console.error(error);

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

                        const disabledButtons =
                            new ActionRowBuilder()
                                .addComponents(

                                    new ButtonBuilder()
                                        .setCustomId(
                                            "help_first_end"
                                        )
                                        .setEmoji("⏮️")
                                        .setStyle(
                                            ButtonStyle.Secondary
                                        )
                                        .setDisabled(true),

                                    new ButtonBuilder()
                                        .setCustomId(
                                            "help_previous_end"
                                        )
                                        .setEmoji("◀️")
                                        .setStyle(
                                            ButtonStyle.Secondary
                                        )
                                        .setDisabled(true),

                                    new ButtonBuilder()
                                        .setCustomId(
                                            "help_page_end"
                                        )
                                        .setLabel(
                                            `${currentPage + 1}/${totalPages}`
                                        )
                                        .setStyle(
                                            ButtonStyle.Secondary
                                        )
                                        .setDisabled(true),

                                    new ButtonBuilder()
                                        .setCustomId(
                                            "help_next_end"
                                        )
                                        .setEmoji("▶️")
                                        .setStyle(
                                            ButtonStyle.Secondary
                                        )
                                        .setDisabled(true),

                                    new ButtonBuilder()
                                        .setCustomId(
                                            "help_last_end"
                                        )
                                        .setEmoji("⏭️")
                                        .setStyle(
                                            ButtonStyle.Secondary
                                        )
                                        .setDisabled(true)

                                );

                        await helpMessage.edit({

                            components: [
                                disabledButtons
                            ]

                        });

                    } catch {}

                }
            );

        } catch (error) {

            console.error(
                "❌ LỖI .help:"
            );

            console.error(error);

            try {

                await message.reply(
                    "❌ Không thể mở danh sách lệnh."
                );

            } catch {}

        }
    }
};
