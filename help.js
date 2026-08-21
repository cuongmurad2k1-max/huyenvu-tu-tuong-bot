const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// ======================================================
// CONFIG
// ======================================================

const PREFIX = ".";

// Số command hiển thị trên 1 trang của 1 nhóm
const COMMANDS_PER_PAGE = 20;

// ======================================================
// 14 NHÓM LỚN
// ======================================================

const GROUPS = [
    {
        id: "combat",
        name: "⚔️ CHIẾN ĐẤU",
        description: "Chiến đấu, đánh quái, tấn công",
        keywords: [
            "combat",
            "fight",
            "attack",
            "battle",
            "danh",
            "chien",
            "dau",
            "damage",
            "skill",
            "attack",
            "arena"
        ]
    },

    {
        id: "tutuong",
        name: "☯️ TỨ TƯỢNG",
        description: "Hệ thống Huyền Vũ Tứ Tượng",
        keywords: [
            "tutuong",
            "tứtượng",
            "tu_tuong",
            "hopthe",
            "hop_the",
            "nguhanh",
            "ngu_hanh",
            "amduong",
            "am_duong"
        ]
    },

    {
        id: "tuluyen",
        name: "🔥 TU LUYỆN",
        description: "Tu luyện, cảnh giới, linh lực, kinh nghiệm",
        keywords: [
            "tuluyen",
            "tu_luyen",
            "luyenthi",
            "luyen",
            "canhgioi",
            "canh_gioi",
            "linhluc",
            "linh_luc",
            "kinhnghiem",
            "kinh_nghiem",
            "exp",
            "level",
            "capdo",
            "cap_do"
        ]
    },

    {
        id: "thanthu",
        name: "🐉 THẦN THÚ",
        description: "Thần thú, thú cưỡi, tiến hóa",
        keywords: [
            "thanthu",
            "than_thu",
            "thầnthú",
            "thú",
            "thu",
            "pet",
            "thucuoi",
            "thu_cuoi",
            "tienhoa",
            "tien_hoa",
            "evolve"
        ]
    },

    {
        id: "nhanvat",
        name: "👤 NHÂN VẬT",
        description: "Thông tin và phát triển nhân vật",
        keywords: [
            "nhanvat",
            "nhan_vat",
            "profile",
            "me",
            "info",
            "thongtin",
            "thong_tin",
            "stats",
            "stat",
            "avatar",
            "rank",
            "level"
        ]
    },

    {
        id: "boss",
        name: "👹 BOSS RAID",
        description: "Boss, raid và phần thưởng boss",
        keywords: [
            "boss",
            "raid",
            "bossraid",
            "boss_raid",
            "worldboss",
            "world_boss",
            "bossfight",
            "boss_fight"
        ]
    },

    {
        id: "pvp",
        name: "🏆 PVP",
        description: "Đấu người chơi, đấu trường và xếp hạng",
        keywords: [
            "pvp",
            "pk",
            "arena",
            "duel",
            "dau",
            "rank",
            "ranking",
            "leaderboard",
            "top"
        ]
    },

    {
        id: "phoban",
        name: "🏯 PHÓ BẢN",
        description: "Phó bản, cửa ải và thử thách",
        keywords: [
            "phoban",
            "pho_ban",
            "dungeon",
            "instance",
            "phoban",
            "phó_bản",
            "man",
            "map",
            "cuaai",
            "cua_ai",
            "challenge"
        ]
    },

    {
        id: "item",
        name: "🎒 VẬT PHẨM",
        description: "Item, trang bị, túi đồ và sử dụng vật phẩm",
        keywords: [
            "item",
            "items",
            "vatpham",
            "vat_pham",
            "inventory",
            "inv",
            "tui",
            "bag",
            "shop",
            "equip",
            "trangbi",
            "trang_bi",
            "weapon",
            "armor",
            "useitem",
            "use_item"
        ]
    },

    {
        id: "kinhte",
        name: "💰 KINH TẾ",
        description: "Tiền, mua bán, cửa hàng và giao dịch",
        keywords: [
            "economy",
            "money",
            "coin",
            "gold",
            "tien",
            "xu",
            "ngoc",
            "shop",
            "mua",
            "ban",
            "sell",
            "buy",
            "trade",
            "giaodich",
            "giao_dich",
            "bank",
            "daily",
            "reward"
        ]
    },

    {
        id: "linhthu",
        name: "🦊 LINH THÚ",
        description: "Linh thú, triệu hồi và phát triển linh thú",
        keywords: [
            "linhthu",
            "linh_thu",
            "linhthú",
            "summon",
            "trieuhồi",
            "trieuhoi",
            "trieu_hoi",
            "pet",
            "thú"
        ]
    },

    {
        id: "banghoi",
        name: "🏰 BANG HỘI",
        description: "Bang hội, thành viên và hoạt động bang",
        keywords: [
            "bang",
            "banghoi",
            "bang_hoi",
            "guild",
            "clan",
            "member",
            "thanhvien",
            "thanh_vien",
            "party",
            "team"
        ]
    },

    {
        id: "he thong",
        name: "📖 HỆ THỐNG",
        description: "Thông tin, hướng dẫn và tiện ích",
        keywords: [
            "help",
            "menu",
            "info",
            "about",
            "data",
            "database",
            "db",
            "ping",
            "status",
            "uptime",
            "version",
            "guide",
            "huongdan",
            "huong_dan",
            "setting",
            "settings"
        ]
    },

    {
        id: "admin",
        name: "👑 QUẢN TRỊ",
        description: "Lệnh quản trị bot",
        keywords: [
            "admin",
            "reset",
            "resetdata",
            "resetall",
            "reload",
            "load",
            "debug",
            "ban",
            "unban",
            "kick",
            "mute",
            "unmute",
            "give",
            "set",
            "delete",
            "remove"
        ]
    },

    {
        id: "khac",
        name: "🔧 KHÁC",
        description: "Các lệnh chưa thuộc nhóm cụ thể",
        keywords: []
    }
];

