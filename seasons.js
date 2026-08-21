const SEASONS=[
 {id:1,name:"Tứ Tượng Thức Tỉnh",durationDays:60},
 {id:2,name:"Cửu U Xâm Lấn",durationDays:60},
 {id:3,name:"Thượng Cổ Chiến Trường",durationDays:60}
];
function seasonTier(points){return Math.max(1,Math.floor((points||0)/100)+1);}
module.exports={SEASONS,seasonTier};
