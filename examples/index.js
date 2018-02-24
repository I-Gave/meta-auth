const express = require('express');
const metaAuth = require('meta-auth')();

const app = express();

app.use('/', express.static('.'));

app.get('/auth/:MetaAddress', metaAuth, (req, res) => {
  // Request a message from the server
  res.send(req.metaAuth.challenge)
});

app.get('/auth/:MetaMessage/:MetaSignature', metaAuth, (req, res) => {
  if (req.metaAuth.recovered) {
    // Signature matches the cache address/challenge
    // Authentication is valid, assign JWT, etc.
    res.send(req.metaAuth.recovered);
  } else {
    // Sig did not match, invalid authentication
    res.status(500).send();
  };
});

app.listen(3001, () => {
  console.log('Listening on port 3001')
})