// Combined systems bundle.
const __sys_achievements = (() => {
const ACHIEVEMENTS=[
 ["firstBlood","Trận Chiến Đầu Tiên"],["bossHunter","Kẻ Săn Boss"],["fourSymbols","Tứ Tượng Chi Chủ"],
 ["collector","Nhà Sưu Tầm"],["explorer","Người Khám Phá"],["masterSmith","Thợ Rèn Huyền Thoại"],
 ["guildWar","Chiến Binh Lãnh Thổ"],["survivor","Kẻ Sống Sót"],["worldHero","Anh Hùng Toàn Server"],
 ["secretFinder","Người Tìm Bí Mật"]
].map(([id,name])=>({id,name}));

return { ACHIEVEMENTS };
})();
const __sys_auction = (() => {
function createListing(sellerId,item,price,expiresAt){return {id:`auc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,sellerId,item,price,expiresAt};}
function sortListings(list){return [...list].sort((a,b)=>a.price-b.price);}

return { createListing, sortListings };
})();
const __sys_bloodlines = (() => {
const BLOODLINES = [
 {id:"long",name:"Long Huyết",element:"Mộc",tier:5,passive:"Long Uy"},
 {id:"hoang",name:"Bạch Hổ Huyết",element:"Kim",tier:5,passive:"Sát Lục"},
 {id:"phuong",name:"Phượng Huyết",element:"Hỏa",tier:5,passive:"Niết Bàn"},
 {id:"quy",name:"Huyền Vũ Huyết",element:"Thủy",tier:5,passive:"Huyền Giáp"},
 {id:"congbang",name:"Côn Bằng Huyết",element:"Phong",tier:5,passive:"Không Độn"},
 {id:"kyLan",name:"Kỳ Lân Huyết",element:"Thổ",tier:5,passive:"Thánh Vực"},
 {id:"kimO",name:"Kim Ô Huyết",element:"Hỏa",tier:5,passive:"Thái Dương"},
 {id:"cuuVi",name:"Cửu Vĩ Huyết",element:"Mị",tier:4,passive:"Ảo Cảnh"},
 {id:"thaoThiet",name:"Thao Thiết Huyết",element:"Hắc Ám",tier:5,passive:"Thôn Phệ"},
 {id:"bachTrach",name:"Bạch Trạch Huyết",element:"Linh",tier:5,passive:"Tri Thức"}
];

return { BLOODLINES };
})();
const __sys_combat = (() => {
function elementReaction(a, b) {
  const pairs = new Set([
    ["Hỏa","Thủy"].sort().join("|"),
    ["Mộc","Hỏa"].sort().join("|"),
    ["Thủy","Lôi"].sort().join("|"),
    ["Băng","Thủy"].sort().join("|")
  ]);
  const key = [a,b].sort().join("|");
  if (key === ["Hỏa","Thủy"].sort().join("|")) return "Hơi Nước";
  if (key === ["Hỏa","Mộc"].sort().join("|")) return "Thiêu Đốt";
  if (key === ["Lôi","Thủy"].sort().join("|")) return "Điện Kích";
  if (key === ["Băng","Thủy"].sort().join("|")) return "Đóng Băng";
  return null;
}

function calculateDamage(attacker, defender, skill = {}) {
  const atk = (attacker.attack || 0) * (skill.multiplier || 1);
  const pen = Math.min(0.8, (attacker.penetration || 0) / 100);
  const defense = (defender.defense || 0) * (1 - pen);
  let damage = Math.max(1, atk - defense * 0.45);
  let critical = Math.random() * 100 < (attacker.crit || 0);
  if (critical) damage *= (attacker.critDamage || 150) / 100;
  return { damage: Math.floor(damage), critical };
}

function applyStatus(target, status, duration = 2) {
  target.statuses ||= [];
  target.statuses.push({ status, duration });
  return target;
}

function tickStatuses(target) {
  if (!target.statuses) return [];
  const results = [];
  target.statuses = target.statuses.filter(s => {
    if (["burn","bleed","poison"].includes(s.status)) {
      const amount = Math.max(1, Math.floor((target.maxHp || 100) * 0.03));
      target.hp = Math.max(0, target.hp - amount);
      results.push({ status: s.status, damage: amount });
    }
    s.duration--;
    return s.duration > 0;
  });
  return results;
}


return { calculateDamage, applyStatus, tickStatuses, elementReaction };
})();
const __sys_content = (() => {
const CHARACTERS = [
  {id:"longNu", name:"Long Nữ Thanh Minh", role:"Hỗ trợ", element:"Mộc", rarity:5},
  {id:"bachHoSu", name:"Bạch Hổ Sứ", role:"Chiến đấu", element:"Kim", rarity:5},
  {id:"chuTuocNu", name:"Chu Tước Linh", role:"Pháp thuật", element:"Hỏa", rarity:5},
  {id:"huyenVuSu", name:"Huyền Vũ Sứ", role:"Phòng thủ", element:"Thủy", rarity:5},
  {id:"voDanhKiemKhach", name:"Vô Danh Kiếm Khách", role:"Công kích", element:"Phong", rarity:4},
  {id:"thuongNhan", name:"Thương Nhân Bắc Minh", role:"Thương mại", element:"Không", rarity:3}
];

const MONSTERS = [
  {id:"bacMinhLang",name:"Bắc Minh Lang",hp:180,attack:22,defense:8},
  {id:"hoaLinh",name:"Hỏa Linh",hp:250,attack:30,defense:12},
  {id:"huyenQuy",name:"Huyền Quy",hp:600,attack:28,defense:40},
  {id:"bachHoMaThu",name:"Bạch Hổ Ma Thú",hp:1200,attack:85,defense:55},
  {id:"thanhLongThu",name:"Thanh Long Thú",hp:1800,attack:110,defense:70}
];

const BOSSES = [
  {id:"hacLongThan",name:"Hắc Ám Long Thần",hp:500000,attack:1800,defense:900,phases:4},
  {id:"cuuUMaVuong",name:"Cửu U Ma Vương",hp:750000,attack:2200,defense:1100,phases:4},
  {id:"tuTuongThanThu",name:"Tứ Tượng Thần Thú",hp:1200000,attack:3500,defense:1800,phases:5}
];

const ITEMS = [
  {id:"tuTuongChiTam",name:"Tứ Tượng Chi Tâm",rarity:"Tứ Tượng",type:"quest"},
  {id:"longHuyet",name:"Thanh Long Huyết",rarity:"Thánh",type:"material"},
  {id:"bachHoCau",name:"Bạch Hổ Cốt",rarity:"Thánh",type:"material"},
  {id:"chuTuocVũ",name:"Chu Tước Vũ",rarity:"Thánh",type:"material"},
  {id:"huyenVuGiáp",name:"Huyền Vũ Giáp",rarity:"Thánh",type:"equipment"},
  {id:"ngocCuongHoa",name:"Ngọc Cường Hóa",rarity:"Linh",type:"upgrade"}
];

const TITLES = [
  "Kẻ Săn Boss","Chiến Thần","Tứ Tượng Chi Chủ","Vạn Thú Chi Vương",
  "Người Khám Phá","Thợ Rèn Huyền Thoại","Đại Thương Nhân","Kẻ Sống Sót",
  "Người Mở Cấm Địa"
];

const PROFESSIONS = ["Thợ rèn","Luyện dược sư","Luyện khí sư","Thợ săn","Ngư dân","Khai khoáng","Phù sư","Thương nhân","Giám định sư"];


return { CHARACTERS, MONSTERS, BOSSES, ITEMS, TITLES, PROFESSIONS };
})();
const __sys_crafting = (() => {
const RECIPES = [
 {id:"huyenVuGiap",name:"Huyền Vũ Giáp",profession:"artifact",materials:{huyenVuMai:20,ngocCuongHoa:10}},
 {id:"thanhLongDan",name:"Thanh Long Sinh Mệnh Đan",profession:"alchemy",materials:{longHuyet:5,linhThao:10}},
 {id:"bachHoDao",name:"Bạch Hổ Sát Đao",profession:"blacksmith",materials:{bachHoCau:15,iron:30}},
 {id:"chuTuocPhu",name:"Chu Tước Thần Phù",profession:"rune",materials:{chuTuocVu:8,linhThach:100}},
 {id:"tuTuongTran",name:"Tứ Tượng Trận Bàn",profession:"artifact",materials:{tuTuongChiTam:1,ancientMetal:20}}
];
function getRecipe(id){return RECIPES.find(x=>x.id===id)||null;}

return { RECIPES, getRecipe };
})();
const __sys_daily = (() => {
const DAILY=[
 {id:"login",name:"Đăng nhập hôm nay",reward:{gold:500}},
 {id:"explore",name:"Khám phá 3 lần",reward:{gems:20}},
 {id:"boss",name:"Đánh Boss",reward:{spiritStone:10}},
 {id:"pvp",name:"Thắng PvP",reward:{merit:25}}
];

return { DAILY };
})();
const __sys_destiny = (() => {
const DESTINIES = [
 {id:"chienThan",name:"Chiến Thần Mệnh",rarity:5,bonuses:{attack:12,crit:8}},
 {id:"thamHiem",name:"Thám Hiểm Mệnh",rarity:4,bonuses:{dodge:8,luck:12}},
 {id:"thuongDao",name:"Thương Đạo Mệnh",rarity:4,bonuses:{gold:15,luck:5}},
 {id:"tuTuong",name:"Tứ Tượng Chí Tôn Mệnh",rarity:6,bonuses:{attack:15,defense:15,hp:20}},
 {id:"batKhuat",name:"Bất Khuất Mệnh",rarity:5,bonuses:{defense:15,hp:15}}
];
function getDestiny(id){return DESTINIES.find(x=>x.id===id)||null;}
function awaken(player,id){
 const d=getDestiny(id); if(!d) throw new Error("Thiên Mệnh không tồn tại");
 player.destiny=id; player.destinyProgress=0; return d;
}

return { DESTINIES, getDestiny, awaken };
})();
const __sys_dialogue = (() => {
const DIALOGUES={
 mysterious:[
  "Ngươi thật sự muốn biết bí mật của Tứ Tượng sao?",
  "Đừng tin tất cả những gì ngươi nhìn thấy.",
  "Cánh cửa Cửu U chỉ mở khi thế giới bước vào Trăng Máu."
 ],
 merchant:[
  "Hàng hôm nay vừa tới từ Đông Hải.",
  "Nếu ngươi có đủ danh vọng, ta có món đồ không bán cho người thường."
 ]
};

return { DIALOGUES };
})();
const __sys_economy = (() => {
const TAX={auction:0.05,trade:0.02,guild:0.03};
function afterTax(price,type="trade"){return Math.floor(price*(1-(TAX[type]||0)));}
function combatPower(p){
 return Math.floor((p.attack||0)*2+(p.defense||0)*1.5+(p.maxHp||0)*0.2+(p.speed||0)*3+(p.crit||0)*5);
}

return { TAX, afterTax, combatPower };
})();
const __sys_events = (() => {
const EVENTS=[
 {id:"bloodMoon",name:"Trăng Máu",duration:60,effect:"Boss xuất hiện nhiều hơn"},
 {id:"dragonWake",name:"Long Mạch Thức Tỉnh",duration:90,effect:"Tài nguyên hiếm tăng"},
 {id:"beastRage",name:"Vạn Yêu Bạo Loạn",duration:120,effect:"Quái vật mạnh hơn, rơi nhiều đồ"},
 {id:"fourSymbols",name:"Tứ Tượng Giáng Thế",duration:180,effect:"Tỷ lệ Tứ Tượng tăng"}
];
function randomEvent(){return EVENTS[Math.floor(Math.random()*EVENTS.length)];}

return { EVENTS, randomEvent };
})();
const __sys_fourSymbols = (() => {
const FOUR_SYMBOLS = {
  thanhLong: {
    id: "thanhLong", name: "Thanh Long", element: "Mộc",
    role: "Khống chế/Hồi phục",
    skills: ["Long Uy", "Thanh Mộc Chi Lực", "Long Vũ", "Sinh Mệnh Chi Quang", "Thanh Long Hàng Thế"]
  },
  bachHo: {
    id: "bachHo", name: "Bạch Hổ", element: "Kim",
    role: "Sát thương/Bạo kích",
    skills: ["Hổ Trảo", "Bạch Hổ Sát", "Hổ Khiếu", "Kim Cương Chi Thể", "Bạch Hổ Hàng Thế"]
  },
  chuTuoc: {
    id: "chuTuoc", name: "Chu Tước", element: "Hỏa",
    role: "AOE/Thiêu đốt",
    skills: ["Phượng Hỏa", "Hỏa Vũ", "Liệt Diễm", "Phượng Hoàng Niết Bàn", "Chu Tước Hàng Thế"]
  },
  huyenVu: {
    id: "huyenVu", name: "Huyền Vũ", element: "Thủy",
    role: "Phòng thủ/Phản kích",
    skills: ["Huyền Vũ Thuẫn", "Huyền Thủy", "Huyền Vũ Trấn Hải", "Quy Giáp", "Huyền Vũ Hàng Thế"]
  }
};

function getSymbol(id) { return FOUR_SYMBOLS[id] || null; }

function addSymbol(player, id) {
  if (!FOUR_SYMBOLS[id]) throw new Error("Tứ Tượng không tồn tại");
  player.fourSymbols ||= { active: null, owned: [], resonance: 0, formation: null };
  if (!player.fourSymbols.owned.includes(id)) player.fourSymbols.owned.push(id);
  player.fourSymbols.resonance = player.fourSymbols.owned.length * 25;
  return player;
}

function activateSymbol(player, id) {
  if (!player.fourSymbols?.owned?.includes(id)) throw new Error("Chưa sở hữu Tứ Tượng này");
  player.fourSymbols.active = id;
  return player;
}

function formation(player) {
  const count = player.fourSymbols?.owned?.length || 0;
  if (count >= 4) return "Tứ Tượng Thần Trận";
  if (count >= 3) return "Tam Tượng Trận";
  if (count >= 2) return "Song Tượng Liên Kích";
  return null;
}


return { FOUR_SYMBOLS, getSymbol, addSymbol, activateSymbol, formation };
})();
const __sys_gacha = (() => {
const BANNERS = [
 {id:"tuTuong",name:"Tứ Tượng Thức Tỉnh",rate5:0.02,rate4:0.10,pity:50},
 {id:"thanThu",name:"Thần Thú Thượng Cổ",rate5:0.015,rate4:0.12,pity:60},
 {id:"thanBinh",name:"Thần Binh",rate5:0.018,rate4:0.11,pity:55}
];
function roll(banner){
 const r=Math.random(); if(r<banner.rate5)return 5; if(r<banner.rate5+banner.rate4)return 4; return 3;
}

return { BANNERS, roll };
})();
const __sys_guild = (() => {
const GUILD_RANKS=["Tân Binh","Thành Viên","Tinh Anh","Đường Chủ","Trưởng Lão","Phó Bang Chủ","Bang Chủ"];
const GUILD_BUILDINGS=["Kho Bang","Lò Rèn","Thương Hội","Tháp Nghiên Cứu","Thánh Điện","Tường Thành","Boss Sào Huyệt"];
function createGuild(name,ownerId){return {name,ownerId,level:1,exp:0,members:[ownerId],ranks:{[ownerId]:"Bang Chủ"},buildings:{},territories:[],warScore:0};}

return { GUILD_RANKS, GUILD_BUILDINGS, createGuild };
})();
const __sys_housing = (() => {
const BUILDINGS=[
 {id:"house",name:"Nhà Chính",max:20},
 {id:"forge",name:"Lò Rèn",max:20},
 {id:"garden",name:"Linh Dược Viên",max:20},
 {id:"stable",name:"Thú Viên",max:20},
 {id:"treasury",name:"Kho Báu",max:20},
 {id:"training",name:"Phòng Huấn Luyện",max:20}
];

return { BUILDINGS };
})();
const __sys_investigation = (() => {
function newCase(title,suspects,clues){return {title,suspects,clues,found:[],solved:false};}
function addClue(caseData,clue){if(!caseData.found.includes(clue))caseData.found.push(clue);return caseData;}

return { newCase, addClue };
})();
const __sys_mail = (() => {
function createMail(title,content,rewards=[]){return {id:`mail_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,title,content,rewards,read:false,createdAt:Date.now()};}
function sendMail(player,title,content,rewards=[]){player.mail ||= []; player.mail.push(createMail(title,content,rewards)); return player;}

return { createMail, sendMail };
})();
const __sys_minigames = (() => {
function treasureRoll(luck=0){
 const r=Math.random()*100;
 if(r<1+luck/10)return "Thần Bảo";
 if(r<5+luck/5)return "Thánh Bảo";
 if(r<20+luck/2)return "Huyền Bảo";
 return "Rương Thường";
}
function fishingRoll(luck=0){return treasureRoll(luck);}

return { treasureRoll, fishingRoll };
})();
const __sys_party = (() => {
function createParty(ownerId){return {ownerId,members:[ownerId],max:5,ready:{[ownerId]:true},status:"waiting"};}
function addMember(party,id){if(party.members.length>=party.max)return false;if(!party.members.includes(id))party.members.push(id);return true;}

return { createParty, addMember };
})();
const __sys_professions = (() => {
const PROFESSIONS = [
 {id:"blacksmith",name:"Thợ Rèn",max:1000},
 {id:"alchemy",name:"Luyện Dược Sư",max:1000},
 {id:"artifact",name:"Luyện Khí Sư",max:1000},
 {id:"hunter",name:"Thợ Săn",max:1000},
 {id:"fishing",name:"Ngư Dân",max:1000},
 {id:"mining",name:"Khai Khoáng",max:1000},
 {id:"rune",name:"Phù Sư",max:1000},
 {id:"merchant",name:"Thương Nhân",max:1000},
 {id:"appraiser",name:"Giám Định Sư",max:1000}
];
function levelFromMastery(x){return Math.max(1,Math.floor((x||0)/100)+1);}

return { PROFESSIONS, levelFromMastery };
})();
const __sys_puzzles = (() => {
const PUZZLES=[
 {id:"p1",question:"Tượng nào đại diện phương Bắc?",answers:["Huyền Vũ"]},
 {id:"p2",question:"Tượng nào đại diện phương Nam?",answers:["Chu Tước"]},
 {id:"p3",question:"Tượng nào đại diện phương Đông?",answers:["Thanh Long"]},
 {id:"p4",question:"Tượng nào đại diện phương Tây?",answers:["Bạch Hổ"]}
];
function check(puzzle,answer){return puzzle.answers.some(x=>x.toLowerCase()===String(answer).toLowerCase());}

return { PUZZLES, check };
})();
const __sys_pvp = (() => {
function ratingChange(win, rating){
 const delta=win?25:-18; return Math.max(0,rating+delta);
}
function rank(r){
 if(r<1000)return "Tân Binh";
 if(r<1300)return "Đồng";
 if(r<1600)return "Bạc";
 if(r<1900)return "Vàng";
 if(r<2200)return "Bạch Kim";
 if(r<2500)return "Kim Cương";
 return "Thần Vương";
}

return { ratingChange, rank };
})();
const __sys_quests = (() => {
const QUESTS=[
 {id:"q001",name:"Bắc Minh Thức Tỉnh",type:"story",objectives:["khám phá Bắc Minh","gặp NPC bí ẩn"]},
 {id:"q002",name:"Mảnh Tứ Tượng",type:"main",objectives:["tìm Tứ Tượng Chi Tâm"]},
 {id:"q003",name:"Hắc Ám Xâm Lấn",type:"world",objectives:["đánh bại 10 quái Cửu U"]},
 {id:"q004",name:"Thợ Săn Boss",type:"achievement",objectives:["hạ 5 Boss"]},
 {id:"q005",name:"Bốn Linh Thức Tỉnh",type:"main",objectives:["sở hữu đủ 4 Tượng"]}
];

return { QUESTS };
})();
const __sys_raid = (() => {
const RAID_TIERS=[
 {id:"raid5",name:"Raid 5 Người",party:5,hp:1000000},
 {id:"raid10",name:"Raid 10 Người",party:10,hp:5000000},
 {id:"raid20",name:"Raid 20 Người",party:20,hp:25000000}
];

return { RAID_TIERS };
})();
const __sys_rankings = (() => {
const CATEGORIES=["level","combatPower","pvp","bossDamage","wealth","guild","fourSymbols","beasts","achievements","reputation"];
function sortPlayers(players,category){
 return [...players].sort((a,b)=>{
  const va=a[category]??a.stats?.[category]??a.currencies?.gold??0;
  const vb=b[category]??b.stats?.[category]??b.currencies?.gold??0;
  return vb-va;
 });
}

return { CATEGORIES, sortPlayers };
})();
const __sys_seasons = (() => {
const SEASONS=[
 {id:1,name:"Tứ Tượng Thức Tỉnh",durationDays:60},
 {id:2,name:"Cửu U Xâm Lấn",durationDays:60},
 {id:3,name:"Thượng Cổ Chiến Trường",durationDays:60}
];
function seasonTier(points){return Math.max(1,Math.floor((points||0)/100)+1);}

return { SEASONS, seasonTier };
})();
const __sys_secrets = (() => {
const SECRETS=[
 {id:"npcShadow",name:"NPC Bóng Tối",condition:"đến Cửu U lúc Trăng Máu"},
 {id:"hiddenBoss",name:"Boss Ẩn Hắc Long",condition:"có Long Huyết và vào Long Uyên"},
 {id:"secretEnding",name:"Kết Thúc Bí Mật",condition:"hoàn thành 7 nhiệm vụ ẩn"},
 {id:"ancientRoom",name:"Phòng Thượng Cổ",condition:"giải đúng 3 câu đố"}
];

return { SECRETS };
})();
const __sys_talents = (() => {
const TALENTS = [
 ["chienDau","Chiến Đấu Thiên Tài","combat"],
 ["vanThu","Vạn Thú Thân Hòa","beast"],
 ["mayMan","Thiên Mệnh May Mắn","luck"],
 ["batKhuat","Bất Khuất","survival"],
 ["luyenKhi","Luyện Khí Thiên Tài","craft"],
 ["luyenDuoc","Luyện Dược Thiên Tài","alchemy"],
 ["thuongNhan","Thương Nhân","trade"],
 ["thamHiem","Nhà Thám Hiểm","explore"],
 ["sanBoss","Kẻ Săn Boss","boss"],
 ["phuSu","Phù Văn Sư","rune"]
].map(([id,name,type])=>({id,name,type}));

return { TALENTS };
})();
const __sys_territory = (() => {
const TERRITORIES=[
 "Thanh Long Thành","Bạch Hổ Thành","Chu Tước Thành","Huyền Vũ Thành",
 "Long Uyên","Phượng Hoàng Cốc","Bạch Hổ Thần Sơn","Huyền Vũ Hải",
 "Cửu U Cổng","Thiên Ngoại Thành"
];
function warScore(action){return {kill:20,boss:100,flag:50,garrison:10,quest:30}[action]||0;}

return { TERRITORIES, warScore };
})();
const __sys_world = (() => {
const AREAS = [
  "Bắc Minh","Đông Hải","Nam Hoang","Tây Vực","Trung Châu",
  "Thanh Long Vực","Bạch Hổ Vực","Chu Tước Vực","Huyền Vũ Vực",
  "Vạn Yêu Sơn","Long Uyên","Phượng Hoàng Cốc","Bạch Hổ Thần Sơn",
  "Huyền Vũ Hải","Cửu U","Thiên Ngoại Thiên","Thượng Cổ Chiến Trường",
  "Vạn Cổ Bí Cảnh","Tứ Tượng Thánh Địa","Cấm Khu Sinh Mệnh"
];

const WEATHER = ["Quang đãng","Mưa","Bão","Sương mù","Trăng máu","Nhật thực","Nguyệt thực"];

function randomWorldEvent() {
  const events = [
    "Hắc Ám Giáng Thế","Long Mạch Đứt Gãy","Vạn Yêu Bạo Loạn",
    "Tứ Tượng Thức Tỉnh","Thiên Ngoại Xâm Lấn","Cửu U Mở Cửa",
    "Thượng Cổ Thần Thú Xuất Thế"
  ];
  return events[Math.floor(Math.random() * events.length)];
}


return { AREAS, WEATHER, randomWorldEvent };
})();
const __sys_worldBoss = (() => {
const WORLD_BOSSES=[
 {id:"worldDragon",name:"Hắc Ám Long Thần",hp:50000000,attack:8000,phase:5},
 {id:"worldTurtle",name:"Huyền Vũ Cổ Tổ",hp:75000000,attack:6000,phase:6},
 {id:"worldPhoenix",name:"Chu Tước Niết Bàn",hp:60000000,attack:9000,phase:5}
];
function nextPhase(hp,maxHp,phases){return Math.min(phases,Math.max(1,Math.ceil((hp/maxHp)*phases)));}

return { WORLD_BOSSES, nextPhase };
})();
module.exports = {
  ACHIEVEMENTS: __sys_achievements.ACHIEVEMENTS,
  createListing: __sys_auction.createListing,
  sortListings: __sys_auction.sortListings,
  BLOODLINES: __sys_bloodlines.BLOODLINES,
  calculateDamage: __sys_combat.calculateDamage,
  applyStatus: __sys_combat.applyStatus,
  tickStatuses: __sys_combat.tickStatuses,
  elementReaction: __sys_combat.elementReaction,
  CHARACTERS: __sys_content.CHARACTERS,
  MONSTERS: __sys_content.MONSTERS,
  BOSSES: __sys_content.BOSSES,
  ITEMS: __sys_content.ITEMS,
  TITLES: __sys_content.TITLES,
  PROFESSIONS: __sys_content.PROFESSIONS,
  RECIPES: __sys_crafting.RECIPES,
  getRecipe: __sys_crafting.getRecipe,
  DAILY: __sys_daily.DAILY,
  DESTINIES: __sys_destiny.DESTINIES,
  getDestiny: __sys_destiny.getDestiny,
  awaken: __sys_destiny.awaken,
  DIALOGUES: __sys_dialogue.DIALOGUES,
  TAX: __sys_economy.TAX,
  afterTax: __sys_economy.afterTax,
  combatPower: __sys_economy.combatPower,
  EVENTS: __sys_events.EVENTS,
  randomEvent: __sys_events.randomEvent,
  FOUR_SYMBOLS: __sys_fourSymbols.FOUR_SYMBOLS,
  getSymbol: __sys_fourSymbols.getSymbol,
  addSymbol: __sys_fourSymbols.addSymbol,
  activateSymbol: __sys_fourSymbols.activateSymbol,
  formation: __sys_fourSymbols.formation,
  BANNERS: __sys_gacha.BANNERS,
  roll: __sys_gacha.roll,
  GUILD_RANKS: __sys_guild.GUILD_RANKS,
  GUILD_BUILDINGS: __sys_guild.GUILD_BUILDINGS,
  createGuild: __sys_guild.createGuild,
  BUILDINGS: __sys_housing.BUILDINGS,
  newCase: __sys_investigation.newCase,
  addClue: __sys_investigation.addClue,
  createMail: __sys_mail.createMail,
  sendMail: __sys_mail.sendMail,
  treasureRoll: __sys_minigames.treasureRoll,
  fishingRoll: __sys_minigames.fishingRoll,
  createParty: __sys_party.createParty,
  addMember: __sys_party.addMember,
  PROFESSIONS: __sys_professions.PROFESSIONS,
  levelFromMastery: __sys_professions.levelFromMastery,
  PUZZLES: __sys_puzzles.PUZZLES,
  check: __sys_puzzles.check,
  ratingChange: __sys_pvp.ratingChange,
  rank: __sys_pvp.rank,
  QUESTS: __sys_quests.QUESTS,
  RAID_TIERS: __sys_raid.RAID_TIERS,
  CATEGORIES: __sys_rankings.CATEGORIES,
  sortPlayers: __sys_rankings.sortPlayers,
  SEASONS: __sys_seasons.SEASONS,
  seasonTier: __sys_seasons.seasonTier,
  SECRETS: __sys_secrets.SECRETS,
  TALENTS: __sys_talents.TALENTS,
  TERRITORIES: __sys_territory.TERRITORIES,
  warScore: __sys_territory.warScore,
  AREAS: __sys_world.AREAS,
  WEATHER: __sys_world.WEATHER,
  randomWorldEvent: __sys_world.randomWorldEvent,
  WORLD_BOSSES: __sys_worldBoss.WORLD_BOSSES,
  nextPhase: __sys_worldBoss.nextPhase
};
