const { Router } = require('express');
const authorize = require('../../helpers/admin-authorize');
const { Lid, WecupLid, Cup, FranchiseeLid, UserLid, UserLog, User } = require('../../models');
const wregexp = require('../../helpers/wregexp');
const router = Router();

router.post('/lids', authorize(), async (req, res) => {
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
    const lids = await Lid.insertMany(serialNumbers);
    const wecup = await WecupLid.findById('wecup');
    if (!wecup) {
      await new WecupLid({
        quantity: lids.length
      }).save();
      return res.status(201).json(lids);
    }
    wecup.quantity += lids.length;
    await wecup.save();
    res.status(201).json(lids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/lids', authorize(), async (req, res) => {
  let totalLidQuantity = 0;
  let wecupLidQuantity = 0;
  let franchiseeLidQuantity = 0;
  let userLidQuantity = 0;
  try {
    const totalLid = await Lid.aggregate()
      .match({ deleteReason: { $exists: false } })
      .group({
        _id: {},
        count: { $sum: 1 }
      });
    if (totalLid.length !== 0)
      totalLidQuantity = totalLid[0].count;

    const wecupLid = await WecupLid.findById('wecup');
    if (wecupLid)
      wecupLidQuantity = wecupLid.quantity;

    const franchiseeLid = await FranchiseeLid.aggregate()
      .group({
        _id: {},
        count: { $sum: '$quantity' }
      });
    if (franchiseeLid.length !== 0)
      franchiseeLidQuantity = franchiseeLid[0].count;

    const userLid = await UserLid.aggregate()
      .group({
        _id: {},
        count: { $sum: '$quantity' }
      });
    if (userLid.length !== 0)
      userLidQuantity = userLid[0].count;

    res.json({ 
      totalLidQuantity,
      wecupLidQuantity,
      franchiseeLidQuantity,
      userLidQuantity
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/lids/serialNumbers', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { q } = req.query;
  try {
    const query = Lid.find({ deleteReason: { $exists: false } })
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

router.put('/lids/:serialNumber', async (req, res) => {
  const serialNumber = req.params.serialNumber;
  const { deleteReason } = req.body;
  try {
    const lid = await Lid.findOne({ serialNumber });
    if (!lid)
      return res.status(404).json({ message: '해당 일련번호의 리드를 찾을 수 없습니다.' });

    const log = await UserLog.findOne({ lidSerialNumber: serialNumber, canceled: { $ne: true } }).sort('-createdAt');
    if (!log) {
      const wecupLid = await WecupLid.findById('wecup');
      lid.deleteReason = deleteReason;

      wecupLid.quantity -= 1;
      await wecupLid.save();
      await lid.save();
      return res.json(lid);
    } else if (log.type === 'restored') {
      const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId: log.franchiseeId });
      franchiseeLid.quantity -= 1;
      lid.deleteReason = deleteReason;

      await franchiseeLid.save();
      await lid.save();
      return res.json(lid);
    } else if (log.type === 'rental') {
      const user = await User.findOne({ phoneNumber: log.userPhoneNumber }).select('_id');
      const userLid = await UserLid.findOne({ userId: user._id });
      userLid.quantity -= 1;
      lid.deleteReason = deleteReason;

      await userLid.save();
      await lid.save();
      return res.json(lid);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;