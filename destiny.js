const DESTINIES = [
 {id:"chienThan",name:"Chiến Thần Mệnh",rarity:5,bonuses:{attack:12,crit:8}},
 {id:"thamHiem",name:"Thám Hiểm Mệnh",rarity:4,bonuses:{dodge:8,luck:12}},
 {id:"thuongDao",name:"Thương Đạo Mệnh",rarity:4,bonuses:{gold:15,luck:5}},
 {id:"tuTuong",name:"Tứ Tượng Chí Tôn Mệnh",rarity:6,bonuses:{attack:15,defense:15,hp:20}},
 {id:"batKhuat",name:"Bất Khuất Mệnh",rarity:5,bonuses:{defense:15,hp:15}}
];
function getDestiny(id){return DESTINIES.find(x=>x.id===id)||null;}
function awaken(player,id){
 const d=getDestiny(id); if(!d) throw new Error("Thiên Mệnh không tồn tại");
 player.destiny=id; player.destinyProgress=0; return d;
}
module.exports={DESTINIES,getDestiny,awaken};