// ======================================================
// HÀM LẤY TÊN COMMAND
// ======================================================

function getCommandName(command) {

    if (!command) {
        return null;
    }

    if (
        typeof command.name === "string" &&
        command.name.trim()
    ) {
        return command.name.trim();
    }

    if (
        command.data &&
        typeof command.data.name === "string" &&
        command.data.name.trim()
    ) {
        return command.data.name.trim();
    }

    if (
        typeof command.command === "string" &&
        command.command.trim()
    ) {
        return command.command.trim();
    }

    return null;
}

// ======================================================
// LẤY DESCRIPTION
// ======================================================

function getCommandDescription(command) {

    if (!command) {
        return "Không có mô tả";
    }

    if (
        typeof command.description === "string" &&
        command.description.trim()
    ) {
        return command.description.trim();
    }

    if (
        command.data &&
        typeof command.data.description === "string" &&
        command.data.description.trim()
    ) {
        return command.data.description.trim();
    }

    return "Không có mô tả";
}

// ======================================================
// CHUẨN HÓA CHUỖI
// ======================================================

function normalize(text) {

    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9_]/g, "");
}

// ======================================================
// XÁC ĐỊNH NHÓM COMMAND
// ======================================================

function getGroup(command) {

    const name = getCommandName(command);

    const file =
        command?.file ||
        "";

    const source =
        normalize(
            `${name || ""} ${file || ""}`
        );

    // ==================================================
    // KIỂM TRA TỪNG NHÓM
    // ==================================================

    for (
        let i = 0;
        i < GROUPS.length - 1;
        i++
    ) {

        const group = GROUPS[i];

        for (
            const keyword of group.keywords
        ) {

            const key =
                normalize(keyword);

            if (!key) {
                continue;
            }

            if (
                source.includes(key)
            ) {
                return group;
            }
        }
    }

    // Không khớp -> KHÁC
    return GROUPS[GROUPS.length - 1];
}

