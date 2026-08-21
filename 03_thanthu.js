// Auto-grouped command bundle. Contains 22 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- ap_trung_than_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('ap_trung_than_thu').setDescription('Ấp trứng thần thú ngay'),async execute(i){const p=player(i); p.beastEggs=p.beastEggs||[]; if(!p.beastEggs.length)p.beastEggs.push({id:'egg_auto'}); p.beastEggs[0].hatched=true; p.beasts=p.beasts||[]; p.beasts.push({id:'hatched_'+Date.now(),name:'Thần Thú Ấu Thể',level:1}); save(i,p); return reply(i,'✅ Ấp trứng thần thú ngay — tiến trình đã được lưu.');} };
})());
// --- huyetmach.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("huyetmach")
    .setDescription("Xem huyết mạch"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🩸 HUYẾT MẠCH")
      .setDescription("Xem các huyết mạch và cấp thức tỉnh.")
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
// --- ket_nghia_than_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('ket_nghia_than_thu').setDescription('Kết nghĩa với thần thú'),async execute(i){const p=player(i); p.relationships=p.relationships||{}; p.relationships.beastBond=(p.relationships.beastBond||0)+1; p.beasts=p.beasts||[]; save(i,p); return reply(i,'✅ Kết nghĩa với thần thú — tiến trình đã được lưu.');} };
})());
// --- mo_huyet_mach.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_huyet_mach").setDescription("Thức tỉnh huyết mạch"),
  async execute(i) {
    const p=player(i); p.bloodline ||= "huyenVu"; p.bloodlineTier=(p.bloodlineTier||0)+1; p.defense=(p.defense||0)+20; save(i,p); return reply(i,`🩸 Huyết mạch **${p.bloodline}** tầng ${p.bloodlineTier}.`);
  }
 };
})());
// --- mo_linh_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_linh_thu").setDescription("Nhận linh thú"),
  async execute(i) {
    const p=player(i); p.beasts ||= []; if(!p.beasts.includes("huyenQuy"))p.beasts.push("huyenQuy"); save(i,p); return reply(i,"🐉 Đã nhận **Huyền Quy**.");
  }
 };
})());
// --- nhan_phuc_than_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('nhan_phuc_than_thu').setDescription('Nhận phúc lành thần thú'),async execute(i){const p=player(i); p.attack=(p.attack||0)+50; p.defense=(p.defense||0)+50; p.maxHp=(p.maxHp||150)+250; p.hp=p.maxHp; save(i,p); return reply(i,'✅ Nhận phúc lành thần thú — tiến trình đã được lưu.');} };
})());
// --- nuoi_linh_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nuoi_linh_thu").setDescription("Nuôi linh thú"),
  async execute(i) {
    const p=player(i); p.beastBond=(p.beastBond||0)+10; save(i,p); return reply(i,`🐉 Độ thân mật linh thú +10 = **${p.beastBond}**.`);
  }
 };
})());
// --- nuoi_than_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('nuoi_than_thu').setDescription('Nuôi dưỡng thần thú'),async execute(i){const p=player(i); p.beasts=p.beasts||[]; if(!p.beasts.length)p.beasts.push({id:'beast_pet',name:'Linh Thú Đồng Hành',level:1}); p.beasts[0].level=(p.beasts[0].level||1)+3; p.beasts[0].bond=(p.beasts[0].bond||0)+10; save(i,p); return reply(i,'✅ Nuôi dưỡng thần thú — tiến trình đã được lưu.');} };
})());
// --- phan_to_huyet_mach.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('phan_to_huyet_mach').setDescription('Phản tổ huyết mạch'),async execute(i){const p=player(i); p.bloodlineTier=(p.bloodlineTier||0)+1; p.attack=(p.attack||0)+80; p.defense=(p.defense||0)+80; p.maxHp=(p.maxHp||150)+300; p.hp=p.maxHp; save(i,p); return reply(i,'✅ Phản tổ huyết mạch — tiến trình đã được lưu.');} };
})());
// --- sinh_trung_than_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('sinh_trung_than_thu').setDescription('Ấp trứng thần thú'),async execute(i){const p=player(i); p.beastEggs=p.beastEggs||[]; p.beastEggs.push({id:'egg_'+Date.now(),hatched:false}); save(i,p); return reply(i,'✅ Ấp trứng thần thú — tiến trình đã được lưu.');} };
})());
// --- than_hoa_huyet_mach.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('than_hoa_huyet_mach').setDescription('Thần hóa huyết mạch'),async execute(i){const p=player(i); p.bloodlineTier=(p.bloodlineTier||0)+3; p.attack=(p.attack||0)+180; p.defense=(p.defense||0)+180; p.speed=(p.speed||0)+30; p.maxHp=(p.maxHp||150)+800; p.hp=p.maxHp; save(i,p); return reply(i,'✅ Thần hóa huyết mạch — tiến trình đã được lưu.');} };
})());
// --- thuc_tinh_huyet_mach.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thuc_tinh_huyet_mach').setDescription('Thức tỉnh huyết mạch mới'),async execute(i){const p=player(i); p.bloodline = p.bloodline || 'Huyết Mạch Tứ Tượng'; p.attack=(p.attack||0)+40; p.defense=(p.defense||0)+40; p.maxHp=(p.maxHp||150)+200; p.hp=p.maxHp; save(i,p); return reply(i,'✅ Thức tỉnh huyết mạch mới — tiến trình đã được lưu.');} };
})());
// --- thuc_tinh_than_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thuc_tinh_than_thu').setDescription('Thức tỉnh thần thú đang sở hữu'),async execute(i){const p=player(i); p.beasts=p.beasts||[]; if(!p.beasts.length)p.beasts.push({id:'huyen_vu_awakening',name:'Thần Thú Thức Tỉnh',level:1}); p.beasts[0].awakened=true; p.beasts[0].level=(p.beasts[0].level||1)+5; save(i,p); return reply(i,'✅ Thức tỉnh thần thú đang sở hữu — tiến trình đã được lưu.');} };
})());
// --- tien_hoa.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tien_hoa").setDescription("Tiến hóa"),
  async execute(i) {
    const p=player(i); p.evolution=(p.evolution||0)+1; p.attack=(p.attack||0)+20; p.maxHp=(p.maxHp||150)+100; save(i,p); return reply(i,`🧬 Tiến hóa cấp **${p.evolution}**.`);
  }
 };
})());
// --- tien_hoa_linh_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tien_hoa_linh_thu").setDescription("Tiến hóa linh thú"),
  async execute(i) {
    const p=player(i); p.beastEvolution=(p.beastEvolution||0)+1; p.attack=(p.attack||0)+15; save(i,p); return reply(i,`🐲 Linh thú tiến hóa cấp **${p.beastEvolution}**.`);
  }
 };
})());
// --- tien_hoa_than_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('tien_hoa_than_thu').setDescription('Tiến hóa thần thú'),async execute(i){const p=player(i); p.beasts=p.beasts||[]; if(!p.beasts.length)p.beasts.push({id:'beast_new',name:'Thần Thú Mới',level:1}); p.beasts[0].evolution=(p.beasts[0].evolution||0)+1; p.beasts[0].level=(p.beasts[0].level||1)+10; p.attack=(p.attack||0)+60; save(i,p); return reply(i,'✅ Tiến hóa thần thú — tiến trình đã được lưu.');} };
})());
// --- hoso.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("hoso").setDescription("Hồi sinh nhân vật"),
  async execute(i) {
    const p=player(i); p.hp=p.maxHp||150; p.energy=p.maxEnergy||120; save(i,p); return reply(i,`✨ ${i.user.username} đã hồi phục toàn bộ HP và năng lượng.`);
  }
 };
})());
// --- mo_ending.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_ending").setDescription("Mở ending"),
  async execute(i) {
    const p=player(i);p.endings ||= [];const e=`ending_${p.endings.length+1}`;p.endings.push(e);save(i,p);return reply(i,`🌠 Đã mở khóa **${e}**.`);
  }
 };
})());
// --- pha_phong_an.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("pha_phong_an").setDescription("Phá phong ấn"),
  async execute(i) {
    const p=player(i);if((p.sealed||0)<=0)return reply(i,"❌ Không có phong ấn.");p.sealed--;p.attack=(p.attack||0)+20;save(i,p);return reply(i,"💥 Phá một phong ấn, +20 ATK.");
  }
 };
})());
// --- thanh_tay.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thanh_tay").setDescription("Thanh tẩy"),
  async execute(i) {
    const p=player(i);p.statuses=[];p.curse=0;save(i,p);return reply(i,"✨ Đã thanh tẩy trạng thái xấu và nguyền.");
  }
 };
})());
// --- tienthoa.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("tienthoa")
    .setDescription("Hệ thống tiến hóa"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🧬 TIẾN HÓA")
      .setDescription("Xem hệ thống tiến hóa nhân vật và linh thú.")
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
// --- trang_bi_giap.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("trang_bi_giap").setDescription("Trang bị giáp"),
  async execute(i) {
    const p=player(i); p.equipment ||= {}; p.equipment.armor={id:"huyenVuGiap",name:"Huyền Vũ Giáp",defense:35}; p.defense=(p.defense||0)+35; save(i,p); return reply(i,"🛡️ Đã trang bị **Huyền Vũ Giáp** (+35 DEF).");
  }
 };
})());

module.exports = commands;
