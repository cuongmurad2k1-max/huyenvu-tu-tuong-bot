function createParty(ownerId){return {ownerId,members:[ownerId],max:5,ready:{[ownerId]:true},status:"waiting"};}
function addMember(party,id){if(party.members.length>=party.max)return false;if(!party.members.includes(id))party.members.push(id);return true;}
module.exports={createParty,addMember};
