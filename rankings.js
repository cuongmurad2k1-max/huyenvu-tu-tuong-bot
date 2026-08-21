const CATEGORIES=["level","combatPower","pvp","bossDamage","wealth","guild","fourSymbols","beasts","achievements","reputation"];
function sortPlayers(players,category){
 return [...players].sort((a,b)=>{
  const va=a[category]??a.stats?.[category]??a.currencies?.gold??0;
  const vb=b[category]??b.stats?.[category]??b.currencies?.gold??0;
  return vb-va;
 });
}
module.exports={CATEGORIES,sortPlayers};
