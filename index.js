const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
const uuidv4 = require('uuid/v4');

const secret = uuidv4();

function metaAuth(options) {
  return function(req, res, next) {
    console.log(options);

    if (req.params[options.address]) {
      console.log("Found Address");
    }
    if (req.params[options.message] &&
        req.params[options.signature]) {
      console.log("Found msg and sig");
    }


    next();
  };
}


module.exports = metaAuth;

