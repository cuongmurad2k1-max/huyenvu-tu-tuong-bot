const BANNERS = [
 {id:"tuTuong",name:"Tứ Tượng Thức Tỉnh",rate5:0.02,rate4:0.10,pity:50},
 {id:"thanThu",name:"Thần Thú Thượng Cổ",rate5:0.015,rate4:0.12,pity:60},
 {id:"thanBinh",name:"Thần Binh",rate5:0.018,rate4:0.11,pity:55}
];
function roll(banner){
 const r=Math.random(); if(r<banner.rate5)return 5; if(r<banner.rate5+banner.rate4)return 4; return 3;
}
module.exports={BANNERS,roll};
