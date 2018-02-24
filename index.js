

function metaAuth(options) {
  return function(req, res, next) {
    console.log(options);
    next();
  };
}
