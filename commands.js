const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const db = require("./database");
const fs = require("fs");
const path = require("path");

// =====================================================
// 🐢 HUYỀN VŨ – TỨ TƯỢNG ULTRA
// commands.js
// =====================================================

function loadJson(fileName, fallback = []) {
    try {
        const file = path.join(__dirname, fileName);

        if (!fs.existsSync(file)) {
            return fallback;
        }

        const raw = fs.readFileSync(file, "utf8");
        return JSON.parse(raw);
    } catch (error) {
        console.warn(`⚠️ Không thể đọc ${fileName}:`, error.message);
        return fallback;
    }
}

const factions = loadJson("factions.json", []);
const items = loadJson("items.json", []);
const quests = loadJson("quests.json", []);
const bossesData = loadJson("bosses.json", []);
const worldBosses = loadJson("world_bosses.json", []);
const dungeons = loadJson("dungeons.json", []);
const regions = loadJson("regions.json", []);
const skills = loadJson("skills.json", []);
const titles = loadJson("titles.json", []);
const worldItems = loadJson("world_items.json", []);
const story = loadJson("story.json", []);
const recipes = loadJson("recipes.json", []);
const beasts = loadJson("beasts.json", []);

// =====================================================
// 🔧 HELPER
// =====================================================

function getPlayer(userId) {
    return db.getPlayer(userId);
}

function ensurePlayer(interaction) {
    let player = getPlayer(interaction.user.id);

    if (!player) {
        player = db.createPlayer(
            interaction.user.id,
            interaction.user.username
        );
    }

    return player;
}

function number(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function format(value) {
    return number(value).toLocaleString("vi-VN");
}

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function nameOf(value, fallback = "Không rõ") {
    if (typeof value === "string") return value;

    if (value && typeof value === "object") {
        return (
            value.name ||
            value.ten ||
            value.title ||
            value.id ||
            fallback
        );
    }

    return fallback;
}

function itemId(value) {
    if (typeof value === "string") return value;

    if (value && typeof value === "object") {
        return value.id || value.name || value.ten || null;
    }

    return null;
}

function itemList(player, type) {
    if (!player.tuiDo) return [];

    if (!Array.isArray(player.tuiDo[type])) {
        return [];
    }

    return player.tuiDo[type];
}

function getFactionById(id) {
    return factions.find(
        faction =>
            String(faction.id) === String(id)
    );
}

function getFactionByPlayer(player) {
    if (!player || !player.faction) return null;

    return factions.find(
        faction =>
            faction.name === player.faction ||
            faction.id === player.faction
    ) || null;
}

function realmText(player) {
    const realm =
        player?.canhGioi ||
        player?.realm ||
        "Khởi Nguyên";

    const tier =
        Math.max(
            1,
            Math.min(
                12,
                Math.floor(
                    number(
                        player?.tang,
                        1
                    )
                )
            )
        );

    return `${realm} — Tầng ${tier}`;
}

function combatPower(player) {
    if (!player) return 0;

    const attack =
        number(player.attack, number(player.cong, 0));

    const defense =
        number(player.defense, number(player.thu, 0));

    const speed =
        number(player.speed, 0);

    const hp =
        number(player.maxHp, number(player.hp, 0));

    const linhLuc =
        number(player.linhLuc, 0);

    return Math.floor(
        attack * 3 +
        defense * 2 +
        speed +
        hp / 2 +
        linhLuc
    );
}

function findDataById(list, id) {
    return safeArray(list).find(
        x =>
            String(
                x?.id ??
                x?.key ??
                x?.name ??
                x?.ten
            ).toLowerCase() ===
            String(id).toLowerCase()
    );
}

function displayList(list, limit = 10) {
    const array = safeArray(list).slice(0, limit);

    if (!array.length) {
        return "📭 Chưa có dữ liệu.";
    }

    return array.map((x, i) => {
        const name = nameOf(
            x,
            `Mục ${i + 1}`
        );

        const id =
            x?.id
                ? `\`${x.id}\``
                : "";

        return `${i + 1}. ${name} ${id}`;
    }).join("\n");
}

// =====================================================
// 🌟 /BATDAU
// =====================================================

const batdau = {
    data:
        new SlashCommandBuilder()
            .setName("batdau")
            .setDescription(
                "🌌 Bắt đầu hành trình Huyền Vũ Tứ Tượng"
            ),

    async execute(interaction) {
        let player =
            getPlayer(interaction.user.id);

        if (player) {
            const faction =
                getFactionByPlayer(player);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            "🐢 HUYỀN VŨ — NHÂN VẬT ĐÃ TỒN TẠI"
                        )
                        .setDescription(
                            [
                                `👤 **${interaction.user.username}**`,
                                "",
                                `🐾 Tứ Tượng: **${faction?.name || player.faction || "Chưa thức tỉnh"}**`,
                                `🩸 Huyết mạch: **${player.bloodline || "Chưa thức tỉnh"}**`,
                                `🌌 Cảnh giới: **${realmText(player)}**`,
                                `⚔️ Chiến lực: **${format(combatPower(player))}**`,
                                `❤️ HP: **${format(player.hp)}/${format(player.maxHp)}**`,
                                `💎 Tài nguyên: **${format(player.linhThach)}**`
                            ].join("\n")
                        )
                        .setColor(0x3498db)
                ],
                ephemeral: true
            });
        }

        player =
            db.createPlayer(
                interaction.user.id,
                interaction.user.username
            );

        const available =
            safeArray(factions).slice(0, 4);

        if (!available.length) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            "🐢 HUYỀN VŨ — KHỞI ĐẦU"
                        )
                        .setDescription(
                            [
                                `👤 **${interaction.user.username}**`,
                                "",
                                "✅ Nhân vật đã được tạo.",
                                "",
                                "⚠️ Chưa tìm thấy factions.json để tạo menu Tứ Tượng.",
                                "",
                                "📌 Hãy kiểm tra file factions.json."
                            ].join("\n")
                        )
                        .setColor(0x2ecc71)
                ],
                ephemeral: true
            });
        }

        const row =
            new ActionRowBuilder();

        for (const faction of available) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `faction:${interaction.user.id}:${faction.id}`
                    )
                    .setLabel(
                        String(
                            faction.name ||
                            faction.ten ||
                            faction.id
                        ).slice(0, 80)
                    )
                    .setStyle(ButtonStyle.Primary)
            );
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🌌 THỨC TỈNH HUYỀN VŨ TỨ TƯỢNG"
                    )
                    .setDescription(
                        [
                            `👤 **${interaction.user.username}**`,
                            "",
                            "Chọn một trong Tứ Tượng để thức tỉnh:",
                            "",
                            available.map(
                                faction =>
                                    `🐾 **${faction.name || faction.ten || faction.id}**`
                            ).join("\n"),
                            "",
                            "⚠️ Lựa chọn này sẽ ghi vào nhân vật."
                        ].join("\n")
                    )
                    .setColor(0x5865f2)
            ],
            components: [row],
            ephemeral: true
        });
    }
};

