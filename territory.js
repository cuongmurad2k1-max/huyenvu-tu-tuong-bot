const TERRITORIES=[
 "Thanh Long Thành","Bạch Hổ Thành","Chu Tước Thành","Huyền Vũ Thành",
 "Long Uyên","Phượng Hoàng Cốc","Bạch Hổ Thần Sơn","Huyền Vũ Hải",
 "Cửu U Cổng","Thiên Ngoại Thành"
];
function warScore(action){return {kill:20,boss:100,flag:50,garrison:10,quest:30}[action]||0;}
module.exports={TERRITORIES,warScore};
