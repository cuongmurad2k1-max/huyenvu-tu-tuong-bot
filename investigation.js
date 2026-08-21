function newCase(title,suspects,clues){return {title,suspects,clues,found:[],solved:false};}
function addClue(caseData,clue){if(!caseData.found.includes(clue))caseData.found.push(clue);return caseData;}
module.exports={newCase,addClue};