// =====================================================
// 📊 /TRANGTHAI
// =====================================================

const trangthai = {
    data:
        new SlashCommandBuilder()
            .setName("trangthai")
            .setDescription(
                "📊 Xem toàn bộ trạng thái nhân vật"
            ),

    async execute(interaction) {
        const player =
            getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const faction =
            getFactionByPlayer(player);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        `🐢 ${interaction.user.username} — TRẠNG THÁI`
                    )
                    .setDescription(
                        [
                            `🐾 **Tứ Tượng:** ${faction?.name || player.faction || "Chưa thức tỉnh"}`,
                            `🩸 **Huyết mạch:** ${player.bloodline || "Chưa thức tỉnh"}`,
                            `🌌 **Cảnh giới:** ${realmText(player)}`,
                            "",
                            `❤️ **HP:** ${format(player.hp)} / ${format(player.maxHp)}`,
                            `⚔️ **Công:** ${format(player.attack ?? player.cong)}`,
                            `🛡️ **Thủ:** ${format(player.defense ?? player.thu)}`,
                            `💨 **Tốc:** ${format(player.speed)}`,
                            `🔥 **Linh lực:** ${format(player.linhLuc)}`,
                            `💎 **Linh thạch:** ${format(player.linhThach)}`,
                            `✨ **Kinh nghiệm:** ${format(player.kinhNghiem)}`,
                            "",
                            `⚔️ **CHIẾN LỰC:** ${format(combatPower(player))}`
                        ].join("\n")
                    )
                    .setColor(0x3498db)
            ]
        });
    }
};

// =====================================================
// ⚔️ /TUVI
// =====================================================

