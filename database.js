const fs=require("fs"),path=require("path");
const DIR=path.join(__dirname,"data");
const f=n=>path.join(DIR,n);
function read(n,d={}){if(!fs.existsSync(DIR))fs.mkdirSync(DIR,{recursive:true});if(!fs.existsSync(f(n)))fs.writeFileSync(f(n),JSON.stringify(d,null,2));try{return JSON.parse(fs.readFileSync(f(n),"utf8"))}catch{return d}}
function save(n,d){if(!fs.existsSync(DIR))fs.mkdirSync(DIR,{recursive:true});fs.writeFileSync(f(n),JSON.stringify(d,null,2))}
function getPlayer(id){return read("players.json")[id]||null}
function createPlayer(id,name,avatar=""){let d=read("players.json");if(d[id])return d[id];d[id]={id,username:name,avatar,level:1,exp:0,coins:2000,hp:150,maxHp:150,energy:120,maxEnergy:120,attack:15,defense:15,speed:10,crit:5,faction:null,bloodline:null,inventory:[],equipment:{weapon:null,armor:null,relic:null},beasts:[],skills:[],quests:[],achievements:[],storyChapter:1,location:"Bắc Minh",guild:null,stats:{wins:0,losses:0,bosses:0,explores:0,crafts:0,quests:0}};save("players.json",d);return d[id]}
function mutate(id,fn){let d=read("players.json");if(!d[id])return null;d[id]=fn(d[id])||d[id];save("players.json",d);return d[id]}
function players(){return Object.values(read("players.json"))}
function data(n,d={}){return read(n,d)}
function saveData(n,d){save(n,d)}
module.exports={getPlayer,createPlayer,mutate,players,data,saveData};