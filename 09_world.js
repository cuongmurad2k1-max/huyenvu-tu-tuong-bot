// Auto-grouped command bundle. Contains 25 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- bicanh.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("bicanh")
    .setDescription("Khám phá bí cảnh"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🏯 BÍ CẢNH")
      .setDescription("Xem các bí cảnh có thể khám phá.")
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
// --- di_chuyen.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("di_chuyen").setDescription("Di chuyển"),
  async execute(i) {
    const p=player(i); const areas=["Bắc Minh","Đông Hải","Nam Hoang","Tây Vực","Trung Châu","Cửu U"]; p.location=areas[Math.floor(Math.random()*areas.length)]; save(i,p); return reply(i,`🚶 Bạn đã tới **${p.location}**.`);
  }
 };
})());
// --- dieu_tra.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("dieu_tra").setDescription("Điều tra vụ án"),
  async execute(i) {
    const p=player(i);p.investigation ||= {clues:[]};p.investigation.clues.push(`manh_moi_${p.investigation.clues.length+1}`);save(i,p);return reply(i,`🔎 Tìm thấy manh mối #${p.investigation.clues.length}.`);
  }
 };
})());
// --- duong_ham.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("duong_ham").setDescription("Khám phá đường hầm"),
  async execute(i) {
    const p=player(i);p.tunnels=(p.tunnels||0)+1;p.inventory ||= [];p.inventory.push("ancient_fragment");save(i,p);return reply(i,"🕳️ Tìm thấy **Mảnh Thượng Cổ**.");
  }
 };
})());
// --- giai_do.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("giai_do").setDescription("Giải đố"),
  async execute(i) {
    const p=player(i);p.puzzlesSolved=(p.puzzlesSolved||0)+1;p.exp=(p.exp||0)+150;save(i,p);return reply(i,"🧩 Giải đúng câu đố: +150 EXP.");
  }
 };
})());
// --- kham_pha_long_vuc.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('kham_pha_long_vuc').setDescription('Khám phá Long Vực'),async execute(i){const p=player(i); p.location='Long Vực'; p.stats=p.stats||{}; p.stats.explores=(p.stats.explores||0)+1; p.exp=(p.exp||0)+300; save(i,p); return reply(i,'✅ Khám phá Long Vực — tiến trình đã được lưu.');} };
})());
// --- kham_pha_phuong_son.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('kham_pha_phuong_son').setDescription('Khám phá Phượng Sơn'),async execute(i){const p=player(i); p.location='Phượng Sơn'; p.stats=p.stats||{}; p.stats.explores=(p.stats.explores||0)+1; p.exp=(p.exp||0)+300; save(i,p); return reply(i,'✅ Khám phá Phượng Sơn — tiến trình đã được lưu.');} };
})());
// --- kho_bau.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("kho_bau").setDescription("Tìm kho báu"),
  async execute(i) {
    const p=player(i);p.treasures=(p.treasures||0)+1;num(p,"coins");const g=500+Math.floor(Math.random()*1500);p.coins+=g;save(i,p);return reply(i,`🗺️ Tìm thấy kho báu #${p.treasures}: +${g} Gold.`);
  }
 };
})());
// --- khuvuc.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("khuvuc")
    .setDescription("Xem khu vực"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🗺️ KHU VỰC")
      .setDescription("Xem các khu vực trong đại lục.")
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
// --- long_mach.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("long_mach").setDescription("Kích hoạt Long Mạch"),
  async execute(i) {
    const p=player(i);p.longVein=(p.longVein||0)+1;p.exp=(p.exp||0)+300;save(i,p);return reply(i,`🐉 Long Mạch tầng ${p.longVein}: +300 EXP.`);
  }
 };
})());
// --- mo_bi_canh_an.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('mo_bi_canh_an').setDescription('Mở bí cảnh ẩn'),async execute(i){const p=player(i); p.storyFlags=p.storyFlags||{}; p.storyFlags.hiddenRealm=true; p.reputation=p.reputation||{}; p.reputation.hiddenRealm=(p.reputation.hiddenRealm||0)+10; save(i,p); return reply(i,'✅ Mở bí cảnh ẩn — tiến trình đã được lưu.');} };
})());
// --- mo_bi_mat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_bi_mat").setDescription("Mở bí mật"),
  async execute(i) {
    const p=player(i);p.secrets ||= [];const s=`secret_${p.secrets.length+1}`;p.secrets.push(s);save(i,p);return reply(i,`🔐 Phát hiện bí mật **${s}**.`);
  }
 };
})());
// --- mo_cua_cuu_u.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_cua_cuu_u").setDescription("Mở Cửu U"),
  async execute(i) {
    const p=player(i);p.cuuUOpen=true;p.location="Cửu U";save(i,p);return reply(i,"🌑 Cổng Cửu U đã mở. Bạn được dịch chuyển tới Cửu U.");
  }
 };
})());
// --- mo_cua_than_dien.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('mo_cua_than_dien').setDescription('Mở Cửa Thần Điện'),async execute(i){const p=player(i); p.storyFlags=p.storyFlags||{}; p.storyFlags.templeGate=true; p.location='Tứ Tượng Thần Điện'; save(i,p); return reply(i,'✅ Mở Cửa Thần Điện — tiến trình đã được lưu.');} };
})());
// --- tham_bi_canh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tham_bi_canh").setDescription("Khám phá bí cảnh"),
  async execute(i) {
    const p=player(i); p.stats ||= {}; p.stats.explores=(p.stats.explores||0)+1; num(p,"coins",0); p.coins+=300; p.exp=(p.exp||0)+100; save(i,p); return reply(i,"🏯 Khám phá thành công: +300 Gold, +100 EXP.");
  }
 };
})());
// --- trinh_sat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("trinh_sat").setDescription("Trinh sát"),
  async execute(i) {
    const p=player(i);p.scout=(p.scout||0)+1;p.luck=(p.luck||0)+1;save(i,p);return reply(i,"🕵️ Trinh sát thành công, Luck +1.");
  }
 };
})());
// --- van_chuyen.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("van_chuyen").setDescription("Vận chuyển"),
  async execute(i) {
    const p=player(i);p.transport=(p.transport||0)+1;num(p,"coins");p.coins+=200;save(i,p);return reply(i,"🚚 Vận chuyển thành công: +200 Gold.");
  }
 };
})());
// --- vao_cam_dia.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("vao_cam_dia").setDescription("Vào cấm địa"),
  async execute(i) {
    const p=player(i); p.curse=(p.curse||0)+1; p.exp=(p.exp||0)+250; save(i,p); return reply(i,"☠️ Bạn tiến vào Cấm Địa và sống sót, nhận +250 EXP nhưng mang 1 tầng nguyền.");
  }
 };
})());
// --- ve_vi_tri.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("ve_vi_tri").setDescription("Về vị trí lưu"),
  async execute(i) {
    const p=player(i); p.location=p.savedLocation||"Bắc Minh"; save(i,p); return reply(i,`🏠 Đã trở về **${p.location}**.`);
  }
 };
})());
// --- world.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");
const { AREAS, WEATHER, randomWorldEvent } = require("../systems");

