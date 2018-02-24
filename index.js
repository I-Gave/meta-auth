const NodeCache = require('node-cache');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

const secret = uuidv4();
const cache = new NodeCache({
  stdTTL: 600
});

function metaAuth(options) {
  return function(req, res, next) {

    // Address param is passed & isValidAddress
    if (req.params[options.address]) {
      const address = req.params[options.address];

      if (ethUtil.isValidAddress(address)) {
        const challenge = createChallenge(address);
        let token = {
          challenge
        }
        req.metaAuth = token;
      }
    }

    // Challenge message returned with signature
    if (req.params[options.message] &&
        req.params[options.signature]) {
      const recovered = checkChallenge(
        req.params[options.message],
        req.params[options.signature]
      )
      let token = {
        recovered
      }
      req.metaAuth = token;
    }

    next();
  };
}

function createChallenge (address) {
  const hash = crypto.createHmac('sha256', secret)
    .update(address + uuidv4())
    .digest('hex');

  const challenge = ethUtil.bufferToHex(new Buffer(`
    ** MetaAuth Challenge **
    Address: ${address}
    Hash: ${hash}
    `, 'utf8'));

  cache.set(address, challenge);
  console.log(challenge)
  return challenge;
}

function checkChallenge(data, sig) {
  let recovered = null;
  try {
    recovered = sigUtil.recoverPersonalSignature({
      data,
      sig
    });
  } catch (e) {
    console.error(e);
    return recovered;
  }

  return recovered;
}
module.exports = metaAuth;