const tuvi = {
    data:
        new SlashCommandBuilder()
            .setName("tuvi")
            .setDescription(
                "📊 Xem thông tin nhân vật"
            ),

    async execute(interaction) {
        return trangthai.execute(interaction);
    }
};

// =====================================================
// 🔥 /TUYENLUYEN
// =====================================================

const tuyenluyen = {
    data:
        new SlashCommandBuilder()
            .setName("tuyenluyen")
            .setDescription(
                "🔥 Tu luyện để tăng linh lực và kinh nghiệm"
            ),

    async execute(interaction) {
        const player =
            ensurePlayer(interaction);

        const now =
            Date.now();

        const cooldown =
            15 * 1000;

        const remaining =
            cooldown -
            (
                now -
                number(player.lastTrain)
            );

        if (remaining > 0) {
            return interaction.reply({
                content:
                    `⏳ Hãy chờ **${Math.ceil(remaining / 1000)} giây**.`,
                ephemeral: true
            });
        }

        const linhLuc =
            Math.floor(
                Math.random() * 31
            ) + 20;

        const exp =
            Math.floor(
                Math.random() * 21
            ) + 10;

        db.updatePlayer(
            interaction.user.id,
            {
                linhLuc:
                    number(player.linhLuc) +
                    linhLuc,

                kinhNghiem:
                    number(player.kinhNghiem) +
                    exp,

                lastTrain:
                    now
            }
        );

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🔥 TU LUYỆN THÀNH CÔNG"
                    )
                    .setDescription(
                        [
                            `👤 **${interaction.user.username}** vận chuyển linh lực trong cơ thể.`,
                            "",
                            `🔥 Linh lực: **+${format(linhLuc)}**`,
                            `✨ Kinh nghiệm: **+${format(exp)}**`,
                            "",
                            "⏱️ Cooldown: **15 giây**"
                        ].join("\n")
                    )
                    .setColor(0xe67e22)
            ]
        });
    }
};

// =====================================================
// 🔥 /TULUYEN
// =====================================================

const tuluyen = {
    data:
        new SlashCommandBuilder()
            .setName("tuluyen")
            .setDescription(
                "🔥 Tu luyện để tăng linh lực và kinh nghiệm"
            ),

    async execute(interaction) {
        return tuyenluyen.execute(interaction);
    }
};

// =====================================================
// 🎒 /KHO
// =====================================================

const kho = {
    data:
        new SlashCommandBuilder()
            .setName("kho")
            .setDescription(
                "🎒 Xem kho đồ"
            ),

    async execute(interaction) {
        const player =
            getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const dan =
            itemList(player, "danDuoc");

        const vatPham =
            itemList(player, "vatPham");

        const linhThu =
            itemList(player, "linhThu");

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🎒 KHO ĐỒ HUYỀN VŨ"
                    )
                    .setDescription(
                        [
                            `💊 **Đan dược:** ${dan.length}`,
                            `📦 **Vật phẩm:** ${vatPham.length}`,
                            `🐾 **Linh thú:** ${linhThu.length}`,
                            "",
                            "━━━━━━━━━━━━━━━━",
                            "",
                            `💊 ${dan.length ? dan.slice(0, 10).map(nameOf).join("\n") : "Trống"}`,
                            "",
                            `📦 ${vatPham.length ? vatPham.slice(0, 10).map(nameOf).join("\n") : "Trống"}`,
                            "",
                            `🐾 ${linhThu.length ? linhThu.slice(0, 10).map(nameOf).join("\n") : "Trống"}`
                        ].join("\n")
                    )
                    .setColor(0x95a5a6)
            ],
            ephemeral: true
        });
    }
};

// =====================================================
// 🎒 /KHODO
// =====================================================

const kho_do = {
    data:
        new SlashCommandBuilder()
            .setName("khodo")
            .setDescription(
                "🎒 Xem kho đồ"
            ),

    async execute(interaction) {
        return kho.execute(interaction);
    }
};

// =====================================================
// 🏪 /SHOP
// =====================================================

