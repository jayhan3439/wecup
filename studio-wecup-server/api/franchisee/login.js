const { Router } = require('express');
const router = Router();
const jwt = require('../../helpers/jwt');
const { Franchisee } = require('../../models');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const franchisee = await Franchisee.findOne({ username, hidden: { $ne: true } });
    if (!franchisee)
      return res.status(400).json({ message: '아이디 또는 비밀번호가 맞지 않습니다.' });
    if (franchisee.password !== password)
      return res.status(400).json({ message: '아이디 또는 비밀번호가 맞지 않습니다.' });
    const token = await jwt.sign({ franchiseeId: franchisee._id });
    return res.json({ franchiseeLoginToken: token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;