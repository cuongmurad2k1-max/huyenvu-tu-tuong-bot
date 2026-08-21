const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "help",

    description: "Hiển thị toàn bộ danh sách lệnh",

    async execute(message, args) {

        try {

            const commands =
                message.client.commands;

            if (!commands || commands.size === 0) {

                await message.reply(
                    "❌ Không có command nào được tải."
                );

                return;
            }

            // ==========================================
            // CHUYỂN COMMAND THÀNH ARRAY
            // ==========================================

            const list = [];

            for (const [name, command] of commands) {

                list.push({
                    name: name,
                    description:
                        command.description ||
                        command.data?.description ||
                        "Không có mô tả"
                });
            }

            // Sắp xếp A → Z
            list.sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            // ==========================================
            // CHIA NHÓM
            // ==========================================

            const groups = {

                "⚔️ COMBAT": [
                    "combat",
                    "attack",
                    "danh",
                    "chien",
                    "arena",
                    "pk"
                ],

                "🔮 TU TƯỞNG": [
                    "tutuong",
                    "tuong",
                    "tuluyen",
                    "tu-luyen"
                ],

                "👻 THẦN THÚ": [
                    "thanthu",
                    "linhthu"
                ],

                "👤 NHÂN VẬT": [
                    "nhanvat",
                    "nhanvat",
                    "profile",
                    "me"
                ],

                "👹 BOSS / RAID": [
                    "boss",
                    "bossraid",
                    "raid",
                    "dotpha"
                ],

                "🏆 PVP": [
                    "pvp",
                    "arena"
                ],

                "🏰 GUILD": [
                    "guild",
                    "bang"
                ],

                "💰 KINH TẾ": [
                    "shop",
                    "mua",
                    "ban",
                    "item",
                    "money",
                    "economy"
                ],

                "🎒 VẬT PHẨM": [
                    "item",
                    "inventory",
                    "tui",
                    "kho"
                ],

                "📖 HỆ THỐNG": [
                    "help",
                    "ping",
                    "data",
                    "database"
                ]
            };

            // ==========================================
            // TẠO DANH SÁCH NHÓM
            // ==========================================

            const used = new Set();

            const pages = [];

            let current = "";

            function addCommand(command) {

                const line =
                    `\`.${command.name}\` — ${command.description}\n`;

                // Discord Embed tối đa khoảng 6000 ký tự
                if (
                    current.length + line.length > 3500
                ) {

                    pages.push(current);

                    current = "";
                }

                current += line;
            }

            // ==========================================
            // NHÓM COMMAND
            // ==========================================

            for (
                const [groupName, keywords]
                of Object.entries(groups)
            ) {

                const groupCommands =
                    list.filter(command => {

                        if (
                            used.has(command.name)
                        ) {
                            return false;
                        }

                        const name =
                            command.name.toLowerCase();

                        return keywords.some(keyword =>
                            name.includes(
                                keyword.toLowerCase()
                            )
                        );
                    });

                if (
                    groupCommands.length === 0
                ) {
                    continue;
                }

                current +=
                    `\n${groupName}\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n`;

                for (
                    const command
                    of groupCommands
                ) {

                    used.add(command.name);

                    addCommand(command);
                }
            }

            // ==========================================
            // COMMAND CHƯA CÓ NHÓM
            // ==========================================

            const otherCommands =
                list.filter(command =>
                    !used.has(command.name)
                );

            if (otherCommands.length > 0) {

                current +=
                    `\n📚 KHÁC\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n`;

                for (
                    const command
                    of otherCommands
                ) {

                    addCommand(command);
                }
            }

            // ==========================================
            // THÊM TRANG CUỐI
            // ==========================================

            if (current.trim()) {

                pages.push(current);
            }

            // ==========================================
            // GỬI HELP
            // ==========================================

            if (pages.length === 0) {

                await message.reply(
                    "❌ Không tìm thấy command."
                );

                return;
            }

            let page = 0;

            async function sendPage() {

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            "📚 HUYỀN VŨ TỨ TƯỢNG — DANH SÁCH LỆNH"
                        )
                        .setDescription(
                            pages[page]
                        )
                        .setFooter({
                            text:
                                `Tổng ${list.length} lệnh • Trang ${page + 1}/${pages.length}`
                        })
                        .setTimestamp();

                const sent =
                    await message.channel.send({
                        embeds: [embed]
                    });

                // ======================================
                // NẾU CHỈ CÓ 1 TRANG
                // ======================================

                if (pages.length <= 1) {
                    return;
                }

                // ======================================
                // NÚT TRANG
                // ======================================

                await sent.react("⬅️");
                await sent.react("➡️");

                const filter =
                    (reaction, user) =>
                        ["⬅️", "➡️"].includes(
                            reaction.emoji.name
                        ) &&
                        user.id ===
                            message.author.id;

                const collector =
                    sent.createReactionCollector({
                        filter,
                        time: 5 * 60 * 1000
                    });

                collector.on(
                    "collect",
                    async reaction => {

                        if (
                            reaction.emoji.name ===
                            "➡️"
                        ) {

                            page++;

                            if (
                                page >= pages.length
                            ) {
                                page = 0;
                            }
                        }

                        if (
                            reaction.emoji.name ===
                            "⬅️"
                        ) {

                            page--;

                            if (page < 0) {
                                page =
                                    pages.length - 1;
                            }
                        }

                        const newEmbed =
                            new EmbedBuilder()
                                .setTitle(
                                    "📚 HUYỀN VŨ TỨ TƯỢNG — DANH SÁCH LỆNH"
                                )
                                .setDescription(
                                    pages[page]
                                )
                                .setFooter({
                                    text:
                                        `Tổng ${list.length} lệnh • Trang ${page + 1}/${pages.length}`
                                })
                                .setTimestamp();

                        await sent.edit({
                            embeds: [newEmbed]
                        });

                        await reaction.users.remove(
                            message.author.id
                        );
                    }
                );
            }

            await sendPage();

        } catch (error) {

            console.error(
                "❌ LỖI HELP:"
            );

            console.error(error);

            try {

                await message.reply(
                    "❌ Không thể lấy danh sách command."
                );

            } catch {}
        }
    }
};
