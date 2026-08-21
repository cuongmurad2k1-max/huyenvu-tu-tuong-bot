// Auto-grouped command bundle. Contains 30 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- arena.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("arena")
    .setDescription("Đấu trường"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🏟️ ĐẤU TRƯỜNG")
      .setDescription("Xem PvP Arena.")
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
// --- arena_reward.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("arena_reward").setDescription("Thưởng Arena"),
  async execute(i) {
    const p=player(i);p.pvpRating=(p.pvpRating||1000);num(p,"coins");const reward=Math.floor(p.pvpRating/2);p.coins+=reward;save(i,p);return reply(i,`🏟️ Nhận ${reward} Gold theo Rating.`);
  }
 };
})());
// --- bach_ho_skill.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("bach_ho_skill").setDescription("Kỹ năng Bạch Hổ"),
  async execute(i) {
    const p=player(i); p.skillUse ||= {}; p.skillUse.bachHo=(p.skillUse.bachHo||0)+1; p.attack=(p.attack||0)+25; save(i,p); return reply(i,"🐯 Bạch Hổ Sát: **+25 ATK**.");
  }
 };
})());
// --- bang_chien.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("bang_chien").setDescription("Chiến tranh bang"),
  async execute(i) {
    const p=player(i);if(!p.guild)return reply(i,"❌ Chưa có bang.");p.guild.warScore=(p.guild.warScore||0)+200;p.stats ||= {};p.stats.guildWar=(p.stats.guildWar||0)+1;save(i,p);return reply(i,"⚔️ Bang chiến thắng một trận: +200 điểm.");
  }
 };
})());
// --- bao_ve_dong_doi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("bao_ve_dong_doi").setDescription("Bảo vệ đồng đội"),
  async execute(i) {
    const p=player(i);p.teamGuard=(p.teamGuard||0)+1;p.defense=(p.defense||0)+10;save(i,p);return reply(i,"🛡️ Kỹ năng bảo vệ đồng đội +10 DEF.");
  }
 };
})());
// --- bao_ve_thuong_nhan.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("bao_ve_thuong_nhan").setDescription("Bảo vệ thương nhân"),
  async execute(i) {
    const p=player(i);p.escort=(p.escort||0)+1;p.reputation ||= {};p.reputation.merchant=(p.reputation.merchant||0)+25;save(i,p);return reply(i,"🛡️ Hộ tống thành công: +25 uy tín thương nhân.");
  }
 };
})());
// --- bat_dau_pvp.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("bat_dau_pvp").setDescription("Bắt đầu PvP"),
  async execute(i) {
    const p=player(i); p.pvpInMatch=true; save(i,p); return reply(i,"🏟️ Bạn đã vào hàng chờ PvP.");
  }
 };
})());
// --- chien_thuat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("chien_thuat").setDescription("Chọn chiến thuật"),
  async execute(i) {
    const p=player(i);p.strategy=p.strategy==="attack"?"defense":"attack";if(p.strategy==="attack")p.attack=(p.attack||0)+10;else p.defense=(p.defense||0)+10;save(i,p);return reply(i,`♟️ Chiến thuật: **${p.strategy}**.`);
  }
 };
})());
// --- chu_tuoc_skill.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("chu_tuoc_skill").setDescription("Kỹ năng Chu Tước"),
  async execute(i) {
    const p=player(i); p.skillUse ||= {}; p.skillUse.chuTuoc=(p.skillUse.chuTuoc||0)+1; p.crit=(p.crit||0)+3; save(i,p); return reply(i,"🔥 Chu Tước Hỏa Vũ: **+3% Crit**.");
  }
 };
})());
// --- combo.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("combo").setDescription("Luyện combo"),
  async execute(i) {
    const p=player(i);p.combo=(p.combo||0)+1;p.crit=(p.crit||0)+2;save(i,p);return reply(i,`⚡ Combo ${p.combo}: Crit +2%.`);
  }
 };
})());
// --- enrage.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("enrage").setDescription("Kích hoạt cuồng nộ"),
  async execute(i) {
    const p=player(i);p.enrage=true;p.attack=(p.attack||0)+80;p.defense=Math.max(0,(p.defense||0)-20);save(i,p);return reply(i,"😡 Cuồng nộ: +80 ATK, -20 DEF.");
  }
 };
})());
// --- hut_mau.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("hut_mau").setDescription("Hút máu"),
  async execute(i) {
    const p=player(i);p.lifesteal=(p.lifesteal||0)+2;save(i,p);return reply(i,"🩸 Lifesteal +2%.");
  }
 };
})());
// --- huyen_vu_skill.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("huyen_vu_skill").setDescription("Kỹ năng Huyền Vũ"),
  async execute(i) {
    const p=player(i); p.skillUse ||= {}; p.skillUse.huyenVu=(p.skillUse.huyenVu||0)+1; p.defense=(p.defense||0)+30; save(i,p); return reply(i,"🐢 Huyền Vũ Thuẫn: **+30 DEF**.");
  }
 };
})());
// --- kham_pha_co_chien_truong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('kham_pha_co_chien_truong').setDescription('Khám phá Cổ Chiến Trường'),async execute(i){const p=player(i); p.location='Cổ Chiến Trường'; p.stats=p.stats||{}; p.stats.explores=(p.stats.explores||0)+1; p.exp=(p.exp||0)+250; save(i,p); return reply(i,'✅ Khám phá Cổ Chiến Trường — tiến trình đã được lưu.');} };
})());
// --- khieu_chien.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("khieu_chien").setDescription("Khiêu chiến"),
  async execute(i) {
    const p=player(i);p.challenges=(p.challenges||0)+1;save(i,p);return reply(i,`⚔️ Khiêu chiến #${p.challenges} đã được ghi nhận.`);
  }
 };
})());
// --- lucchien.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("lucchien").setDescription("Tính lực chiến"),
  async execute(i) {
    const p=player(i); const cp=Math.floor((p.attack||0)*2+(p.defense||0)*1.5+(p.maxHp||0)*.2+(p.speed||0)*3+(p.crit||0)*5); p.combatPower=cp; save(i,p); return reply(i,`🔥 Lực chiến của bạn: **${cp.toLocaleString()}**`);
  }
 };
})());
// --- ne_tranh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("ne_tranh").setDescription("Né tránh"),
  async execute(i) {
    const p=player(i);p.dodge=(p.dodge||0)+3;save(i,p);return reply(i,"💨 Dodge +3%.");
  }
 };
})());
// --- parry.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("parry").setDescription("Phản đòn"),
  async execute(i) {
    const p=player(i);p.parry=(p.parry||0)+1;p.defense=(p.defense||0)+10;save(i,p);return reply(i,"🛡️ Phản đòn thành công: +10 DEF.");
  }
 };
})());
// --- phao.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("phao").setDescription("Phá giáp"),
  async execute(i) {
    const p=player(i);p.penetration=(p.penetration||0)+5;save(i,p);return reply(i,"💥 Penetration +5%.");
  }
 };
})());
// --- phong_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("phong_thu").setDescription("Bật phòng thủ"),
  async execute(i) {
    const p=player(i); p.guard=true; p.defense=(p.defense||0)+20; save(i,p); return reply(i,"🛡️ Tư thế phòng thủ +20 DEF.");
  }
 };
})());
// --- tan_cong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tan_cong").setDescription("Bật công kích"),
  async execute(i) {
    const p=player(i); p.guard=false; p.attack=(p.attack||0)+15; save(i,p); return reply(i,"⚔️ Tư thế công kích +15 ATK.");
  }
 };
})());
// --- thang_pvp.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thang_pvp").setDescription("Ghi nhận thắng PvP"),
  async execute(i) {
    const p=player(i); p.stats ||= {}; p.stats.pvpWins=(p.stats.pvpWins||0)+1; p.pvpRating=(p.pvpRating||1000)+25; save(i,p); return reply(i,`🏆 PvP thắng! Rating **${p.pvpRating}**.`);
  }
 };
})());
// --- thanh_long_skill.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thanh_long_skill").setDescription("Kỹ năng Thanh Long"),
  async execute(i) {
    const p=player(i); p.skillUse ||= {}; p.skillUse.thanhLong=(p.skillUse.thanhLong||0)+1; p.hp=Math.min(p.maxHp||150,(p.hp||0)+50); save(i,p); return reply(i,"🐉 Thanh Long hồi phục **50 HP**.");
  }
 };
})());
// --- thua_pvp.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thua_pvp").setDescription("Ghi nhận thua PvP"),
  async execute(i) {
    const p=player(i); p.stats ||= {}; p.stats.pvpLosses=(p.stats.pvpLosses||0)+1; p.pvpRating=Math.max(0,(p.pvpRating||1000)-18); save(i,p); return reply(i,`💀 PvP thất bại. Rating **${p.pvpRating}**.`);
  }
 };
})());
// --- goi_vien_quan.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("goi_vien_quan").setDescription("Gọi viện quân"),
  async execute(i) {
    const p=player(i);p.reinforcements=(p.reinforcements||0)+1;save(i,p);return reply(i,`🪖 Viện quân hiện có: ${p.reinforcements}.`);
  }
 };
})());
// --- mo_cong_nghe.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_cong_nghe").setDescription("Mở công nghệ"),
  async execute(i) {
    const p=player(i);p.technologies ||= [];p.technologies.push(`tech_${p.technologies.length+1}`);save(i,p);return reply(i,"⚙️ Đã mở một công nghệ mới.");
  }
 };
})());
// --- nhat_ky.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nhat_ky").setDescription("Nhật ký"),
  async execute(i) {
    const p=player(i); p.journal ||= []; p.journal.push({time:Date.now(),text:"Bạn đã mở Nhật Ký Huyền Vũ."}); save(i,p); return reply(i,"📔 Đã ghi lại một trang nhật ký.");
  }
 };
})());
// --- than_dien.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("than_dien").setDescription("Thăm Thần Điện"),
  async execute(i) {
    const p=player(i);p.templeVisits=(p.templeVisits||0)+1;p.luck=(p.luck||0)+1;save(i,p);return reply(i,`🏛️ Thần Điện ban phúc: Luck +1.`);
  }
 };
})());
// --- thuc_hanh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thuc_hanh").setDescription("Thực hành kỹ năng"),
  async execute(i) {
    const p=player(i); p.skillMastery ||= {}; p.skillMastery.kyNangCoBan=(p.skillMastery.kyNangCoBan||0)+10; save(i,p); return reply(i,`🎯 Mastery +10 = **${p.skillMastery.kyNangCoBan}**`);
  }
 };
})());
// --- xoa_nguyen.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xoa_nguyen").setDescription("Xóa nguyền"),
  async execute(i) {
    const p=player(i);p.curse=0;save(i,p);return reply(i,"✨ Đã xóa nguyền.");
  }
 };
})());

module.exports = commands;
