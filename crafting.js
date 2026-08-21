const RECIPES = [
 {id:"huyenVuGiap",name:"Huyền Vũ Giáp",profession:"artifact",materials:{huyenVuMai:20,ngocCuongHoa:10}},
 {id:"thanhLongDan",name:"Thanh Long Sinh Mệnh Đan",profession:"alchemy",materials:{longHuyet:5,linhThao:10}},
 {id:"bachHoDao",name:"Bạch Hổ Sát Đao",profession:"blacksmith",materials:{bachHoCau:15,iron:30}},
 {id:"chuTuocPhu",name:"Chu Tước Thần Phù",profession:"rune",materials:{chuTuocVu:8,linhThach:100}},
 {id:"tuTuongTran",name:"Tứ Tượng Trận Bàn",profession:"artifact",materials:{tuTuongChiTam:1,ancientMetal:20}}
];
function getRecipe(id){return RECIPES.find(x=>x.id===id)||null;}
module.exports={RECIPES,getRecipe};
