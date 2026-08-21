const {
    EmbedBuilder
} = require("discord.js");

module.exports = {

    name: "help",

    description:
        "Hiển thị toàn bộ danh sách lệnh",

    async execute(message, args) {

        try {

            const commandMap =
                message.client.commandMap;

            if (
                !commandMap ||
                commandMap.size === 0
            ) {

                await message.reply(
                    "❌ Không thể lấy danh sách command."
                );

                return;
            }

            // ==================================================
            // LẤY TOÀN BỘ COMMAND
            // ==================================================

            const commands =
                [...commandMap.values()]
                    .filter(command => {

                        return (
                            command &&
                            typeof command.name ===
                            "string"
                        );

                    });

            if (commands.length === 0) {

                await message.reply(
                    "❌ Không có command nào."
                );

                return;
            }

            // ==================================================
            // CHIA NHÓM THEO FILE
            // ==================================================

            const groups = new Map();

            for (const command of commands) {

                let fileName = "Khác";

                if (command.file) {

                    fileName =
                        command.file
                            .split("/")
                            .pop()
                            .replace(".js", "");

                }

                // ==================================================
                // ĐẶT TÊN NHÓM
                // ==================================================

                let groupName = "📦 KHÁC";

                if (
                    fileName
                        .toLowerCase()
                        .includes("combat")
                ) {

                    groupName =
                        "⚔️ CHIẾN ĐẤU";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("tutuong")
                ) {

                    groupName =
                        "🐉 TỨ TƯỢNG";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("thanthu")
                ) {

                    groupName =
                        "🦁 THẦN THÚ";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("nhanvat")
                ) {

                    groupName =
                        "👤 NHÂN VẬT";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("boss")
                ) {

                    groupName =
                        "👹 BOSS / RAID";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("pvp")
                ) {

                    groupName =
                        "⚔️ PVP";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("guild")
                ) {

                    groupName =
                        "🏰 GUILD";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("shop")
                ) {

                    groupName =
                        "🛒 CỬA HÀNG";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("item")
                ) {

                    groupName =
                        "🎒 VẬT PHẨM";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("economy")
                ) {

                    groupName =
                        "💰 KINH TẾ";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("admin")
                ) {

                    groupName =
                        "👑 ADMIN";

                } else if (
                    fileName
                        .toLowerCase()
                        .includes("help")
                ) {

                    groupName =
                        "📖 HỆ THỐNG";

                } else {

                    groupName =
                        `📦 ${fileName}`;
                }

                if (
                    !groups.has(groupName)
                ) {

                    groups.set(
                        groupName,
                        []
                    );
                }

                groups
                    .get(groupName)
                    .push(command);
            }

            // ==================================================
            // SẮP XẾP COMMAND
            // ==================================================

            for (
                const list of groups.values()
            ) {

                list.sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                );
            }

            // ==================================================
            // TỔNG SỐ
            // ==================================================

            const total =
                commands.length;

            // ==================================================
            // TẠO NỘI DUNG HELP
            // ==================================================

            let pages = [];

            let currentPage = "";

            const MAX_LENGTH = 3500;

            for (
                const [groupName, list]
                of groups
            ) {

                let text =
                    `\n${groupName}\n`;

                text +=
                    "────────────────────\n";

                for (
                    const command of list
                ) {

                    let description =
                        command.description ||
                        (
                            command.data &&
                            command.data.description
                        ) ||
                        "Không có mô tả";

                    description =
                        String(description)
                            .replace(/\n/g, " ")
                            .slice(0, 100);

                    const line =
                        `\`.${command.name}\` — ${description}\n`;

                    // Nếu vượt giới hạn
                    if (
                        currentPage.length +
                        text.length +
                        line.length >
                        MAX_LENGTH
                    ) {

                        if (
                            currentPage.length > 0
                        ) {

                            pages.push(
                                currentPage
                            );

                        }

                        currentPage =
                            text + line;

                        text = "";

                    } else {

                        currentPage +=
                            text + line;

                        text = "";
                    }
                }
            }

            if (
                currentPage.length > 0
            ) {

                pages.push(
                    currentPage
                );
            }

            // ==================================================
            // GỬI TỪNG TRANG
            // ==================================================

            for (
                let i = 0;
                i < pages.length;
                i++
            ) {

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            "📖 HUYỀN VŨ TỨ TƯỢNG — DANH SÁCH LỆNH"
                        )
                        .setDescription(
                            pages[i]
                        )
                        .setFooter({
                            text:
                                `Tổng ${total} lệnh • Trang ${i + 1}/${pages.length}`
                        })
                        .setTimestamp();

                await message.channel.send({
                    embeds: [embed]
                });
            }

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
