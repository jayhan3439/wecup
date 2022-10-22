const { Router } = require('express');
const authorize = require('../../helpers/admin-authorize');
const { Cup, WecupCup, Lid, FranchiseeCup, UserCup, UserLog, User } = require('../../models');
const wregexp = require('../../helpers/wregexp');
const router = Router();

router.post('/cups', authorize(), async (req, res) => {
  const { serialNumbers } = req.body;
  try {
    let error1 = [];
    let error2 = [];
    await Promise.all(serialNumbers.map(async n => {
      if (/^[0-9]+$/.test(n.serialNumber) === false) {
        error2.push(n.serialNumber);
        return n;
      }
      const existsLidSerialNumber = await Lid.findOne({ serialNumber: n.serialNumber });
      const existsCupSerialNumber = await Cup.findOne({ serialNumber: n.serialNumber });
      if (existsLidSerialNumber || existsCupSerialNumber) {
        error1.push(n.serialNumber);
        return n;
      }
      return n;
    }));
    if (error1.length !== 0) 
      return res.status(400).json({ message: `${error1.join(', ')}는 이미 존재하는 일련번호 입니다.` });
    if (error2.length !== 0) 
      return res.status(400).json({ message: `${error2.join(', ')}에 숫자 이외의 값이 들어 있습니다.` });
    const cups = await Cup.insertMany(serialNumbers);
    const wecup = await WecupCup.findById('wecup');
    if (!wecup) {
      await new WecupCup({
        quantity: cups.length
      }).save();
      return res.status(201).json(cups);
    }
    wecup.quantity += cups.length;
    await wecup.save();
    res.status(201).json(cups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/cups', authorize(), async (req, res) => {
  let totalCupQuantity = 0;
  let wecupCupQuantity = 0;
  let franchiseeCupQuantity = 0;
  let userCupQuantity = 0;
  try {
    const totalCup = await Cup.aggregate()
      .match({ deleteReason: { $exists: false } })
      .group({
        _id: {},
        count: { $sum: 1 }
      });
    if (totalCup.length !== 0)
      totalCupQuantity = totalCup[0].count;

    const wecupCup = await WecupCup.findById('wecup');
    if (wecupCup)
      wecupCupQuantity = wecupCup.quantity;

    const franchiseeCup = await FranchiseeCup.aggregate()
      .group({
        _id: {},
        count: { $sum: '$quantity' }
      });
    if (franchiseeCup.length !== 0)
      franchiseeCupQuantity = franchiseeCup[0].count;

    const userCup = await UserCup.aggregate()
      .group({
        _id: {},
        count: { $sum: '$quantity' }
      });
    if (userCup.length !== 0)
      userCupQuantity = userCup[0].count;

    res.json({ 
      totalCupQuantity,
      wecupCupQuantity,
      franchiseeCupQuantity,
      userCupQuantity
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/cups/serialNumbers', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { q } = req.query;
  try {
    const query = Cup.find({ deleteReason: { $exists: false } })
      .skip(offset)
      .limit(limit)
      .sort('-createdAt');

    if (q)
      query.where('serialNumber').equals(wregexp(q));

    res.json(await query);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/cups/:serialNumber', async (req, res) => {
  const serialNumber = req.params.serialNumber;
  const { deleteReason } = req.body;
  try {
    const cup = await Cup.findOne({ serialNumber });
    if (!cup)
      return res.status(404).json({ message: '해당 일련번호의 컵을 찾을 수 없습니다.' });

    const log = await UserLog.findOne({ cupSerialNumber: serialNumber, canceled: { $ne: true } }).sort('-createdAt');
    if (!log) {
      const wecupCup = await WecupCup.findById('wecup');
      cup.deleteReason = deleteReason;

      wecupCup.quantity -= 1;
      await wecupCup.save();
      await cup.save();
      return res.json(cup);
    } else if (log && log.type === 'restored') {
      const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId: log.franchiseeId });
      franchiseeCup.quantity -= 1;
      cup.deleteReason = deleteReason;

      await franchiseeCup.save();
      await cup.save();
      return res.json(cup);
    } else if (log && log.type === 'rental') {
      const user = await User.findOne({ phoneNumber: log.userPhoneNumber }).select('_id');
      const userCup = await UserCup.findOne({ userId: user._id });
      userCup.quantity -= 1;
      cup.deleteReason = deleteReason;

      await userCup.save();
      await cup.save();
      return res.json(cup);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;