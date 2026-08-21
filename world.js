const AREAS = [
  "Bắc Minh","Đông Hải","Nam Hoang","Tây Vực","Trung Châu",
  "Thanh Long Vực","Bạch Hổ Vực","Chu Tước Vực","Huyền Vũ Vực",
  "Vạn Yêu Sơn","Long Uyên","Phượng Hoàng Cốc","Bạch Hổ Thần Sơn",
  "Huyền Vũ Hải","Cửu U","Thiên Ngoại Thiên","Thượng Cổ Chiến Trường",
  "Vạn Cổ Bí Cảnh","Tứ Tượng Thánh Địa","Cấm Khu Sinh Mệnh"
];

const WEATHER = ["Quang đãng","Mưa","Bão","Sương mù","Trăng máu","Nhật thực","Nguyệt thực"];

function randomWorldEvent() {
  const events = [
    "Hắc Ám Giáng Thế","Long Mạch Đứt Gãy","Vạn Yêu Bạo Loạn",
    "Tứ Tượng Thức Tỉnh","Thiên Ngoại Xâm Lấn","Cửu U Mở Cửa",
    "Thượng Cổ Thần Thú Xuất Thế"
  ];
  return events[Math.floor(Math.random() * events.length)];
}

module.exports = { AREAS, WEATHER, randomWorldEvent };
