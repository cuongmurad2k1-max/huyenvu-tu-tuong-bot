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
module.exports={TALENTS};
