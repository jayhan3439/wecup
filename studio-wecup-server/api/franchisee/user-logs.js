const { Router } = require('express');
const authorize = require('../../helpers/franchisee-authorize');
const { UserLog, User, UserCup, UserLid, FranchiseeCup, FranchiseeLid } = require('../../models');
const router = Router();

router.get('/user-logs', authorize(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const franchiseeId = req.franchisee._id;
  try {
    const userLogs = await UserLog.find({ franchiseeId })
      .skip(offset)
      .limit(limit)
      .sort('-createdAt');
    res.json(userLogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/user-logs/:_id', authorize(), async (req, res) => {
  const _id = req.params._id;
  const franchiseeId = req.franchisee._id
  try {
    const userLog = await UserLog.findById(_id);
    if (!userLog)
      return res.status(404).json({ message: '대여/반납 내역을 찾을 수 없습니다.' });

    if (userLog.canceled === true)
      return res.status(400).json({ message: '해당 내역은 이미 취소된 상태입니다.' });

    const now = new Date();
    if (userLog.createdAt - 0 + 1000 * 60 * 2 < now)
      return res.status(400).json({ message: '해당 내역은 2분이 지나 취소 할 수 없습니다.' });

    if (userLog.franchiseeId !== franchiseeId)
      return res.status(400).json({ message: '기존에 대여/반납한 가맹점이 아닙니다.' });

    const user = await User.findOne({ phoneNumber: userLog.userPhoneNumber });
    if (!user)
      return res.status(404).json({ message: '해당 내역의 사용자를 찾을 수 없습니다.' });

    if (userLog.type === 'rental') {
      const query = UserLog.findOne({ 
        canceled: { $ne: true },
        createdAt: { $gte: userLog.createdAt }
      }).sort('createdAt')
      if (userLog.cupSerialNumber)
        query.where('cupSerialNumber').equals(userLog.cupSerialNumber);
      if (userLog.lidSerialNumber)
        query.where('lidSerialNumber').equals(userLog.lidSerialNumber);

      const restoreCanceledLog = await query;
      if (restoreCanceledLog && restoreCanceledLog.type === 'restored')
        return res.status(400).json({ message: '이미 반환된 내역이 있어 취소할 수 없습니다' });

      if (userLog.cupSerialNumber) {
        const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId });
        const userCup = await UserCup.findOne({ userId: user._id });
        franchiseeCup.quantity += 1;
        userCup.quantity -= 1;
        await franchiseeCup.save();
        await userCup.save();
      }
      if (userLog.lidSerialNumber) {
        const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId });
        const userLid = await UserLid.findOne({ userId: user._id });
        franchiseeLid.quantity += 1;
        userLid.quantity -= 1;
        await franchiseeLid.save();
        await userLid.save();
      }
    }

    if (userLog.type === 'restored') {
      if (userLog.cupSerialNumber) {
        const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId });
        const userCup = await UserCup.findOne({ userId: user._id });
        franchiseeCup.quantity -= 1;
        userCup.quantity += 1;
        await franchiseeCup.save();
        await userCup.save();
      }
      if (userLog.lidSerialNumber) {
        const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId });
        const userLid = await UserLid.findOne({ userId: user._id });
        franchiseeLid.quantity -= 1;
        userLid.quantity += 1;
        await franchiseeLid.save();
        await userLid.save();
      }
    }

    userLog.canceled = true;
    await userLog.save();
    res.json(userLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;