// ======================================================
// TẠO DANH SÁCH 14 NHÓM
// ======================================================

function buildGroups(commands) {

    const result = new Map();

    for (const group of GROUPS) {

        result.set(
            group.id,
            {
                ...group,
                commands: []
            }
        );
    }

    // ==================================================
    // ĐƯA TỪNG COMMAND VÀO NHÓM
    // ==================================================

    for (
        const [name, command]
        of commands
    ) {

        const group =
            getGroup(command);

        result
            .get(group.id)
            .commands
            .push({
                name:
                    String(
                        name ||
                        getCommandName(command) ||
                        "unknown"
                    ).toLowerCase(),

                description:
                    getCommandDescription(
                        command
                    ),

                file:
                    command.file ||
                    ""
            });
    }

    // ==================================================
    // SẮP XẾP ABC
    // ==================================================

    for (
        const group of result.values()
    ) {

        group.commands.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );
    }

    return [
        ...result.values()
    ];
}

// ======================================================
// TẠO EMBED CHO TRANG NHÓM
// ======================================================

function createGroupEmbed(
    group,
    groupIndex,
    totalGroups,
    page,
    totalPages,
    totalCommands
) {

    const start =
        page *
        COMMANDS_PER_PAGE;

    const end =
        start +
        COMMANDS_PER_PAGE;

    const commands =
        group.commands.slice(
            start,
            end
        );

    // ==================================================
    // NỘI DUNG COMMAND
    // ==================================================

    let description = "";

    if (commands.length === 0) {

        description =
            "❌ Nhóm này hiện chưa có command.";

    } else {

        for (
            const command
            of commands
        ) {

            description +=
                `\`${PREFIX}${command.name}\``;

            description +=
                ` — ${command.description}`;

            description += "\n";
        }
    }

    // ==================================================
    // EMBED
    // ==================================================

    const embed =
        new EmbedBuilder()
            .setTitle(
                `${group.name}`
            )
            .setDescription(
                description
            )
            .addFields(
                {
                    name: "📌 Mô tả nhóm",
                    value:
                        group.description ||
                        "Không có mô tả"
                }
            )
            .setFooter({
                text:
                    `Nhóm ${groupIndex + 1}/${totalGroups} • ` +
                    `Trang ${page + 1}/${totalPages} • ` +
                    `Tổng ${totalCommands} lệnh`
            })
            .setTimestamp();

    return embed;
}

// ======================================================
// TẠO NÚT ĐIỀU KHIỂN
// ======================================================

function createButtons(
    groupIndex,
    page,
    totalPages
) {

    const row =
        new ActionRowBuilder();

    // ==================================================
    // NHÓM TRƯỚC
    // ==================================================

    row.addComponents(

        new ButtonBuilder()
            .setCustomId(
                "help_group_prev"
            )
            .setLabel(
                "◀ Nhóm trước"
            )
            .setStyle(
                ButtonStyle.Secondary
            )
            .setDisabled(
                groupIndex <= 0
            )
    );

    // ==================================================
    // TRANG TRƯỚC
    // ==================================================

    row.addComponents(

        new ButtonBuilder()
            .setCustomId(
                "help_page_prev"
            )
            .setLabel(
                "◀ Trang"
            )
            .setStyle(
                ButtonStyle.Primary
            )
            .setDisabled(
                page <= 0
            )
    );

    // ==================================================
    // HIỂN THỊ TRANG
    // ==================================================

    row.addComponents(

        new ButtonBuilder()
            .setCustomId(
                "help_current"
            )
            .setLabel(
                `${page + 1}/${totalPages}`
            )
            .setStyle(
                ButtonStyle.Secondary
            )
            .setDisabled(
                true
            )
    );

    // ==================================================
    // TRANG SAU
    // ==================================================

    row.addComponents(

        new ButtonBuilder()
            .setCustomId(
                "help_page_next"
            )
            .setLabel(
                "Trang ▶"
            )
            .setStyle(
                ButtonStyle.Primary
            )
            .setDisabled(
                page >= totalPages - 1
            )
    );

    // ==================================================
    // NHÓM SAU
    // ==================================================

    row.addComponents(

        new ButtonBuilder()
            .setCustomId(
                "help_group_next"
            )
            .setLabel(
                "Nhóm ▶"
            )
            .setStyle(
                ButtonStyle.Secondary
            )
            .setDisabled(
                groupIndex >= 13
            )
    );

    return row;
}

