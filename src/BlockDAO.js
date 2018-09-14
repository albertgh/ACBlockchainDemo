const level = require('level');
const chainData = '../chainData';

const SHA256 = require('crypto-js/sha256');


class BlockDAO {
    constructor() {
        this.db = level(chainData);
    }

    getBlock(blockHeight){
        return new Promise((resolve, reject) => {
            this.db.get(blockHeight, function(err, value) {
              if (err) {
                reject(err);
              } else {
                resolve(JSON.parse(value));
              }
          });
        });
    }
    
    writeBlock(block){
        return new Promise((resolve, reject) => {
            block.hash = SHA256(JSON.stringify(block)).toString();
            this.db.put(block.height, JSON.stringify(block), function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
      
    getLastBlock() {
        let lastBlock = {};
        return new Promise((resolve, reject) => {
            this.db.createReadStream({reverse: true, limit: 1}).on('data', function(data) {
                lastBlock = JSON.parse(data.value) 
            }).on('error', function(err) {
                reject(err);
            }).on("close", function () {
                resolve(lastBlock)
            });
        });
    }

    getBlockPreHash(blockHeight) {
        return new Promise((resolve, reject) => {
          if (!(blockHeight > 0)) {
            reject("block height should > 0");
          } else {
            this.getBlock((blockHeight - 1)).then((value) => {
              let block = value;
              let blockHash = block.hash;
              resolve(blockHash);
            }).catch((error) => {
              reject(error);
            });
          }
        });
    }
}

module.exports = BlockDAO;