const jwt = require('./jwt');

const authorize = () => {
  return async (req, res, next) => {
    let token = req.headers['authorization'] || req.query.token;
    if (!token)
      return res.status(401).json({ message: '로그인 후 이용하실 수 있습니다.' });
    if (token.indexOf('Bearer ') === 0)
      token = token.slice(7);
    try {
      const { userId } = await jwt.verify(token);
      req.user = { _id: userId };
      next();
    } catch {
      return res.status(400).json({ message: '로그인 정보가 훼손되었습니다. 다시 로그인하세요.' });
    }
  }
}

module.exports = authorize;