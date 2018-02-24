const express = require('express');
const metaAuth = require('meta-auth')();

const app = express();

app.use('/', express.static('.'));

app.use('/auth/:MetaAddress', metaAuth, (req, res) => {
  res.send(req.metaAuth.challenge)
});
app.use('/auth/:MetaMessage/:MetaSignature', metaAuth, (req, res) => {
  if (req.metaAuth.recovered) {
    res.send(req.metaAuth.recovered);
  } else {
    res.status(500).send();
  };
});

app.listen(3001, () => {
  console.log('Listening on port 3001')
})