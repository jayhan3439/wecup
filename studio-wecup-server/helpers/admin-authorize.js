const jwt = require('./jwt');

const authorize = () => {
  return async (req, res, next) => {
    let token = req.headers['authorization'] || req.query.token;
    if (!token)
      return res.status(401).json({ message: '로그인 후 이용하실 수 있습니다.' });
    if (token.indexOf('Bearer ') === 0)
      token = token.slice(7);
    try {
      const { admin, username } = await jwt.verify(token);
      if (!admin || admin !== true)
        return res.status(403).json({ message: '권한이 없습니다.' });
      if (!username || username !== 'wecup')
        return res.status(403).json({ message: '권한이 없습니다.' });

      req.admin = { auth: admin, username };
      next();
    } catch {
      return res.status(400).json({ message: '로그인 정보가 훼손되었습니다. 다시 로그인하세요.' });
    }
  }
}

module.exports = authorize;