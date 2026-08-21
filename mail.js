function createMail(title,content,rewards=[]){return {id:`mail_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,title,content,rewards,read:false,createdAt:Date.now()};}
function sendMail(player,title,content,rewards=[]){player.mail ||= []; player.mail.push(createMail(title,content,rewards)); return player;}
module.exports={createMail,sendMail};