return { 
  data: new SlashCommandBuilder().setName("thegioi").setDescription("Xem trạng thái thế giới Huyền Vũ"),
  async execute(interaction) {
    const player = db.getPlayer(interaction.user.id) || db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const weather = WEATHER[Math.floor(Math.random() * WEATHER.length)];
    const event = randomWorldEvent();
    const embed = new EmbedBuilder()
      .setTitle("🌌 HUYỀN VŨ ĐẠI THẾ GIỚI")
      .setDescription(`📍 Vị trí: **${player.location}**\n🌦️ Thời tiết: **${weather}**\n⚠️ Biến cố: **${event}**`)
      .addFields({name:"🗺️ Đại vực",value:`${AREAS.length} khu vực đã được khai báo`,inline:true},
                 {name:"🌠 Thiên Mệnh",value:player.destiny || "Chưa thức tỉnh",inline:true});
    await interaction.reply({embeds:[embed]});
  }
 };
})());
// --- kich_hoat_su_kien_the_gioi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('kich_hoat_su_kien_the_gioi').setDescription('Kích hoạt sự kiện thế giới'),async execute(i){const p=player(i); p.storyFlags=p.storyFlags||{}; p.storyFlags.worldEvent=Date.now(); p.exp=(p.exp||0)+500; save(i,p); return reply(i,'✅ Kích hoạt sự kiện thế giới — tiến trình đã được lưu.');} };
})());
// --- nang_thien_phu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nang_thien_phu").setDescription("Nâng thiên phú"),
  async execute(i) {
    const p=player(i); p.talentLevel=(p.talentLevel||0)+1; p.crit=(p.crit||0)+1; save(i,p); return reply(i,`✨ Thiên phú cấp **${p.talentLevel}**, Crit +1%.`);
  }
 };
})());
// --- rut_tien.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("rut_tien").setDescription("Rút tiền đấu giá"),
  async execute(i) {
    const p=player(i); num(p,"coins"); p.coins+=500; save(i,p); return reply(i,"💰 Rút 500 Gold từ sàn đấu giá.");
  }
 };
})());
// --- them_ky_nang.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("them_ky_nang").setDescription("Học kỹ năng"),
  async execute(i) {
    const p=player(i); p.skills ||= []; if(!p.skills.includes("kyNangCoBan"))p.skills.push("kyNangCoBan"); save(i,p); return reply(i,"📖 Đã học **Kỹ Năng Cơ Bản**.");
  }
 };
})());
// --- vuot_thap.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("vuot_thap").setDescription("Vượt tháp"),
  async execute(i) {
    const p=player(i); p.towerBest=Math.max(p.towerBest||0,p.towerFloor||0); save(i,p); return reply(i,`🏆 Thành tích tháp: **${p.towerBest}** tầng.`);
  }
 };
})());

module.exports = commands;
