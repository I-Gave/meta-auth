const NodeCache = require('node-cache');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

const secret = uuidv4();
let cache = new NodeCache({
  stdTTL: 600
});

function metaAuth(options) {
  return function(req, res, next) {

    const DEFAULT_OPTIONS = {
      message: 'MetaMessage',
      signature: 'MetaSignature',
      address: 'MetaAddress'
    }

    if (options.stdTTL)  {
      cache = new NodeCache({
        StdTTL: options.stdTTL
      })
    }

    this.options = Object.assign(
      DEFAULT_OPTIONS,
      options
    )

    // Address param is passed & isValidAddress
    if (req.params[this.options.address]) {
      const address = req.params[this.options.address];

      if (ethUtil.isValidAddress(address)) {
        const challenge = createChallenge(address);
        let token = {
          challenge
        }
        req.metaAuth = token;
      }
    }

    // Challenge message returned with signature
    if (req.params[this.options.message] &&
        req.params[this.options.signature]) {
      const recovered = checkChallenge(
        req.params[this.options.message],
        req.params[this.options.signature]
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

  return challenge;
}

function checkChallenge(data, sig) {
  const recovered = sigUtil.recoverPersonalSignature({
    data,
    sig
  });

  const challenge = cache.get(recovered);

  if (challenge === data) {
    return recovered;
  }

  return false;
}
module.exports = metaAuth;

