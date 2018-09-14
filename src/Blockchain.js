const SHA256 = require('crypto-js/sha256');

const Block = require('./Block');
const BlockDAO = require('./BlockDAO');


class Blockchain {
    constructor() {
        this.chainDB = new BlockDAO();
        this.chainDB.getLastBlock().then((lastBlock) => {
            if (!lastBlock.hash) {
                this.addBlock(new Block("First block in the chain - Genesis block"));
            }
        }).catch((err) => {
        });
    }

    addBlock(newBlock){
        return new Promise((resolve , reject) => {
            this.chainDB.getLastBlock().then((lastBlock) => {
                newBlock.time = new Date().getTime().toString().slice(0,-3);
                if (!lastBlock.hash) {
                    // this is the first block
                    newBlock.height = 0;
                    newBlock.previousBlockHash = "";
                } else {
                    // last block exist
                    newBlock.height = lastBlock.height + 1;
                    newBlock.previousBlockHash = lastBlock.hash;
                }
                this.chainDB.writeBlock(newBlock).then((succ) => {
                    resolve(succ);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    validateBlock(blockHeight){
        return new Promise((resolve, reject) => {
            this.chainDB.getBlock(blockHeight).then((value) => {
                let block = value;
                let blockHash = block.hash;
                // remove block hash to test block integrity
                block.hash = "";
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                if (blockHash === validBlockHash) {
                    if (blockHeight > 0) {
                        // check pre hash
                        this.chainDB.getBlockPreHash(blockHeight).then((preHash) => {
                            if (preHash != block.previousBlockHash) {
                                console.log('Block #'+blockHeight+' invalid previous hash:\n'+block.previousBlockHash+'<>'+preHash);
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        }).catch((error) => {
                            reject(error);
                        });
                    } else {
                        // first block, pass
                        resolve(true);
                    }
                } else {
                    console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
                    resolve(false);
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }

    validateChain(){
        let blockValidations = [];
        this.chainDB.db.createValueStream().on('data', data => {
          let block = JSON.parse(data);
          blockValidations.push(this.validateBlock(block.height));
        }).on('end', () => {
          let errorLog = [];
          Promise.all(blockValidations).then((results) => {
            for (var i = 0; i < results.length; i++) {
              let isVerified = results[i];
              if (!isVerified) {
                errorLog.push(i);
              }
            }
            if (errorLog.length > 0) {
              console.log('Block errors = ' + errorLog.length);
              console.log('Blocks: '+errorLog);
            } else {
              console.log('No errors detected');
            }
          });
        }).on('error', error => {
          console.log('validateChain method error: ', error);
        });
    }
}


// Test
let blockchain = new Blockchain();

// adding test data
// (function theLoop (i) {
//   setTimeout(function () {
//       let blockTest = new Block("Test Block - " + (i + 1));
//       blockchain.addBlock(blockTest).then((result) => {
//           console.log(result);
//           i++;
//           if (i < 10) theLoop(i);
//       });
//   }, 100);
// })(0);

// get last block
// blockchain.chainDB.getLastBlock().then((lastBlock) => {
//     console.log('last block: ', lastBlock);

// }).catch((err) => {
//     reject(err);
// });


// validate block
// blockchain.validateBlock(0).then((value) => {
//   console.log('validate: ', value);
// }).catch((error) => {
//   console.log('error: ', error);
// });

// validate chain
blockchain.validateChain();