const NodeCache = require('node-cache');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

const secret = uuidv4();
let cache = new NodeCache({
  stdTTL: 600
});

class MetaAuth {
  constructor(options) {
    return (req, res, next) => {
      const DEFAULT_OPTIONS = {
        signature: 'MetaSignature',
        message: 'MetaMessage',
        address: 'MetaAddress'
      }

      this.options = Object.assign(
        DEFAULT_OPTIONS,
        options
      )

      // Address param is passed & isValidAddress
      if (req.params[this.options.address]) {
        const address = req.params[this.options.address];

        if (ethUtil.isValidAddress(address)) {
          const challenge = this.createChallenge(address);
          let token = {
            challenge
          }
          req.metaAuth = token;
        }
      }

      // Challenge message returned with signature
      if (req.params[this.options.message] &&
        req.params[this.options.signature]) {

        const recovered = this.checkChallenge(
          req.params[this.options.message],
          req.params[this.options.signature]
        )
        let token = {
          recovered
        }
        req.metaAuth = token;
      }

      next();
    }
  }

  createChallenge(address) {
    const hash = crypto.createHmac('sha256', secret)
      .update(address + uuidv4())
      .digest('hex');

    cache.set(address, hash);

    return hash;
  }

  checkChallenge(challenge, sig) {
    const data = [{
      type: 'string',
      name: 'challenge',
      value: challenge
    }]
    const recovered = sigUtil.recoverTypedSignature({
      data,
      sig
    });

    const storedChallenge = cache.get(recovered);

    if (storedChallenge === challenge) {
      cache.del(recovered);
      return recovered;
    }

    return false;
  }
}


module.exports = MetaAuth;

