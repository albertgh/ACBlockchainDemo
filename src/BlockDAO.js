const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
    db.put(key, value, function(err) {
      if (err) return console.log('Block ' + key + ' submission failed', err);
    })
}
  
// Get data from levelDB with key
function getLevelDBData(key){
    db.get(key, function(err, value) {
        if (err) return console.log('Not found!', err);
        console.log('Value = ' + value);
    })
}
