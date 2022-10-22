const { Router } = require('express');
const AwesomePhoneNumber = require('awesome-phonenumber');
const { PinCode, User } = require('../../models');
const jwt = require('../../helpers/jwt');
const router = Router();

router.post('/login', async (req, res) => {
  const { phoneNumber, code } = req.body;
  try {
    const pn = new AwesomePhoneNumber(phoneNumber, 'KR');
    if (pn.isValid() === false || pn.isMobile() === false)
      return res.status(400).json({ message: '유효하지 않은 형식의 전화번호입니다.' });

    const normalize = pn.getNumber('national').split('-').join('');
    const pinCode = await PinCode.findOne({ phoneNumber: normalize })
      .sort('-createdAt');
    if (pinCode.code !== code)  
      return res.status(400).json({ message: '인증코드가 일치하지 않습니다.' });

    const user = await User.findOne({ phoneNumber: normalize });
    if (!user)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    const token = await jwt.sign({ userId: user._id });
    res.json({ userLoginToken: token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;