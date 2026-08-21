// Auto-grouped command bundle. Contains 21 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- hop_the.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("hop_the").setDescription("Tứ Tượng hợp thể"),
  async execute(i) {
    const p=player(i); p.fourSymbols ||= {owned:[],resonance:0}; if((p.fourSymbols.owned||[]).length<4)return reply(i,"❌ Cần sở hữu đủ 4 Tượng."); p.fourSymbols.formation="Tứ Tượng Thần Trận"; p.attack=(p.attack||0)+100;p.defense=(p.defense||0)+100;p.maxHp=(p.maxHp||150)+500;save(i,p);return reply(i,"🌌 **Tứ Tượng Thần Trận** đã kích hoạt!");
  }
 };
})());
// --- hop_the_than_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('hop_the_than_thu').setDescription('Hợp thể với thần thú'),async execute(i){const p=player(i); p.fourSymbols=p.fourSymbols||{}; p.fourSymbols.formation='Hợp Thể Thần Thú'; p.attack=(p.attack||0)+120; p.defense=(p.defense||0)+120; p.speed=(p.speed||0)+20; save(i,p); return reply(i,'✅ Hợp thể với thần thú — tiến trình đã được lưu.');} };
})());
// --- kham_pha_bach_ho_thanh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('kham_pha_bach_ho_thanh').setDescription('Khám phá Bạch Hổ Thành'),async execute(i){const p=player(i); p.location='Bạch Hổ Thành'; p.stats=p.stats||{}; p.stats.explores=(p.stats.explores||0)+1; p.exp=(p.exp||0)+250; save(i,p); return reply(i,'✅ Khám phá Bạch Hổ Thành — tiến trình đã được lưu.');} };
})());
// --- kham_pha_huyen_vu_hai.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('kham_pha_huyen_vu_hai').setDescription('Khám phá Huyền Vũ Hải'),async execute(i){const p=player(i); p.location='Huyền Vũ Hải'; p.stats=p.stats||{}; p.stats.explores=(p.stats.explores||0)+1; p.exp=(p.exp||0)+350; save(i,p); return reply(i,'✅ Khám phá Huyền Vũ Hải — tiến trình đã được lưu.');} };
})());
// --- lien_ket_tuong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("lien_ket_tuong").setDescription("Liên kết Tượng"),
  async execute(i) {
    const p=player(i);p.fourSymbols ||= {owned:[],resonance:0};p.fourSymbols.linkLevel=(p.fourSymbols.linkLevel||0)+1;p.fourSymbols.resonance=(p.fourSymbols.resonance||0)+15;save(i,p);return reply(i,`🔗 Liên kết Tượng cấp ${p.fourSymbols.linkLevel}.`);
  }
 };
})());
// --- nang_resonance.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nang_resonance").setDescription("Nâng cộng hưởng"),
  async execute(i) {
    const p=player(i); p.fourSymbols ||= {owned:[],resonance:0}; p.fourSymbols.resonance=(p.fourSymbols.resonance||0)+10; p.attack=(p.attack||0)+5; p.defense=(p.defense||0)+5; save(i,p); return reply(i,`⚡ Resonance +10 = **${p.fourSymbols.resonance}**.`);
  }
 };
})());
// --- tang_resonance.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('tang_resonance').setDescription('Tăng cộng hưởng Tứ Tượng'),async execute(i){const p=player(i); p.fourSymbols=p.fourSymbols||{}; p.fourSymbols.resonance=Math.min(100,(p.fourSymbols.resonance||0)+10); save(i,p); return reply(i,'✅ Tăng cộng hưởng Tứ Tượng — tiến trình đã được lưu.');} };
})());
// --- te_le.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("te_le").setDescription("Tế lễ Tứ Tượng"),
  async execute(i) {
    const p=player(i);p.fourSymbols ||= {owned:[],resonance:0};p.fourSymbols.resonance=(p.fourSymbols.resonance||0)+25;save(i,p);return reply(i,`🔥 Tế lễ thành công: Resonance +25.`);
  }
 };
})());
// --- thach_dau_bach_ho.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thach_dau_bach_ho').setDescription('Thách đấu Bạch Hổ'),async execute(i){const p=player(i); p.stats=p.stats||{}; p.stats.duels=(p.stats.duels||0)+1; p.attack=(p.attack||0)+40; p.exp=(p.exp||0)+220; save(i,p); return reply(i,'✅ Thách đấu Bạch Hổ — tiến trình đã được lưu.');} };
})());
// --- thach_dau_chu_tuoc.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thach_dau_chu_tuoc').setDescription('Thách đấu Chu Tước'),async execute(i){const p=player(i); p.stats=p.stats||{}; p.stats.duels=(p.stats.duels||0)+1; p.crit=(p.crit||0)+2; p.exp=(p.exp||0)+220; save(i,p); return reply(i,'✅ Thách đấu Chu Tước — tiến trình đã được lưu.');} };
})());
// --- thach_dau_huyen_vu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thach_dau_huyen_vu').setDescription('Thách đấu Huyền Vũ'),async execute(i){const p=player(i); p.stats=p.stats||{}; p.stats.duels=(p.stats.duels||0)+1; p.defense=(p.defense||0)+30; p.exp=(p.exp||0)+200; save(i,p); return reply(i,'✅ Thách đấu Huyền Vũ — tiến trình đã được lưu.');} };
})());
// --- thach_dau_thanh_long.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thach_dau_thanh_long').setDescription('Thách đấu Thanh Long'),async execute(i){const p=player(i); p.stats=p.stats||{}; p.stats.duels=(p.stats.duels||0)+1; p.speed=(p.speed||0)+10; p.exp=(p.exp||0)+220; save(i,p); return reply(i,'✅ Thách đấu Thanh Long — tiến trình đã được lưu.');} };
})());
// --- thien_phu_tu_tuong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thien_phu_tu_tuong").setDescription("Thiên phú Tứ Tượng"),
  async execute(i) {
    const p=player(i);p.symbolTalent=(p.symbolTalent||0)+1;p.attack=(p.attack||0)+8;p.defense=(p.defense||0)+8;save(i,p);return reply(i,"✨ Thiên phú Tứ Tượng +8 ATK/DEF.");
  }
 };
})());
// --- thuc_hien_nghi_le.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thuc_hien_nghi_le').setDescription('Thực hiện nghi lễ Tứ Tượng'),async execute(i){const p=player(i); p.fourSymbols=p.fourSymbols||{}; p.fourSymbols.rituals=(p.fourSymbols.rituals||0)+1; p.fourSymbols.resonance=Math.min(100,(p.fourSymbols.resonance||0)+20); save(i,p); return reply(i,'✅ Thực hiện nghi lễ Tứ Tượng — tiến trình đã được lưu.');} };
})());
// --- tutuong.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");
const { FOUR_SYMBOLS, addSymbol, activateSymbol, formation } = require("../systems");

