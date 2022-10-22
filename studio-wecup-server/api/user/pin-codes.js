const { Router } = require('express');
const AwesomePhoneNumber = require('awesome-phonenumber');
const { PinCode } = require('../../models');
const router = Router();
const sms = require('../../helpers/sms');

router.post('/pin-codes', async (req, res) => {
  const { phoneNumber } = req.body;
  let code = `00000${Math.random() * 1000000 | 0}`.slice(-6);
  try {
    const pn = new AwesomePhoneNumber(phoneNumber, 'KR');
    if (pn.isValid() === false || pn.isMobile() === false)
      return res.status(400).json({ message: '유효하지 않은 형식의 전화번호입니다.' });

    const normalize = pn.getNumber('national').split('-').join('');

    await new PinCode({
      phoneNumber: normalize,
      code: code
    }).save();
    console.log(code);
    await sms(normalize, `위컵 인증번호는 ${code} 입니다.`);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;