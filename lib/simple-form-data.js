function randomString() {
  var UNMISTAKABLE_CHARS = "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz";
  var charsCount = 17;
  var digits = [];
  for (var i = 0; i < charsCount; i++) {
    digits[i] = UNMISTAKABLE_CHARS.substr(Math.floor(Math.random() * UNMISTAKABLE_CHARS.length), 1);
  }
  return digits.join("");
}

function SimpleFormData() {
  this.boundary = "--" + randomString();
  this.buffers = [];
}

SimpleFormData.prototype.getBoundary = function() {
  return this.boundary;
};

SimpleFormData.prototype.append = function(field, value, options) {
  var _ref;
  if (options == null) {
    options = null;
  }
  if (options != null) {
    if (value instanceof Buffer) {
      this.buffers.push(new Buffer(("--" + this.boundary + "\r\n") + ("Content-Disposition: " + ((_ref = options.contentDisposition) != null ? _ref : 'form-data') + "; name=\"" + field + "\"; filename=\"" + options.filename + "\"\r\n") + ("Content-Type: " + options.contentType + "\r\n\r\n")));
      this.buffers.push(value);
    } else {
      throw 'SimpleFormData: type error';
    }
  } else {
    this.buffers.push(new Buffer(("--" + this.boundary + "\r\n") + ("Content-Disposition: form-data; name=\"" + field + "\"\r\n\r\n") + ("" + (value.toString()) + "\r\n")));
  }
};

SimpleFormData.prototype.toBuffer = function() {
  return Buffer.concat(this.buffers.concat(new Buffer("\r\n--" + this.boundary + "--\r\n")));
};

module.exports = SimpleFormData
