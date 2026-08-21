const EVENTS=[
 {id:"bloodMoon",name:"Trăng Máu",duration:60,effect:"Boss xuất hiện nhiều hơn"},
 {id:"dragonWake",name:"Long Mạch Thức Tỉnh",duration:90,effect:"Tài nguyên hiếm tăng"},
 {id:"beastRage",name:"Vạn Yêu Bạo Loạn",duration:120,effect:"Quái vật mạnh hơn, rơi nhiều đồ"},
 {id:"fourSymbols",name:"Tứ Tượng Giáng Thế",duration:180,effect:"Tỷ lệ Tứ Tượng tăng"}
];
function randomEvent(){return EVENTS[Math.floor(Math.random()*EVENTS.length)];}
module.exports={EVENTS,randomEvent};