const shop = {
    data:
        new SlashCommandBuilder()
            .setName("shop")
            .setDescription(
                "🏪 Xem dữ liệu cửa hàng"
            )
            .addIntegerOption(
                option =>
                    option
                        .setName("trang")
                        .setDescription(
                            "Trang cửa hàng"
                        )
                        .setMinValue(1)
                        .setRequired(false)
            ),

    async execute(interaction) {
        const page =
            interaction.options.getInteger(
                "trang"
            ) || 1;

        const source =
            safeArray(items);

        const pageSize = 10;

        const start =
            (page - 1) *
            pageSize;

        const list =
            source.slice(
                start,
                start + pageSize
            );

        if (!list.length) {
            return interaction.reply({
                content:
                    "❌ Không có dữ liệu ở trang này.",
                ephemeral: true
            });
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        `🏪 CỬA HÀNG HUYỀN VŨ — TRANG ${page}`
                    )
                    .setDescription(
                        list.map(
                            (item, index) => {
                                const name =
                                    nameOf(
                                        item,
                                        `Vật phẩm ${start + index + 1}`
                                    );

                                const id =
                                    item?.id ||
                                    `item_${start + index + 1}`;

                                const price =
                                    number(
                                        item?.price ??
                                        item?.cost ??
                                        item?.gia,
                                        0
                                    );

                                return [
                                    `**${start + index + 1}. ${name}**`,
                                    `🆔 \`${id}\``,
                                    `💎 Giá: **${format(price)}**`
                                ].join(" — ");
                            }
                        ).join("\n\n")
                    )
                    .setFooter({
                        text:
                            "Dùng /shop để xem dữ liệu cửa hàng"
                    })
                    .setColor(0xf1c40f)
            ]
        });
    }
};

// =====================================================
// 👹 /BOSS
// =====================================================

const boss = {
    data:
        new SlashCommandBuilder()
            .setName("boss")
            .setDescription(
                "👹 Xem và khiêu chiến Boss"
            ),

    async execute(interaction) {
        const player =
            getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const list =
            safeArray(bossesData).length
                ? bossesData
                : worldBosses;

        if (!list.length) {
            return interaction.reply({
                content:
                    "📭 Chưa có dữ liệu Boss.",
                ephemeral: true
            });
        }

        const shown =
            list.slice(0, 15);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "👹 HỆ THỐNG BOSS"
                    )
                    .setDescription(
                        shown.map(
                            (b, i) =>
                                `${i + 1}. **${nameOf(b)}** — ❤️ ${format(b.hp ?? b.maxHp ?? 0)} HP`
                        ).join("\n")
                    )
                    .setFooter({
                        text:
                            "Dữ liệu Boss từ bosses.json/world_bosses.json"
                    })
                    .setColor(0xc0392b)
            ]
        });
    }
};

// =====================================================
// 🏰 /PHOBAN
// =====================================================

const phoban = {
    data:
        new SlashCommandBuilder()
            .setName("phoban")
            .setDescription(
                "🏰 Xem các phó bản"
            ),

    async execute(interaction) {
        const player =
            getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        if (!dungeons.length) {
            return interaction.reply({
                content:
                    "📭 Chưa có dữ liệu phó bản.",
                ephemeral: true
            });
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🏰 PHÓ BẢN HUYỀN VŨ"
                    )
                    .setDescription(
                        dungeons.slice(0, 20).map(
                            (d, i) =>
                                `${i + 1}. **${nameOf(d)}**`
                        ).join("\n")
                    )
                    .setColor(0x8e44ad)
            ]
        });
    }
};

// =====================================================
// 📜 /NHIEMVU
// =====================================================

const nhiemvu = {
    data:
        new SlashCommandBuilder()
            .setName("nhiemvu")
            .setDescription(
                "📜 Xem nhiệm vụ"
            ),

    async execute(interaction) {
        const player =
            getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        if (!quests.length) {
            return interaction.reply({
                content:
                    "📭 Chưa có dữ liệu nhiệm vụ.",
                ephemeral: true
            });
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "📜 NHIỆM VỤ HUYỀN VŨ"
                    )
                    .setDescription(
                        quests.slice(0, 20).map(
                            (q, i) =>
                                `${i + 1}. **${nameOf(q)}**`
                        ).join("\n")
                    )
                    .setColor(0x2ecc71)
            ]
        });
    }
};

// =====================================================
// 🌍 /THEGIOI
// =====================================================

