const { Router } = require('express');
const authorize = require('../../helpers/franchisee-authorize');
const router = Router();
const { UserLog, User, UserCup, UserLid, FranchiseeCup, FranchiseeLid } = require('../../models');

router.post('/restores', authorize(), async (req, res) => {
  const franchiseeId = req.franchisee._id;
  const { 
    cupSerialNumber, 
    lidSerialNumber
  } = req.body;
  try {
    const rentalLog = await UserLog.findOne({ 
      $or: [
        { cupSerialNumber },
        { lidSerialNumber },
      ]
    }).sort('-createdAt');
    if (rentalLog && rentalLog.franchiseeId !== franchiseeId)
      return res.status(400).json({ message: '대여한 가맹점과 다른 가맹점 입니다.' });

    if (!rentalLog || (rentalLog.type !== 'rental' && (rentalLog.canceled !== true || !rentalLog.canceled))) {
      if (cupSerialNumber && lidSerialNumber)
        return res.status(404).json({ message: '대여되지 않은 컵/리드 입니다.' });
      else if (cupSerialNumber && !lidSerialNumber)
        return res.status(404).json({ message: '대여되지 않은 컵 입니다.' });
      else if (!cupSerialNumber && lidSerialNumber)
        return res.status(404).json({ message: '대여되지 않은 리드 입니다.' });
      else 
        return res.status(400).json({ message: '스캔된 컵/리드가 없습니다.' });
    }

    const user = await User.findOne({ phoneNumber: rentalLog.userPhoneNumber });
    if (!user)
      return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });    

    if (user.overdue === true)
      return res.status(400).json({ message: '연체된 사용자는 반납을 할 수 없습니다.' });
    const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId });
    const userCup = await UserCup.findOne({ userId: user._id });
    if (cupSerialNumber) {
      franchiseeCup.quantity += 1;
      userCup.quantity -= 1;
    }
    const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId });
    const userLid = await UserLid.findOne({ userId: user._id });
    if (lidSerialNumber) {
      franchiseeLid.quantity += 1;
      userLid.quantity -= 1;
    }
    await rentalLog.save();
    const userLog = await new UserLog({
      franchiseeId,
      userPhoneNumber: rentalLog.userPhoneNumber,
      cupSerialNumber,
      lidSerialNumber,
      type: 'restored'
    }).save();
    await franchiseeCup.save();
    await userCup.save();
    await franchiseeLid.save();
    await userLid.save();
    res.json(userLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;