const { Router } = require('express');
const AwesomePhoneNumber = require('awesome-phonenumber');
const router = Router();
const authorize = require('../../helpers/franchisee-authorize');
const { PinCode, User, UserCup, UserLid } = require('../../models');
const alimTalk = require('../../helpers/toast');

router.post('/pin-codes', authorize(), async (req, res) => {
  const { phoneNumber } = req.body;
  let realCode = `0${Math.random() * 100 | 0}`.slice(-2);
  let fakeCode1 = `0${Math.random() * 100 | 0}`.slice(-2);
  let fakeCode2 = `0${Math.random() * 100 | 0}`.slice(-2);
  try {
    const pn = new AwesomePhoneNumber(phoneNumber, 'KR');
    if (pn.isValid() === false || pn.isMobile() === false)
      return res.status(400).json({ message: '유효하지 않은 형식의 전화번호입니다.' });

    const normalize = pn.getNumber('national').split('-').join('');
    const existsUser = await User.findOne({ phoneNumber: normalize, serviceUsed: true });
    if (existsUser)
      return res.json({ serviceUsed: true });

    if (realCode === fakeCode1 || realCode === fakeCode2 || fakeCode1 === fakeCode2) {
      for (;;) {
        if (realCode !== fakeCode1 && realCode !== fakeCode2 && fakeCode1 !== fakeCode2)
          break;
        realCode = `0${Math.random() * 100 | 0}`.slice(-2);
        fakeCode1 = `0${Math.random() * 100 | 0}`.slice(-2);
        fakeCode2 = `0${Math.random() * 100 | 0}`.slice(-2);
      }
    }
    await new PinCode({
      phoneNumber: normalize,
      code: realCode
    }).save();
    const codes = [realCode, fakeCode1, fakeCode2];
    for (let i = 0; i < codes.length; i++) {
      let j = Math.floor(Math.random() * (i + 1));
      [codes[i], codes[j]] = [codes[j], codes[i]];
    }
    console.log(realCode);
    const substitutions = {
      code: realCode
    };
    await alimTalk(normalize, 'send-pin-code', substitutions);
    res.json({ codes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/pin-code-check', authorize(), async (req, res) => {
  const { code, phoneNumber } = req.body;
  try {
    const pn = new AwesomePhoneNumber(phoneNumber, 'KR');
    if (pn.isValid() === false || pn.isMobile() === false)
      return res.status(400).json({ message: '유효하지 않은 형식의 전화번호입니다.' });

    const normalize = pn.getNumber('national').split('-').join('');
    const pinCode = await PinCode.findOne({ phoneNumber: normalize })
      .sort('-createdAt');
    if (pinCode.code !== code)  
      return res.status(400).json({ message: '인증코드가 일치하지 않습니다.' });

    const user = await new User({ 
      phoneNumber: normalize,
      serviceUsed: true
    }).save();
    await new UserCup({
      userId: user._id
    }).save();
    await new UserLid({
      userId: user._id
    }).save();
    res.json({ serviceUsed: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;