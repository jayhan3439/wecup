const jwt = require('jsonwebtoken');

JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'wecup';

module.exports = {
  async sign(data) {
    return new Promise((resolve, reject) => {
      jwt.sign(data, JWT_SECRET_KEY, {}, (err, token) => {
        if (err) return reject(err);
          return resolve(token);
      });
    });
  },
  async verify(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) return reject(err);
          return resolve(decoded);
      });
    });
  }
}