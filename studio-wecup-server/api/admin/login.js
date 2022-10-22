const { Router } = require('express');
const router = Router();
const jwt = require('../../helpers/jwt');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (username === 'wecup' && password === 'wecup') {
      const token = await jwt.sign({ admin: true, username });
      return res.json({ adminLoginToken: token });
    } else {
      return res.status(400).json({ message: '아이디 또는 비밀번호가 틀렸습니다. 다시 한번 확인해주세요.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;