const GUILD_RANKS=["Tân Binh","Thành Viên","Tinh Anh","Đường Chủ","Trưởng Lão","Phó Bang Chủ","Bang Chủ"];
const GUILD_BUILDINGS=["Kho Bang","Lò Rèn","Thương Hội","Tháp Nghiên Cứu","Thánh Điện","Tường Thành","Boss Sào Huyệt"];
function createGuild(name,ownerId){return {name,ownerId,level:1,exp:0,members:[ownerId],ranks:{[ownerId]:"Bang Chủ"},buildings:{},territories:[],warScore:0};}
module.exports={GUILD_RANKS,GUILD_BUILDINGS,createGuild};
