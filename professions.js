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
module.exports={PROFESSIONS,levelFromMastery};