// ======================================================
// HIỂN THỊ HELP
// ======================================================

async function showHelp(
    message,
    groupIndex = 0,
    page = 0
) {

    try {

        // ==================================================
        // LẤY COMMAND MAP TỪ INDEX.JS
        // ==================================================

        const commandMap =
            message.client.commands;

        // ==================================================
        // KIỂM TRA
        // ==================================================

        if (
            !commandMap ||
            typeof commandMap.values !== "function"
        ) {

            await message.reply(
                "❌ Không thể lấy danh sách command.\n" +
                "Hãy kiểm tra `index.js` đã gắn `client.commands` chưa."
            );

            return;
        }

        // ==================================================
        // KHÔNG CÓ COMMAND
        // ==================================================

        if (
            commandMap.size === 0
        ) {

            await message.reply(
                "❌ Không có command nào được tải."
            );

            return;
        }

        // ==================================================
        // TẠO 14 NHÓM
        // ==================================================

        const groups =
            buildGroups(
                commandMap
            );

        // ==================================================
        // ĐẢM BẢO GROUP INDEX HỢP LỆ
        // ==================================================

        if (
            groupIndex < 0
        ) {
            groupIndex = 0;
        }

        if (
            groupIndex >= groups.length
        ) {
            groupIndex =
                groups.length - 1;
        }

        const group =
            groups[groupIndex];

        // ==================================================
        // TỔNG PAGE
        // ==================================================

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    group.commands.length /
                    COMMANDS_PER_PAGE
                )
            );

        // ==================================================
        // ĐẢM BẢO PAGE HỢP LỆ
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
        // TẠO EMBED
        // ==================================================

        const embed =
            createGroupEmbed(
                group,
                groupIndex,
                groups.length,
                page,
                totalPages,
                commandMap.size
            );

        // ==================================================
        // NÚT
        // ==================================================

        const row =
            createButtons(
                groupIndex,
                page,
                totalPages
            );

        // ==================================================
        // GỬI
        // ==================================================

        const sent =
            await message.reply({
                embeds: [
                    embed
                ],
                components: [
                    row
                ]
            });

        // ==================================================
        // COLLECTOR
        // ==================================================

        const collector =
            sent.createMessageComponentCollector({
                time: 5 * 60 * 1000
            });

        // ==================================================
        // BUTTON CLICK
        // ==================================================

        collector.on(
            "collect",
            async interaction => {

                try {

                    // --------------------------------------
                    // CHỈ NGƯỜI GỌI LỆNH ĐƯỢC BẤM
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
                    // NHÓM TRƯỚC
                    // --------------------------------------

                    if (
                        interaction.customId ===
                        "help_group_prev"
                    ) {

                        groupIndex--;

                        if (
                            groupIndex < 0
                        ) {
                            groupIndex = 0;
                        }

                        page = 0;
                    }

                    // --------------------------------------
                    // NHÓM SAU
                    // --------------------------------------

                    else if (
                        interaction.customId ===
                        "help_group_next"
                    ) {

                        groupIndex++;

                        if (
                            groupIndex >=
                            groups.length
                        ) {

                            groupIndex =
                                groups.length - 1;
                        }

                        page = 0;
                    }

                    // --------------------------------------
                    // TRANG TRƯỚC
                    // --------------------------------------

                    else if (
                        interaction.customId ===
                        "help_page_prev"
                    ) {

                        page--;

                        if (
                            page < 0
                        ) {
                            page = 0;
                        }
                    }

                    // --------------------------------------
                    // TRANG SAU
                    // --------------------------------------

                    else if (
                        interaction.customId ===
                        "help_page_next"
                    ) {

                        page++;

                        const currentGroup =
                            groups[groupIndex];

                        const pages =
                            Math.max(
                                1,
                                Math.ceil(
                                    currentGroup.commands.length /
                                    COMMANDS_PER_PAGE
                                )
                            );

                        if (
                            page >= pages
                        ) {
                            page =
                                pages - 1;
                        }
                    }

                    // --------------------------------------
                    // TẠO LẠI
                    // --------------------------------------

                    const currentGroup =
                        groups[groupIndex];

                    const currentTotalPages =
                        Math.max(
                            1,
                            Math.ceil(
                                currentGroup.commands.length /
                                COMMANDS_PER_PAGE
                            )
                        );

                    const newEmbed =
                        createGroupEmbed(
                            currentGroup,
                            groupIndex,
                            groups.length,
                            page,
                            currentTotalPages,
                            commandMap.size
                        );

                    const newRow =
                        createButtons(
                            groupIndex,
                            page,
                            currentTotalPages
                        );

                    // --------------------------------------
                    // UPDATE
                    // --------------------------------------

                    await interaction.update({
                        embeds: [
                            newEmbed
                        ],
                        components: [
                            newRow
                        ]
                    });

                } catch (error) {

                    console.error(
                        "❌ Lỗi help button:"
                    );

                    console.error(
                        error.stack ||
                        error.message
                    );

                    try {

                        if (
                            !interaction.replied &&
                            !interaction.deferred
                        ) {

                            await interaction.reply({
                                content:
                                    "❌ Không thể chuyển trang.",
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

                    const disabledRow =
                        new ActionRowBuilder();

                    for (
                        const component
                        of row.components
                    ) {

                        disabledRow.addComponents(
                            ButtonBuilder.from(
                                component
                            ).setDisabled(true)
                        );
                    }

                    await sent.edit({
                        components: [
                            disabledRow
                        ]
                    });

                } catch {}
            }
        );

    } catch (error) {

        console.error(
            "❌ LỖI HELP:"
        );

        console.error(
            error.stack ||
            error.message
        );

        try {

            await message.reply(
                "❌ Có lỗi xảy ra khi mở danh sách command."
            );

        } catch {}
    }
}

// ======================================================
// EXPORT COMMAND
// ======================================================

module.exports = {

    name: "help",

    description:
        "Hiển thị toàn bộ command theo 14 nhóm lớn",

    async execute(
        message,
        args = []
    ) {

        // ==================================================
        // LẤY NHÓM TỪ ARG
        // ==================================================

        let groupIndex = 0;

        let page = 0;

        // ==================================================
        // .help 2
        // ==================================================

        if (
            args[0] &&
            /^\d+$/.test(
                args[0]
            )
        ) {

            const number =
                parseInt(
                    args[0],
                    10
                );

            if (
                number >= 1 &&
                number <= 14
            ) {

                groupIndex =
                    number - 1;
            }
        }

        // ==================================================
        // .help 2 3
        // ==================================================

        if (
            args[1] &&
            /^\d+$/.test(
                args[1]
            )
        ) {

            page =
                Math.max(
                    0,
                    parseInt(
                        args[1],
                        10
                    ) - 1
                );
        }

        // ==================================================
        // HIỂN THỊ
        // ==================================================

        await showHelp(
            message,
            groupIndex,
            page
        );
    }
};
