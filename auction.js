function createListing(sellerId,item,price,expiresAt){return {id:`auc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,sellerId,item,price,expiresAt};}
function sortListings(list){return [...list].sort((a,b)=>a.price-b.price);}
module.exports={createListing,sortListings};