return { 
  data: new SlashCommandBuilder()
    .setName("tutuong").setDescription("Quản lý Tứ Tượng")
    .addStringOption(o => o.setName("hanhdong").setDescription("xem / kichhoat / mo").setRequired(true)
      .addChoices({name:"Xem",value:"xem"},{name:"Kích hoạt",value:"kichhoat"},{name:"Mở thử nghiệm",value:"mo"}))
    .addStringOption(o => o.setName("tuong").setDescription("thanhlong / bachho / chutuoс / huyenvu")),
  async execute(interaction) {
    const id = interaction.user.id;
    const player = db.getPlayer(id) || db.createPlayer(id, interaction.user.username, interaction.user.displayAvatarURL());
    const action = interaction.options.getString("hanhdong");
    const symbol = interaction.options.getString("tuong");

    if (action === "mo" && symbol && FOUR_SYMBOLS[symbol]) {
      addSymbol(player, symbol);
      db.updatePlayer(id, player);
      return interaction.reply(`✨ Đã mở khóa **${FOUR_SYMBOLS[symbol].name}**.`);
    }

    if (action === "kichhoat" && symbol) {
      try {
        activateSymbol(player, symbol);
        db.updatePlayer(id, player);
        return interaction.reply(`🌌 Đã kích hoạt **${FOUR_SYMBOLS[symbol]?.name || symbol}**.`);
      } catch (e) {
        return interaction.reply({content:`❌ ${e.message}`, ephemeral:true});
      }
    }

    const owned = player.fourSymbols?.owned || [];
    const list = Object.values(FOUR_SYMBOLS).map(x =>
      `${owned.includes(x.id) ? "✅" : "🔒"} ${x.name} — ${x.element} — ${x.role}`
    ).join("\n");

    const embed = new EmbedBuilder().setTitle("🐉 TỨ TƯỢNG")
      .setDescription(list)
      .addFields(
        {name:"⚡ Resonance",value:String(player.fourSymbols?.resonance || 0),inline:true},
        {name:"🌌 Trận pháp",value:formation(player) || "Chưa mở",inline:true},
        {name:"🔥 Đang kích hoạt",value:player.fourSymbols?.active || "Chưa có",inline:true}
      );
    await interaction.reply({embeds:[embed]});
  }
 };
})());
// --- hoi_phuc.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("hoi_phuc").setDescription("Hồi phục HP"),
  async execute(i) {
    const p=player(i); p.hp=p.maxHp||150; save(i,p); return reply(i,`💚 HP: **${p.hp}/${p.maxHp}**`);
  }
 };
})());
// --- mo_danh_hieu_an.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('mo_danh_hieu_an').setDescription('Mở danh hiệu ẩn'),async execute(i){const p=player(i); p.titles=p.titles||[]; if(!p.titles.includes('Kẻ Khai Phá Cấm Địa'))p.titles.push('Kẻ Khai Phá Cấm Địa'); save(i,p); return reply(i,'✅ Mở danh hiệu ẩn — tiến trình đã được lưu.');} };
})());
// --- nhat_ky_hanh_trinh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('nhat_ky_hanh_trinh').setDescription('Ghi dấu hành trình'),async execute(i){const p=player(i); p.storyFlags=p.storyFlags||{}; p.storyFlags.lastJourney=Date.now(); p.exp=(p.exp||0)+100; save(i,p); return reply(i,'✅ Ghi dấu hành trình — tiến trình đã được lưu.');} };
})());
// --- thang_can.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thang_can").setDescription("Thăng cấp căn cứ"),
  async execute(i) {
    const p=player(i);p.baseLevel=(p.baseLevel||0)+1;save(i,p);return reply(i,`🏯 Căn cứ cấp **${p.baseLevel}**.`);
  }
 };
})());
// --- thuvien.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("thuvien")
    .setDescription("Thư viện"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("📚 THƯ VIỆN")
      .setDescription("Xem sách, bí kíp và kiến thức.")
      .addFields(
        { name: "👤 Người chơi", value: p.username || interaction.user.username, inline: true },
        { name: "📍 Vị trí", value: p.location || "Bắc Minh", inline: true },
        { name: "⭐ Cấp", value: String(p.level || 1), inline: true }
      )
      .setFooter({ text: "Huyền Vũ Tứ Tượng • Ultimate" });
    await interaction.reply({ embeds: [embed] });
  }
 };
})());
// --- ultimate.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("ultimate").setDescription("Tuyệt kỹ"),
  async execute(i) {
    const p=player(i);p.ultimateUses=(p.ultimateUses||0)+1;p.energy=Math.max(0,(p.energy||120)-30);p.attack=(p.attack||0)+50;save(i,p);return reply(i,"💥 Tuyệt kỹ kích hoạt: +50 ATK, -30 năng lượng.");
  }
 };
})());

module.exports = commands;
