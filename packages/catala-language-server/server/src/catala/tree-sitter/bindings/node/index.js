const root = require("path").join(__dirname, "..", "..");
// const root = require("path").join(__dirname, "..");
// const root = require("path").join(__dirname);
 root;/*?*/

module.exports = require("node-gyp-build")(root);

try {
  module.exports.nodeTypeInfo = require("../../src/node-types.json");
} catch (_) {}
