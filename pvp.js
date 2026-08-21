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
module.exports={ratingChange,rank};
