const FOUR_SYMBOLS = {
  thanhLong: {
    id: "thanhLong", name: "Thanh Long", element: "Mộc",
    role: "Khống chế/Hồi phục",
    skills: ["Long Uy", "Thanh Mộc Chi Lực", "Long Vũ", "Sinh Mệnh Chi Quang", "Thanh Long Hàng Thế"]
  },
  bachHo: {
    id: "bachHo", name: "Bạch Hổ", element: "Kim",
    role: "Sát thương/Bạo kích",
    skills: ["Hổ Trảo", "Bạch Hổ Sát", "Hổ Khiếu", "Kim Cương Chi Thể", "Bạch Hổ Hàng Thế"]
  },
  chuTuoc: {
    id: "chuTuoc", name: "Chu Tước", element: "Hỏa",
    role: "AOE/Thiêu đốt",
    skills: ["Phượng Hỏa", "Hỏa Vũ", "Liệt Diễm", "Phượng Hoàng Niết Bàn", "Chu Tước Hàng Thế"]
  },
  huyenVu: {
    id: "huyenVu", name: "Huyền Vũ", element: "Thủy",
    role: "Phòng thủ/Phản kích",
    skills: ["Huyền Vũ Thuẫn", "Huyền Thủy", "Huyền Vũ Trấn Hải", "Quy Giáp", "Huyền Vũ Hàng Thế"]
  }
};

function getSymbol(id) { return FOUR_SYMBOLS[id] || null; }

function addSymbol(player, id) {
  if (!FOUR_SYMBOLS[id]) throw new Error("Tứ Tượng không tồn tại");
  player.fourSymbols ||= { active: null, owned: [], resonance: 0, formation: null };
  if (!player.fourSymbols.owned.includes(id)) player.fourSymbols.owned.push(id);
  player.fourSymbols.resonance = player.fourSymbols.owned.length * 25;
  return player;
}

function activateSymbol(player, id) {
  if (!player.fourSymbols?.owned?.includes(id)) throw new Error("Chưa sở hữu Tứ Tượng này");
  player.fourSymbols.active = id;
  return player;
}

function formation(player) {
  const count = player.fourSymbols?.owned?.length || 0;
  if (count >= 4) return "Tứ Tượng Thần Trận";
  if (count >= 3) return "Tam Tượng Trận";
  if (count >= 2) return "Song Tượng Liên Kích";
  return null;
}

module.exports = { FOUR_SYMBOLS, getSymbol, addSymbol, activateSymbol, formation };
