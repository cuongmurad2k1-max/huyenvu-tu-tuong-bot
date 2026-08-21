const WORLD_BOSSES=[
 {id:"worldDragon",name:"Hắc Ám Long Thần",hp:50000000,attack:8000,phase:5},
 {id:"worldTurtle",name:"Huyền Vũ Cổ Tổ",hp:75000000,attack:6000,phase:6},
 {id:"worldPhoenix",name:"Chu Tước Niết Bàn",hp:60000000,attack:9000,phase:5}
];
function nextPhase(hp,maxHp,phases){return Math.min(phases,Math.max(1,Math.ceil((hp/maxHp)*phases)));}
module.exports={WORLD_BOSSES,nextPhase};
