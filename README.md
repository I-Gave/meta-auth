# MetaAuth
Express middleware for handling authentication with [MetaMask](https://metamask.io).

## Usage
```
$ npm install meta-auth --save
```
Include  he middleware in your express routes
```
const metaAuth = require('meta-auth')();

app.get('/auth/:MetaAddress', metaAuth, (req, res) => {
  // Request a challenge from the server
  res.send(req.metaAuth.challenge)
});

app.get('/auth/:MetaMessage/:MetaSignature', metaAuth, (req, res) => {
  if (req.metaAuth.recovered) {
    // Signature matches the cached address/challenge
    // Authentication is valid, assign JWT, etc.
    res.send(req.metaAuth.recovered);
  } else {
    // Sig did not match, invalid authentication
    res.status(500).send();
  };
});
```
MetaAuth will check the route parameters for `:MetaAddress`, `:MetaMessage`, and `:MetaSignature`

Parameter names may be passed in the configuration
```
const metaAuth = require('meta-auth')({
  message: 'msg',
  signature: 'sig',
  address: 'address'
});
```

### :MetaAddress
If MetaAuth finds `req.params.MetaAddress` set it will assign a challenge to the address. The challenge is located at `req.metaAuth.challenge`

### :MetaMessage & :MetaSignature
`:MetaMessage` is the previously issued challenge and `:MetaSignature` is the user's signature for the provided message. If the recovery address matches the address stored for the given challenge MetaAuth returns the recovery address. In the case of an error or no match `false` is returned.

## Authors

* **Alex Sherbuck** - [I Gave](https://igave.io)


