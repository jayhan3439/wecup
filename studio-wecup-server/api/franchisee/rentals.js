const { Router } = require('express');
const AwesomePhoneNumber = require('awesome-phonenumber');
const authorize = require('../../helpers/franchisee-authorize');
const router = Router();
const { UserLog, User, UserCup, UserLid, FranchiseeCup, FranchiseeLid, Franchisee } = require('../../models');
const alimTalk = require("../../helpers/toast");

router.post('/rentals', authorize(), async (req, res) => {
  const franchiseeId = req.franchisee._id;
  const { 
    cupSerialNumber, 
    lidSerialNumber, 
    phoneNumber 
  } = req.body;
  try {
    if (cupSerialNumber) {
      const existsCupRentalLog = await UserLog.findOne({ cupSerialNumber })
        .sort('-createdAt')
        .select('type canceled');
      if ((existsCupRentalLog && existsCupRentalLog.type === 'rental' && existsCupRentalLog.canceled !== true) || (existsCupRentalLog && existsCupRentalLog.type === 'restored' && existsCupRentalLog.canceled === true))
        return res.status(400).json({ message: '이미 대여중인 컵입니다.' });
    }

    if (lidSerialNumber) {
      const existsLidRentalLog = await UserLog.findOne({ lidSerialNumber })
        .sort('-createdAt')
        .select('type canceled');
      if ((existsLidRentalLog && existsLidRentalLog.type === 'rental' && existsLidRentalLog.canceled !== true) || (existsLidRentalLog && existsLidRentalLog.type === 'restored' && existsLidRentalLog.canceled === true))
        return res.status(400).json({ message: '이미 대여중인 리드입니다.' });
    }

    const pn = new AwesomePhoneNumber(phoneNumber, 'KR');
    if (pn.isValid() === false || pn.isMobile() === false)
      return res.status(400).json({ message: '유효하지 않은 형식의 전화번호입니다.' });

    const normalize = pn.getNumber('national').split('-').join('');

    const user = await User.findOne({ phoneNumber: normalize });
    if (!user)
      return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });

    if (user.overdue === true)
      return res.status(400).json({ message: '연체된 사용자는 대여를 할 수 없습니다.' });
    const userCup = await UserCup.findOne({ userId: user._id });
    const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId });
    if (cupSerialNumber) {
      if (franchiseeCup.quantity === 0)
        return res.status(400).json({ message: '남아있는 컵 재고가 없습니다.' });
      franchiseeCup.quantity -= 1;
      userCup.quantity += 1;
    }
    const userLid = await UserLid.findOne({ userId: user._id });
    const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId });
    if (lidSerialNumber) {
      if (franchiseeLid.quantity === 0)
        return res.status(400).json({ message: '남아있는 리드 재고가 없습니다.' });
      franchiseeLid.quantity -= 1;
      userLid.quantity += 1;
    }
    const now = new Date();
    const userLog = await new UserLog({
      franchiseeId,
      userPhoneNumber: normalize,
      cupSerialNumber,
      lidSerialNumber,
      type: 'rental',
      expiredAt: new Date((now - 0) + 1000 * 60 * 60 * 24 * 7)
    }).save();
    const franchisee = await Franchisee.findById(franchiseeId)
      .select('name');
    const substitutions = {
      franchiseeName: franchisee.name,
      userCupQuantity: userCup.quantity,
      userLidQuantity: userLid.quantity,
      phoneNumber: user.phoneNumber
    };
    await franchiseeCup.save();
    await userCup.save();
    await franchiseeLid.save();
    await userLid.save();
    await alimTalk(normalize, 'rental', substitutions);
    res.json(userLog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;