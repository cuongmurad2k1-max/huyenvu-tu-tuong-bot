const PUZZLES=[
 {id:"p1",question:"Tượng nào đại diện phương Bắc?",answers:["Huyền Vũ"]},
 {id:"p2",question:"Tượng nào đại diện phương Nam?",answers:["Chu Tước"]},
 {id:"p3",question:"Tượng nào đại diện phương Đông?",answers:["Thanh Long"]},
 {id:"p4",question:"Tượng nào đại diện phương Tây?",answers:["Bạch Hổ"]}
];
function check(puzzle,answer){return puzzle.answers.some(x=>x.toLowerCase()===String(answer).toLowerCase());}
module.exports={PUZZLES,check};
