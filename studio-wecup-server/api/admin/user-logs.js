const { Router } = require('express');
const authorize = require('../../helpers/admin-authorize');
const { UserLog, User, FranchiseeCup, UserCup, FranchiseeLid, UserLid } = require('../../models');
const router = Router();
const wregexp = require('../../helpers/wregexp');

router.get('/user-logs', authorize(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { franchiseeId, phoneNumber, type, from, to } = req.query;
  try {
    const query = UserLog.find()
      .populate('franchisee', 'name')
      .skip(offset)
      .limit(limit)
      .sort('-createdAt');
    if (franchiseeId)
      query.where('franchiseeId').equals(wregexp(franchiseeId));
    if (phoneNumber)
      query.where('userPhoneNumber').equals(wregexp(phoneNumber));
    if (type)
      query.where('type').equals(type);
    if (from)
      query.where('createdAt').gte(new Date(from))
    if (to)
      query.where('createdAt').lte(new Date(to))
    res.json(await query);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/user-logs/:_id', authorize(), async (req, res) => {
  const _id = req.params._id;
  try {
    const userLog = await UserLog.findById(_id);
    if (!userLog)
      return res.status(404).json({ message: '대여/반납 내역을 찾을 수 없습니다.' });

    if (userLog.canceled === true)
      return res.status(400).json({ message: '해당 내역은 이미 취소된 상태입니다.' });

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
        const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId: userLog.franchiseeId });
        const userCup = await UserCup.findOne({ userId: user._id });
        franchiseeCup.quantity += 1;
        userCup.quantity -= 1;
        await franchiseeCup.save();
        await userCup.save();
      }
      if (userLog.lidSerialNumber) {
        const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId: userLog.franchiseeId });
        const userLid = await UserLid.findOne({ userId: user._id });
        franchiseeLid.quantity += 1;
        userLid.quantity -= 1;
        await franchiseeLid.save();
        await userLid.save();
      }
    }

    if (userLog.type === 'restored') {
      if (userLog.cupSerialNumber) {
        const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId: userLog.franchiseeId });
        const userCup = await UserCup.findOne({ userId: user._id });
        franchiseeCup.quantity -= 1;
        userCup.quantity += 1;
        await franchiseeCup.save();
        await userCup.save();
      }
      if (userLog.lidSerialNumber) {
        const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId: userLog.franchiseeId });
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