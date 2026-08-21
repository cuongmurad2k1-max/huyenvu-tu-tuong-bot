// Auto-grouped command bundle. Contains 29 prefix commands.
const commands = [];
// Shared helper inlined to keep the upload to 19 files.
const __db = require("../database");
function player(i) { return __db.getPlayer(i.user.id) || __db.createPlayer(i.user.id, i.user.username, i.user.displayAvatarURL()); }
function save(i,p) { __db.updatePlayer(i.user.id,p); return p; }
function ensure(p,key,fallback) { if (p[key]===undefined || p[key]===null) p[key]=fallback; return p[key]; }
function num(p,key,fallback=0) { p[key]=Number(p[key] ?? fallback); if(!Number.isFinite(p[key])) p[key]=fallback; return p[key]; }
function reply(i,text) { return i.reply({content:text}); }

// --- ban_item.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("ban_item").setDescription("Đăng bán vật phẩm"),
  async execute(i) {
    const p=player(i); p.auction ||= []; p.auction.push({item:"item001",price:1000,createdAt:Date.now()}); save(i,p); return reply(i,"🏪 Đã đăng Di Vật Huyền Vũ 001 giá 1000 Gold.");
  }
 };
})());
// --- chetao.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("chetao")
    .setDescription("Chế tạo"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("⚒️ CHẾ TẠO")
      .setDescription("Xem công thức chế tạo.")
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
// --- cuong_hoa_giap.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("cuong_hoa_giap").setDescription("Cường hóa giáp"),
  async execute(i) {
    const p=player(i); p.enhance ||= {}; p.enhance.armor=(p.enhance.armor||0)+1; p.defense=(p.defense||0)+5; save(i,p); return reply(i,`🔨 Giáp +${p.enhance.armor}, DEF +5.`);
  }
 };
})());
// --- cuong_hoa_vu_khi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("cuong_hoa_vu_khi").setDescription("Cường hóa vũ khí"),
  async execute(i) {
    const p=player(i); p.enhance ||= {}; p.enhance.weapon=(p.enhance.weapon||0)+1; p.attack=(p.attack||0)+5; save(i,p); return reply(i,`🔨 Vũ khí +${p.enhance.weapon}, ATK +5.`);
  }
 };
})());
// --- cuonghoa.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("cuonghoa")
    .setDescription("Hệ thống cường hóa"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🔨 CƯỜNG HÓA")
      .setDescription("Xem hệ thống cường hóa trang bị.")
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
// --- daugia.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("daugia")
    .setDescription("Đấu giá"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("💰 ĐẤU GIÁ")
      .setDescription("Xem sàn đấu giá.")
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
// --- ghep_co_vat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("ghep_co_vat").setDescription("Ghép cổ vật"),
  async execute(i) {
    const p=player(i);if((p.fragments||0)<3)return reply(i,"❌ Cần 3 mảnh.");p.fragments-=3;p.relics=(p.relics||0)+1;save(i,p);return reply(i,`🗿 Ghép thành công Cổ Vật #${p.relics}.`);
  }
 };
})());
// --- luyen_duoc.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("luyen_duoc").setDescription("Luyện dược"),
  async execute(i) {
    const p=player(i); p.inventory ||= []; p.inventory.push("dan_hoi_phuc"); p.stats ||= {}; p.stats.crafts=(p.stats.crafts||0)+1; save(i,p); return reply(i,"🧪 Luyện thành công **Hồi Phục Đan**.");
  }
 };
})());
// --- luyen_khi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("luyen_khi").setDescription("Luyện khí"),
  async execute(i) {
    const p=player(i); p.inventory ||= []; p.inventory.push("vu_khi_linh"); p.stats ||= {}; p.stats.crafts=(p.stats.crafts||0)+1; save(i,p); return reply(i,"🔱 Luyện thành công một **Linh Khí**.");
  }
 };
})());
// --- luyenduoc.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("luyenduoc")
    .setDescription("Luyện dược"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🧪 LUYỆN DƯỢC")
      .setDescription("Xem công thức luyện dược.")
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
// --- luyenkhi.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("luyenkhi")
    .setDescription("Luyện khí"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("🔱 LUYỆN KHÍ")
      .setDescription("Xem công thức luyện khí.")
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
// --- mau_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mau_thu").setDescription("Đấu thú"),
  async execute(i) {
    const p=player(i); p.beastArenaWins=(p.beastArenaWins||0)+1; p.beastBond=(p.beastBond||0)+5; save(i,p); return reply(i,"🐲 Linh thú thắng trận: +5 thân mật.");
  }
 };
})());
// --- mo_ruong.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_ruong").setDescription("Mở rương"),
  async execute(i) {
    const p=player(i); const rewards=["Gold","Gems","Linh Thạch","Di Vật Huyền Vũ"]; const r=rewards[Math.floor(Math.random()*rewards.length)]; if(r==="Gold"){num(p,"coins");p.coins+=800;} if(r==="Gems"){num(p,"gems");p.gems+=15;} if(r==="Linh Thạch"){p.currencies ||= {};num(p.currencies,"spiritStone");p.currencies.spiritStone+=30;} p.inventory ||= []; if(r==="Di Vật Huyền Vũ")p.inventory.push("item001"); save(i,p); return reply(i,`🎁 Rương chứa: **${r}**.`);
  }
 };
})());
// --- mo_vat_pham.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mo_vat_pham").setDescription("Ghi nhận vật phẩm"),
  async execute(i) {
    const p=player(i); p.codex ||= {}; p.codex.items ||= []; if(!p.codex.items.includes("item001"))p.codex.items.push("item001"); save(i,p); return reply(i,"💎 Đã ghi nhận Di Vật Huyền Vũ 001.");
  }
 };
})());
// --- mua_item.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("mua_item").setDescription("Mua vật phẩm"),
  async execute(i) {
    const p=player(i); num(p,"coins"); if(p.coins<1000)return reply(i,"❌ Không đủ 1000 Gold."); p.coins-=1000; p.inventory ||= []; p.inventory.push("item001"); save(i,p); return reply(i,"🛒 Đã mua Di Vật Huyền Vũ 001.");
  }
 };
})());
// --- phu_van.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("phu_van").setDescription("Khắc phù"),
  async execute(i) {
    const p=player(i); p.runes ||= []; p.runes.push("huyenVuRune"); save(i,p); return reply(i,"📜 Khắc thành công **Huyền Vũ Rune**.");
  }
 };
})());
// --- ren_luyen_than_khi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('ren_luyen_than_khi').setDescription('Rèn luyện thần khí'),async execute(i){const p=player(i); p.equipment=p.equipment||{}; p.equipment.relic=p.equipment.relic||{name:'Thần Khí Tứ Tượng',level:0}; p.equipment.relic.level=(p.equipment.relic.level||0)+1; p.attack=(p.attack||0)+35; save(i,p); return reply(i,'✅ Rèn luyện thần khí — tiến trình đã được lưu.');} };
})());
// --- su_dung_item.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("su_dung_item").setDescription("Dùng vật phẩm"),
  async execute(i) {
    const p=player(i);p.inventory ||= [];if(!p.inventory.length)return reply(i,"❌ Túi trống.");const item=p.inventory.pop();p.hp=Math.min(p.maxHp||150,(p.hp||0)+100);save(i,p);return reply(i,`🧪 Đã sử dụng **${item}**, +100 HP.`);
  }
 };
})());
// --- thao_trang_bi.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thao_trang_bi").setDescription("Tháo trang bị"),
  async execute(i) {
    const p=player(i); p.equipment ||= {}; p.equipment.weapon=null; p.equipment.armor=null; save(i,p); return reply(i,"📦 Đã tháo vũ khí và giáp.");
  }
 };
})());
// --- thi_luyen.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thi_luyen").setDescription("Thí luyện"),
  async execute(i) {
    const p=player(i); p.trials=(p.trials||0)+1; p.exp=(p.exp||0)+200; save(i,p); return reply(i,`⚔️ Thí luyện lần ${p.trials}: +200 EXP.`);
  }
 };
})());
// --- thu_thap.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thu_thap").setDescription("Thu thập"),
  async execute(i) {
    const p=player(i); p.gatherCount=(p.gatherCount||0)+1; p.inventory ||= []; p.inventory.push("gather_material"); save(i,p); return reply(i,"🌿 Thu được tài nguyên.");
  }
 };
})());
// --- thu_thap_co_vat.js ---
commands.push((function() {
const { SlashCommandBuilder } = require('discord.js');

return { data:new SlashCommandBuilder().setName('thu_thap_co_vat').setDescription('Thu thập cổ vật'),async execute(i){const p=player(i); p.codex=p.codex||{}; p.codex.items=p.codex.items||[]; p.codex.items.push('co_vat_'+Date.now()); save(i,p); return reply(i,'✅ Thu thập cổ vật — tiến trình đã được lưu.');} };
})());
// --- thu_thap_manh.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thu_thap_manh").setDescription("Thu thập mảnh"),
  async execute(i) {
    const p=player(i);p.fragments=(p.fragments||0)+1;save(i,p);return reply(i,`🧩 Mảnh cổ vật: ${p.fragments}.`);
  }
 };
})());
// --- tinh_luyen.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("tinh_luyen").setDescription("Tinh luyện"),
  async execute(i) {
    const p=player(i); p.refine=(p.refine||0)+1; p.crit=(p.crit||0)+1; save(i,p); return reply(i,`✨ Tinh luyện cấp **${p.refine}**, Crit +1%.`);
  }
 };
})());
// --- kyNang.js ---
commands.push((function() {
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

return { 
  data: new SlashCommandBuilder()
    .setName("kynang")
    .setDescription("Xem kỹ năng"),
  async execute(interaction) {
    const p = db.getPlayer(interaction.user.id) ||
      db.createPlayer(interaction.user.id, interaction.user.username, interaction.user.displayAvatarURL());
    const embed = new EmbedBuilder()
      .setTitle("⚔️ KỸ NĂNG")
      .setDescription("Xem kỹ năng chiến đấu, kỹ năng Tứ Tượng và tuyệt kỹ.")
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
// --- nau_an.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("nau_an").setDescription("Nấu ăn"),
  async execute(i) {
    const p=player(i); p.inventory ||= []; p.inventory.push("food_buff"); save(i,p); return reply(i,"🍲 Nấu thành công món ăn tăng cường.");
  }
 };
})());
// --- san_thu.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("san_thu").setDescription("Săn thú"),
  async execute(i) {
    const p=player(i); p.stats ||= {}; p.stats.wins=(p.stats.wins||0)+1; p.exp=(p.exp||0)+120; save(i,p); return reply(i,"🏹 Hạ một quái thú: +120 EXP.");
  }
 };
})());
// --- thien_kiep.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("thien_kiep").setDescription("Sự kiện thiên kiếp"),
  async execute(i) {
    const p=player(i); const success=Math.random()<.7; if(success){p.attack=(p.attack||0)+50;p.defense=(p.defense||0)+50;save(i,p);return reply(i,"⚡ Vượt thiên kiếp! +50 ATK/DEF.");} p.hp=Math.max(1,Math.floor((p.maxHp||150)*.2));save(i,p);return reply(i,"🌩️ Thiên kiếp thất bại, HP còn 20%.");
  }
 };
})());
// --- xay_lo_ren.js ---
commands.push((function() {
const { SlashCommandBuilder } = require("discord.js");


return { 
  data: new SlashCommandBuilder().setName("xay_lo_ren").setDescription("Xây lò rèn"),
  async execute(i) {
    const p=player(i); p.house ||= {level:1,buildings:{}}; p.house.buildings ||= {}; p.house.buildings.forge=(p.house.buildings.forge||0)+1; save(i,p); return reply(i,`🔥 Lò rèn cấp **${p.house.buildings.forge}**.`);
  }
 };
})());

module.exports = commands;
