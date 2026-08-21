// Auto-grouped command bundle. Contains 14 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- doi_dong_hanh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("doi_dong_hanh").setDescription("Đổi đồng hành"),
  async execute(i) {
    const p=player(i);p.activeCompanion=p.activeCompanion==="huyenVuSu"?"voDanhKiemKhach":"huyenVuSu";save(i,p);return reply(i,`🔄 Đồng hành hiện tại: **${p.activeCompanion}**.`);
  }
 };
})());
// --- dong_hanh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("dong_hanh").setDescription("Gọi đồng hành"),
  async execute(i) {
    const p=player(i);p.activeCompanion="huyenVuSu";save(i,p);return reply(i,"🤝 Đã triệu hồi **Huyền Vũ Sứ** làm đồng hành.");
  }
 };
})());
// --- mo_npc.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_npc").setDescription("Mở NPC"),
  async execute(i) {
    const p=player(i); p.codex ||= {}; p.codex.characters ||= []; if(!p.codex.characters.includes("npc001"))p.codex.characters.push("npc001"); save(i,p); return reply(i,"👤 Đã mở hồ sơ NPC Bắc Minh 001.");
  }
 };
})());
// --- mo_tuyen_nhan_vat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('mo_tuyen_nhan_vat').setDescription('Mở tuyến nhân vật'),async execute(i){const p=player(i); p.storyFlags=p.storyFlags||{}; p.storyFlags.characterRoute=true; p.characters=p.characters||[]; p.characters.push({id:'route_'+Date.now(),bond:1}); save(i,p); return reply(i,'✅ Mở tuyến nhân vật — tiến trình đã được lưu.');} };
})());
// --- nhanvat.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");
const { CHARACTERS } = require("../systems");

return { 
  data: new SlashCommandBuilder().setName("nhanvat").setDescription("Xem nhân vật và đồng hành"),
  async execute(interaction) {
    const player = db.getPlayer(interaction.user.id) || db.createPlayer(interaction.user.id, interaction.user.username);
    const owned = player.characters || [];
    const text = CHARACTERS.map(c => `${owned.includes(c.id) ? "⭐" : "🔒"} **${c.name}** — ${"⭐".repeat(c.rarity)} — ${c.role}`).join("\n");
    await interaction.reply({embeds:[new EmbedBuilder().setTitle("👤 NHÂN VẬT").setDescription(text).setFooter({text:"Mở khóa nhân vật qua nhiệm vụ, sự kiện và triệu hồi."})]});
  }
 };
})());
// --- tang_quan_he.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tang_quan_he").setDescription("Tăng quan hệ NPC"),
  async execute(i) {
    const p=player(i); p.relationships ||= {}; p.relationships.mysterious=(p.relationships.mysterious||0)+10; save(i,p); return reply(i,`❤️ Quan hệ NPC Bí Ẩn +10 = **${p.relationships.mysterious}**.`);
  }
 };
})());
// --- tang_thien_cam.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('tang_thien_cam').setDescription('Tăng thiện cảm NPC'),async execute(i){const p=player(i); p.reputation=p.reputation||{}; p.reputation.npc=(p.reputation.npc||0)+10; save(i,p); return reply(i,'✅ Tăng thiện cảm NPC — tiến trình đã được lưu.');} };
})());
// --- thuc_tinh_nhan_vat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thuc_tinh_nhan_vat").setDescription("Thức tỉnh nhân vật"),
  async execute(i) {
    const p=player(i); p.awakening=(p.awakening||0)+1; p.maxHp=(p.maxHp||150)+50; p.attack=(p.attack||0)+10; p.defense=(p.defense||0)+10; p.hp=p.maxHp; save(i,p); return reply(i,`🌟 Thức tỉnh **${p.awakening}** thành công.`);
  }
 };
})());
// --- huongdan.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

return { 
  data: new SlashCommandBuilder().setName("huongdan").setDescription("Xem toàn bộ lệnh Huyền Vũ"),
  async execute(interaction) {
    const dir = path.join(__dirname);
    const names = fs.readdirSync(dir)
      .filter(x => x.endsWith(".js"))
      .map(x => x.replace(".js",""))
      .sort();
    const chunks = [];
    for (let i=0;i<names.length;i+=20) chunks.push(names.slice(i,i+20).map(x => `/${x}`).join(" • "));
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle("📖 HƯỚNG DẪN HUYỀN VŨ TỨ TƯỢNG")
        .setDescription(chunks.join("\n\n"))
        .setFooter({text:`Tổng command trong thư mục: ${names.length}`})]
    });
  }
 };
})());
// --- mo_quai.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_quai").setDescription("Mở quái vật"),
  async execute(i) {
    const p=player(i); p.codex ||= {}; p.codex.monsters ||= []; if(!p.codex.monsters.includes("mob001"))p.codex.monsters.push("mob001"); save(i,p); return reply(i,"👹 Đã ghi nhận quái vật đầu tiên.");
  }
 };
})());
// --- phong_an.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("phong_an").setDescription("Phong ấn"),
  async execute(i) {
    const p=player(i);p.sealed=(p.sealed||0)+1;save(i,p);return reply(i,`🔒 Phong ấn hiện tại: ${p.sealed}.`);
  }
 };
})());
// --- thanhchu.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("thanhchu")
    .setDescription("Thánh Chủ"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("👁️ THÁNH CHỦ")
      .setDescription("Xem hệ thống Thánh Chủ.")
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
// --- tim_duong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tim_duong").setDescription("Tìm đường"),
  async execute(i) {
    const p=player(i);p.navigation=(p.navigation||0)+1;save(i,p);return reply(i,"🧭 Đã tìm được một tuyến đường mới.");
  }
 };
})());
// --- trang_bi_vu_khi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("trang_bi_vu_khi").setDescription("Trang bị vũ khí"),
  async execute(i) {
    const p=player(i); p.equipment ||= {}; p.equipment.weapon={id:"huyenVuKiem",name:"Huyền Vũ Kiếm",attack:30}; p.attack=(p.attack||0)+30; save(i,p); return reply(i,"🗡️ Đã trang bị **Huyền Vũ Kiếm** (+30 ATK).");
  }
 };
})());

module.exports = commands;
