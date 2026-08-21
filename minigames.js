function treasureRoll(luck=0){
 const r=Math.random()*100;
 if(r<1+luck/10)return "Thần Bảo";
 if(r<5+luck/5)return "Thánh Bảo";
 if(r<20+luck/2)return "Huyền Bảo";
 return "Rương Thường";
}
function fishingRoll(luck=0){return treasureRoll(luck);}
module.exports={treasureRoll,fishingRoll};
