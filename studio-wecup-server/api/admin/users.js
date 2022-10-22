const { Router } = require('express');
const authorize = require('../../helpers/admin-authorize');
const { User, UserLog, UserCup, UserLid } = require('../../models');
const router = Router();
const wregexp = require('../../helpers/wregexp');

router.get('/users', authorize(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { phoneNumber, overdue } = req.query;
  const sort = req.query.sort || '-createdAt';
  try {
    if (overdue === 'true') {
      const query = User.find({ overdue: true });
      if (phoneNumber)
        query.where('phoneNumber').equals(wregexp(phoneNumber));

      const users = await query;
      const result = await Promise.all(users.map(async u => {
        const userCup = await UserCup.findOne({ userId: u._id });
        const userLid = await UserLid.findOne({ userId: u._id });
        const userLog = await UserLog.findOne({ userPhoneNumber: u.phoneNumber, type: 'rental' });
        if (!userLog) {
          return { 
            _id: u._id,
            phoneNumber: u.phoneNumber,
            createdAt: u.createdAt,
            notRestoreCupQuantity: userCup.quantity, 
            notRestoreLidQuantity: userLid.quantity, 
            lastRentalDate: null,
            overdue: u.overdue || false
          };
        }
        return { 
          _id: u._id,
          phoneNumber: u.phoneNumber,
          createdAt: u.createdAt,
          notRestoreCupQuantity: userCup.quantity, 
          notRestoreLidQuantity: userLid.quantity, 
          lastRentalDate: userLog.createdAt,
          overdue: u.overdue || false
        };
      }));
      if (sort === 'notRestoreCupQuantity')
        result.sort((a, b) => a.notRestoreCupQuantity - b.notRestoreCupQuantity);
      else if (sort === '-notRestoreCupQuantity')
        result.sort((a, b) => a.notRestoreCupQuantity + b.notRestoreCupQuantity);
      else if (sort === 'notRestoreLidQuantity')
        result.sort((a, b) => a.notRestoreLidQuantity - b.notRestoreLidQuantity);
      else if (sort === '-notRestoreLidQuantity')
        result.sort((a, b) => a.notRestoreLidQuantity + b.notRestoreLidQuantity);
      else if (sort === 'lastRentalDate')
        result.sort((a, b) => a.lastRentalDate - b.lastRentalDate);
      else if (sort === '-lastRentalDate')
        result.sort((a, b) => a.lastRentalDate + b.lastRentalDate);
      else if (sort === 'createdAt')
        result.sort((a, b) => a.createdAt - b.createdAt);
      else if (sort === '-createdAt')
        result.sort((a, b) => a.createdAt + b.createdAt);
      return res.json(result);
    }

    const query = User.find()
      .skip(offset)
      .limit(limit);
    if (phoneNumber)
      query.where('phoneNumber').equals(wregexp(phoneNumber));
    const users = await query;
    const result = await Promise.all(users.map(async user => {
      const u = user.toObject();
      const userCup = await UserCup.findOne({ userId: u._id });
      const userLid = await UserLid.findOne({ userId: u._id });
      const userLog = await UserLog.findOne({ userPhoneNumber: u.phoneNumber, type: 'rental' })
        .sort('-createdAt');
      if (!userLog) {
        return { 
          _id: u._id,
          phoneNumber: u.phoneNumber,
          createdAt: u.createdAt,
          notRestoreCupQuantity: userCup.quantity, 
          notRestoreLidQuantity: userLid.quantity, 
          lastRentalDate: null,
          overdue: u.overdue || false
        };
      }
      return { 
        _id: u._id,
        phoneNumber: u.phoneNumber,
        createdAt: u.createdAt,
        notRestoreCupQuantity: userCup.quantity, 
        notRestoreLidQuantity: userLid.quantity, 
        lastRentalDate: userLog.createdAt,
        overdue: u.overdue || false
      };
    }));
    if (sort === 'notRestoreCupQuantity')
      result.sort((a, b) => a.notRestoreCupQuantity - b.notRestoreCupQuantity);
    if (sort === '-notRestoreCupQuantity')
      result.sort((a, b) => a.notRestoreCupQuantity + b.notRestoreCupQuantity);
    if (sort === 'notRestoreLidQuantity')
      result.sort((a, b) => a.notRestoreLidQuantity - b.notRestoreLidQuantity);
    if (sort === '-notRestoreLidQuantity')
      result.sort((a, b) => a.notRestoreLidQuantity + b.notRestoreLidQuantity);
    if (sort === 'lastRentalDate')
      result.sort((a, b) => a.lastRentalDate - b.lastRentalDate);
    if (sort === '-lastRentalDate')
      result.sort((a, b) => a.lastRentalDate + b.lastRentalDate);
    if (sort === 'createdAt')
      result.sort((a, b) => a.createdAt - b.createdAt);
    if (sort === '-createdAt')
      result.sort((a, b) => a.createdAt + b.createdAt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:userPhoneNumber/overdue', authorize(), async (req, res) => {
  const userPhoneNumber = req.params.userPhoneNumber;
  try {
    const user = await User.findOne({ phoneNumber: userPhoneNumber });
    if (!user)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    user.overdue = false;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;