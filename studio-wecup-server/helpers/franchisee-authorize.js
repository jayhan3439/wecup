const { Franchisee } = require('../models');
const jwt = require('./jwt');

const authorize = () => {
  return async (req, res, next) => {
    let token = req.headers['authorization'] || req.query.token;
    if (!token)
      return res.status(401).json({ message: '로그인 후 이용하실 수 있습니다.' });
    if (token.indexOf('Bearer ') === 0)
      token = token.slice(7);
    try {
      const { franchiseeId } = await jwt.verify(token);

      const franchisee = await Franchisee.findById(franchiseeId)
      if (franchisee.hidden === true)
        return res.status(401).json({ message: '해당 계정은 삭제된 가맹점의 계정입니다.' });

      if (franchisee.activation === false || !franchisee.activation)
        return res.status(401).json({ message: '해당 계정은 비활성화된 가맹점의 계정입니다.' });

      req.franchisee = { _id: franchiseeId };
      next();
    } catch {
      return res.status(400).json({ message: '로그인 정보가 훼손되었습니다. 다시 로그인하세요.' });
    }
  }
}

module.exports = authorize;