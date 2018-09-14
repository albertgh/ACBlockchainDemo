const Blockchain = require('./Blockchain');

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
blockchain.chainDB.getLastBlock().then((lastBlock) => {
    console.log('last block: ', lastBlock);

}).catch((err) => {
    reject(err);
});

// validate block
// blockchain.validateBlock(0).then((value) => {
//   console.log('validate: ', value);
// }).catch((error) => {
//   console.log('error: ', error);
// });

// validate chain
//blockchain.validateChain();