const thegioi = {
    data:
        new SlashCommandBuilder()
            .setName("thegioi")
            .setDescription(
                "🌍 Xem thế giới Huyền Vũ"
            ),

    async execute(interaction) {
        const sections = [];

        if (regions.length) {
            sections.push(
                `🗺️ **Khu vực:** ${regions.length}`
            );
        }

        if (beasts.length) {
            sections.push(
                `🐾 **Thần thú / dị thú:** ${beasts.length}`
            );
        }

        if (worldBosses.length) {
            sections.push(
                `👹 **World Boss:** ${worldBosses.length}`
            );
        }

        if (worldItems.length) {
            sections.push(
                `💎 **World Items:** ${worldItems.length}`
            );
        }

        if (story.length) {
            sections.push(
                `📖 **Nội dung cốt truyện:** ${story.length}`
            );
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🌍 HUYỀN VŨ — THẾ GIỚI"
                    )
                    .setDescription(
                        sections.length
                            ? sections.join("\n")
                            : "📭 Chưa có dữ liệu thế giới."
                    )
                    .setColor(0x1abc9c)
            ]
        });
    }
};

// =====================================================
// 🗺️ /KHUVUC
// =====================================================

const khuvuc = {
    data:
        new SlashCommandBuilder()
            .setName("khuvuc")
            .setDescription(
                "🗺️ Xem danh sách khu vực"
            ),

    async execute(interaction) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🗺️ CÁC KHU VỰC"
                    )
                    .setDescription(
                        displayList(
                            regions,
                            25
                        )
                    )
                    .setColor(0x16a085)
            ]
        });
    }
};

// =====================================================
// 📖 /COTTRUYEN
// =====================================================

const cottruyen = {
    data:
        new SlashCommandBuilder()
            .setName("cottruyen")
            .setDescription(
                "📖 Xem cốt truyện"
            ),

    async execute(interaction) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "📖 HUYỀN VŨ — CỐT TRUYỆN"
                    )
                    .setDescription(
                        displayList(
                            story,
                            20
                        )
                    )
                    .setColor(0x34495e)
            ]
        });
    }
};

// =====================================================
// 🐾 /LINHTHU
// =====================================================

const linhthu = {
    data:
        new SlashCommandBuilder()
            .setName("linhthu")
            .setDescription(
                "🐾 Xem danh sách linh thú"
            ),

    async execute(interaction) {
        const player =
            getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🐾 LINH THÚ / THẦN THÚ"
                    )
                    .setDescription(
                        displayList(
                            beasts,
                            25
                        )
                    )
                    .setColor(0x27ae60)
            ]
        });
    }
};

// =====================================================
// ⚔️ /KYNANG
// =====================================================

const kynang = {
    data:
        new SlashCommandBuilder()
            .setName("kynang")
            .setDescription(
                "⚔️ Xem kỹ năng"
            ),

    async execute(interaction) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "⚔️ HỆ THỐNG KỸ NĂNG"
                    )
                    .setDescription(
                        displayList(
                            skills,
                            25
                        )
                    )
                    .setColor(0xe74c3c)
            ]
        });
    }
};

// =====================================================
// 🍳 /CHEBIEN
// =====================================================

const chebien = {
    data:
        new SlashCommandBuilder()
            .setName("chebien")
            .setDescription(
                "🍳 Xem công thức chế tạo"
            ),

    async execute(interaction) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🍳 CÔNG THỨC"
                    )
                    .setDescription(
                        displayList(
                            recipes,
                            25
                        )
                    )
                    .setColor(0xe67e22)
            ]
        });
    }
};

// =====================================================
// 🏆 /DANHHIEU
// =====================================================

const danhHieu = {
    data:
        new SlashCommandBuilder()
            .setName("danhhieu")
            .setDescription(
                "🏆 Xem danh hiệu"
            ),

    async execute(interaction) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🏆 DANH HIỆU"
                    )
                    .setDescription(
                        displayList(
                            titles,
                            25
                        )
                    )
                    .setColor(0xf1c40f)
            ]
        });
    }
};

// =====================================================
// 🏆 /TOP
// =====================================================

const top = {
    data:
        new SlashCommandBuilder()
            .setName("top")
            .setDescription(
                "🏆 Bảng xếp hạng chiến lực"
            ),

    async execute(interaction) {
        const players =
            safeArray(
                db.getAllPlayers()
            );

        players.sort(
            (a, b) =>
                combatPower(b) -
                combatPower(a)
        );

        const list =
            players.slice(0, 10);

        if (!list.length) {
            return interaction.reply({
                content:
                    "📭 Chưa có người chơi.",
                ephemeral: true
            });
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🏆 TOP CHIẾN LỰC HUYỀN VŨ"
                    )
                    .setDescription(
                        list.map(
                            (p, i) =>
                                `**${i + 1}.** ${p.username || p.id} — ⚔️ **${format(combatPower(p))}**`
                        ).join("\n")
                    )
                    .setColor(0xf1c40f)
            ]
        });
    }
};

