// Auto-grouped command bundle. Contains 24 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- batdau2.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("khampha")
    .setDescription("Khám phá"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🌠 KHÁM PHÁ")
      .setDescription("Bắt đầu hành trình khám phá thế giới.")
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
// --- ca.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("cauca")
    .setDescription("Câu cá"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🎣 CÂU CÁ")
      .setDescription("Tham gia minigame câu cá.")
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
// --- camdia.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("camdia")
    .setDescription("Xem cấm địa"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("☠️ CẤM ĐỊA")
      .setDescription("Xem các cấm địa nguy hiểm.")
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
// --- cau_ca.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("cau_ca").setDescription("Câu cá"),
  async execute(i) {
    const p=player(i); p.fishing=(p.fishing||0)+1; num(p,"coins"); const gain=100+p.fishing*10; p.coins+=gain; save(i,p); return reply(i,`🎣 Câu cá lần ${p.fishing}: +${gain} Gold.`);
  }
 };
})());
// --- che_tao.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("che_tao").setDescription("Chế tạo vật phẩm"),
  async execute(i) {
    const p=player(i); p.inventory ||= []; p.inventory.push("crafted_huyenVu"); p.stats ||= {}; p.stats.crafts=(p.stats.crafts||0)+1; save(i,p); return reply(i,"⚒️ Chế tạo thành công **Huyền Vũ Di Vật**.");
  }
 };
})());
// --- codex.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { CHARACTERS, MONSTERS, BOSSES, ITEMS } = require("../systems");
return { 
 data:new SlashCommandBuilder().setName("codex").setDescription("Xem bộ sưu tập thế giới"),
 async execute(interaction){
  const e=new EmbedBuilder().setTitle("📚 HUYỀN VŨ CODEX")
   .addFields(
    {name:"👤 Nhân vật",value:String(CHARACTERS.length),inline:true},
    {name:"👹 Quái vật",value:String(MONSTERS.length),inline:true},
    {name:"👑 Boss",value:String(BOSSES.length),inline:true},
    {name:"💎 Vật phẩm",value:String(ITEMS.length),inline:true}
   );
  await interaction.reply({embeds:[e]});
 }
 };
})());
// --- danh_dau.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("danh_dau").setDescription("Đánh dấu địa điểm"),
  async execute(i) {
    const p=player(i);p.markedLocations ||= [];p.markedLocations.push(p.location||"Bắc Minh");save(i,p);return reply(i,`📌 Đã đánh dấu **${p.location||"Bắc Minh"}**.`);
  }
 };
})());
// --- danh_du.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("danh_du").setDescription("Danh dự"),
  async execute(i) {
    const p=player(i);p.honor=(p.honor||0)+10;save(i,p);return reply(i,`🏅 Danh dự +10 = ${p.honor}.`);
  }
 };
})());
// --- danh_hieu_kiem.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("danh_hieu_kiem").setDescription("Nhận danh hiệu"),
  async execute(i) {
    const p=player(i); p.titles ||= []; if(!p.titles.includes("Kẻ Săn Boss"))p.titles.push("Kẻ Săn Boss"); save(i,p); return reply(i,"👑 Nhận danh hiệu **Kẻ Săn Boss**.");
  }
 };
})());
// --- danh_vong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("danh_vong").setDescription("Nhiệm vụ danh vọng"),
  async execute(i) {
    const p=player(i);p.reputation ||= {};p.reputation.world=(p.reputation.world||0)+100;save(i,p);return reply(i,"⭐ Nhiệm vụ danh vọng hoàn thành: +100.");
  }
 };
})());
// --- dao_tao.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("dao_tao").setDescription("Đào tạo"),
  async execute(i) {
    const p=player(i);p.training=(p.training||0)+1;p.exp=(p.exp||0)+200;save(i,p);return reply(i,"🎓 Đào tạo hoàn tất: +200 EXP.");
  }
 };
})());
// --- di_san.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("di_san").setDescription("Di săn"),
  async execute(i) {
    const p=player(i); p.huntCount=(p.huntCount||0)+1; p.inventory ||= []; p.inventory.push("hunt_material"); save(i,p); return reply(i,"🏹 Thu được nguyên liệu săn thú.");
  }
 };
})());
// --- diem_danh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("diem_danh").setDescription("Điểm danh"),
  async execute(i) {
    const p=player(i); p.loginStreak=(p.loginStreak||0)+1; num(p,"coins",0); p.coins+=500+p.loginStreak*50; save(i,p); return reply(i,`📅 Chuỗi điểm danh: **${p.loginStreak}** ngày. Nhận ${500+p.loginStreak*50} Gold.`);
  }
 };
})());
// --- do_tham.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("do_tham").setDescription("Do thám"),
  async execute(i) {
    const p=player(i);p.intel=(p.intel||0)+1;save(i,p);return reply(i,`🕵️ Thu thập tình báo #${p.intel}.`);
  }
 };
})());
// --- doc_status.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("doc_status").setDescription("Xem trạng thái"),
  async execute(i) {
    const p=player(i);return reply(i,`📋 Status: ${JSON.stringify(p.statuses||[])}\nBuff: ${JSON.stringify(p.buffs||{})}`);
  }
 };
})());
// --- don_rac.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("don_rac").setDescription("Dọn kho"),
  async execute(i) {
    const p=player(i);p.inventory=(p.inventory||[]).slice(-20);save(i,p);return reply(i,"🧹 Đã dọn kho, giữ lại 20 vật phẩm gần nhất.");
  }
 };
})());
// --- endgame.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("endgame").setDescription("Kiểm tra Endgame"),
  async execute(i) {
    const p=player(i);const score=(p.achievements?.length||0)+(p.secrets?.length||0)+(p.fourSymbols?.owned?.length||0);return reply(i,`🌠 Điểm Endgame: **${score}**\nĐiều kiện kết thúc đặc biệt được mở dần qua thành tựu, bí mật và Tứ Tượng.`);
  }
 };
})());
// --- event_join.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("event_join").setDescription("Tham gia event"),
  async execute(i) {
    const p=player(i);p.eventsJoined=(p.eventsJoined||0)+1;p.eventPoints=(p.eventPoints||0)+50;save(i,p);return reply(i,"🎪 Tham gia event: +50 điểm.");
  }
 };
})());
// --- event_reward.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("event_reward").setDescription("Nhận thưởng event"),
  async execute(i) {
    const p=player(i);p.eventPoints=(p.eventPoints||0);if(p.eventPoints<50)return reply(i,"❌ Chưa đủ 50 điểm event.");p.eventPoints-=50;num(p,"gems");p.gems+=20;save(i,p);return reply(i,"🎁 Đổi 50 điểm event lấy 20 Gems.");
  }
 };
})());
// --- gacha10.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("gacha10").setDescription("Triệu hồi 10 lần"),
  async execute(i) {
    const p=player(i); p.gacha ||= {pulls:0,pity:0}; let rare=false; for(let k=0;k<10;k++){p.gacha.pulls++;p.gacha.pity++;if(p.gacha.pity>=50||Math.random()<.03){rare=true;p.gacha.pity=0;}} save(i,p); return reply(i,rare?"🌟 10 lần triệu hồi có **5★**!":"🎴 10 lần triệu hồi hoàn tất.");
  }
 };
})());
// --- giai_cuu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("giai_cuu").setDescription("Giải cứu NPC"),
  async execute(i) {
    const p=player(i);p.stats ||= {};p.stats.quests=(p.stats.quests||0)+1;p.relationships ||= {};p.relationships.rescued=(p.relationships.rescued||0)+20;save(i,p);return reply(i,"🧑‍🤝‍🧑 Giải cứu NPC thành công.");
  }
 };
})());
// --- giai_ma_bi_mat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('giai_ma_bi_mat').setDescription('Giải mã bí mật'),async execute(i){const p=player(i); p.storyFlags=p.storyFlags||{}; p.storyFlags.secretSolved=(p.storyFlags.secretSolved||0)+1; p.exp=(p.exp||0)+350; save(i,p); return reply(i,'✅ Giải mã bí mật — tiến trình đã được lưu.');} };
})());
// --- giam_dinh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("giam_dinh").setDescription("Giám định"),
  async execute(i) {
    const p=player(i);p.appraisals=(p.appraisals||0)+1;save(i,p);return reply(i,"🔍 Giám định hoàn tất: vật phẩm nhận được nhãn **Hiếm**.");
  }
 };
})());
// --- giao_dich.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("giao_dich").setDescription("Giao dịch mô phỏng"),
  async execute(i) {
    const p=player(i);num(p,"coins");if(p.coins<100)return reply(i,"❌ Cần 100 Gold.");p.coins-=100;p.tradeCount=(p.tradeCount||0)+1;save(i,p);return reply(i,"💱 Giao dịch thành công.");
  }
 };
})());

module.exports = commands;
