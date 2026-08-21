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

module.exports = { CHARACTERS, MONSTERS, BOSSES, ITEMS, TITLES, PROFESSIONS };