// =====================================================
// 🆘 /HELP
// =====================================================

const help = {
    data:
        new SlashCommandBuilder()
            .setName("help")
            .setDescription(
                "🆘 Danh sách lệnh Huyền Vũ"
            ),

    async execute(interaction) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🐢 HUYỀN VŨ — DANH SÁCH LỆNH"
                    )
                    .setDescription(
                        [
                            "🌟 **NHÂN VẬT**",
                            "`/batdau` — Bắt đầu / thức tỉnh Tứ Tượng",
                            "`/trangthai` — Xem trạng thái",
                            "`/tuvi` — Xem thông tin nhân vật",
                            "`/kho` — Xem kho đồ",
                            "`/khodo` — Xem kho đồ",
                            "",
                            "🔥 **PHÁT TRIỂN**",
                            "`/tuluyen` — Tu luyện",
                            "`/tuyenluyen` — Tu luyện",
                            "`/kynang` — Xem kỹ năng",
                            "`/linhthu` — Xem linh thú",
                            "",
                            "⚔️ **CHIẾN ĐẤU / THẾ GIỚI**",
                            "`/boss` — Xem Boss",
                            "`/phoban` — Xem phó bản",
                            "`/nhiemvu` — Xem nhiệm vụ",
                            "`/thegioi` — Tổng quan thế giới",
                            "`/khuvuc` — Xem khu vực",
                            "",
                            "📖 **NỘI DUNG**",
                            "`/cottruyen` — Cốt truyện",
                            "`/danhhieu` — Danh hiệu",
                            "`/chebien` — Công thức",
                            "",
                            "🏪 **KINH TẾ**",
                            "`/shop` — Xem cửa hàng",
                            "",
                            "🏆 **XẾP HẠNG**",
                            "`/top` — Top chiến lực",
                            "",
                            "🛡️ **QUẢN TRỊ**",
                            "`/admin` — Admin Panel"
                        ].join("\n")
                    )
                    .setFooter({
                        text:
                            "HUYỀN VŨ — TỨ TƯỢNG ULTRA"
                    })
                    .setColor(0x5865f2)
            ],
            ephemeral: true
        });
    }
};

// =====================================================
// 🛡️ /ADMIN
// =====================================================

const admin = {
    data:
        new SlashCommandBuilder()
            .setName("admin")
            .setDescription(
                "🛡️ Bảng điều khiển quản trị"
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

    async execute(interaction) {
        if (
            !interaction.member?.permissions?.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền sử dụng Admin Panel.",
                ephemeral: true
            });
        }

        const allPlayers =
            db.getAllPlayers();

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🛡️ HUYỀN VŨ — ADMIN PANEL"
                    )
                    .setDescription(
                        [
                            `👥 Người chơi: **${allPlayers.length}**`,
                            `📦 Items: **${items.length}**`,
                            `👹 Boss: **${bossesData.length}**`,
                            `🏰 Phó bản: **${dungeons.length}**`,
                            "",
                            "⚠️ Admin Panel nâng cao sẽ được nối với các chức năng quản trị riêng khi các module admin được đưa vào repo."
                        ].join("\n")
                    )
                    .setColor(0x8e44ad)
            ],
            ephemeral: true
        });
    }
};

// =====================================================
// 📦 EXPORT
// =====================================================

const commands = [
    batdau,
    trangthai,
    tuvi,
    tuluyen,
    tuyenluyen,
    kho,
    kho_do,
    shop,
    boss,
    phoban,
    nhiemvu,
    thegioi,
    khuvuc,
    cottruyen,
    linhthu,
    kynang,
    chebien,
    danhHieu,
    top,
    help,
    admin
];

// =====================================================
// 🔎 KIỂM TRA TRÙNG COMMAND
// =====================================================

const seen = new Set();

for (const command of commands) {
    const name =
        command?.data?.name;

    if (!name) {
        throw new Error(
            "Command không có data.name."
        );
    }

    if (seen.has(name)) {
        throw new Error(
            `Trùng tên command: /${name}`
        );
    }

    seen.add(name);
}

console.log(
    `🐢 HUYỀN VŨ: đã chuẩn bị ${commands.length} slash commands.`
);

module.exports = commands;
