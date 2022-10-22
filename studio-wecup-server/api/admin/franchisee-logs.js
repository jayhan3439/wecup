const { Router } = require('express');
const authorize = require('../../helpers/admin-authorize');
const { FranchiseeLog, FranchiseeCup, WecupCup, FranchiseeLid, WecupLid, UserLog } = require('../../models');
const router = Router();
const wregexp = require('../../helpers/wregexp');

router.get('/franchisee-logs', authorize(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { franchiseeId, q } = req.query;
  try {
    const findOption = {};
    if (franchiseeId)
      findOption.franchiseeId = franchiseeId;
    if (q) {
      findOption.$or = [
        { 'franchisee.name': wregexp(q) },
        { franchiseeId: wregexp(q) }
      ]
    }
    const query = FranchiseeLog.aggregate()
      .lookup({
        from: 'franchisees',
        localField: 'franchiseeId',
        foreignField: '_id',
        as: 'franchisee'
      })
      .unwind('$franchisee')
      .match(findOption)
      .sort('-createdAt')
      .skip(offset)
      .limit(limit);

    const franchiseeLogs = await query;
    const result = await Promise.all(franchiseeLogs.map(async v => {
      const rentalCup = await UserLog.aggregate()
        .match({
          franchiseeId: v.franchiseeId,
          canceled: { $ne: true }
        })
        .sort('-createdAt')
        .group({
          _id: 'cupSerialNumber',
          logId: { $first: '$_id' },
          type: { $first: '$type' }
        });
      const rentalLid = await UserLog.aggregate()
        .match({
          franchiseeId: v.franchiseeId,
          canceled: { $ne: true }
        })
        .sort('-createdAt')
        .group({
          _id: 'lidSerialNumber',
          logId: { $first: '$_id' },
          type: { $first: '$type' }
        });

      const rentalCupQuantity = rentalCup.filter(r => r.type === 'rental').length;
      const rentalLidQuantity = rentalLid.filter(r => r.type === 'rental').length;

      v.franchiseeCupQuantity += rentalCupQuantity;
      v.franchiseeLidQuantity += rentalLidQuantity;
      return v;
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/franchisee-logs/:_id', authorize(), async (req, res) => {
  const _id = req.params._id;
  try {
    const franchiseeLog = await FranchiseeLog.findById(_id);
    if (!franchiseeLog)
      return res.status(404).json({ message: '입고/출고 내역을 찾을 수 없습니다.' });

    if (franchiseeLog.canceled === true)
      return res.status(400).json({ message: '해당 내역은 이미 취소된 상태입니다.' });

    if (franchiseeLog.releaseCup !== 0 || franchiseeLog.releaseLid !== 0) {
      if (franchiseeLog.releaseCup !== 0) {
        const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId: franchiseeLog.franchiseeId });
        const wecupCup = await WecupCup.findById('wecup');
        if (franchiseeCup.quantity < franchiseeLog.releaseCup) 
          return res.status(400).json({ message: '가맹점 컵 개수가 부족합니다.' });
        franchiseeCup.quantity -= franchiseeLog.releaseCup;
        wecupCup.quantity += franchiseeLog.releaseCup;
        await franchiseeCup.save();
        await wecupCup.save();
      }
      if (franchiseeLog.releaseLid !== 0) {
        const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId: franchiseeLog.franchiseeId });
        const wecupLid = await WecupLid.findById('wecup');
        if (franchiseeLid.quantity < franchiseeLog.releaseLid) 
          return res.status(400).json({ message: '가맹점 리드 개수가 부족합니다.' });
        franchiseeLid.quantity -= franchiseeLog.releaseLid;
        wecupLid.quantity += franchiseeLog.releaseLid;
        await franchiseeLid.save();
        await wecupLid.save();
      }
    }
    if (franchiseeLog.receiveCup !== 0 || franchiseeLog.receiveLid !== 0) {
      if (franchiseeLog.receiveCup !== 0) {
        const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId: franchiseeLog.franchiseeId });
        const wecupCup = await WecupCup.findById('wecup');
        if (wecupCup.quantity < franchiseeLog.receiveCup) 
          return res.status(400).json({ message: '위컵 컵 개수가 부족합니다.' });
        franchiseeCup.quantity += franchiseeLog.receiveCup;
        wecupCup.quantity -= franchiseeLog.receiveCup;
        await franchiseeCup.save();
        await wecupCup.save();
      }
      if (franchiseeLog.receiveLid !== 0) {
        const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId: franchiseeLog.franchiseeId });
        const wecupLid = await WecupLid.findById('wecup');
        if (wecupLid.quantity < franchiseeLog.receiveLid) 
          return res.status(400).json({ message: '위컵 리드 개수가 부족합니다.' });
        franchiseeLid.quantity += franchiseeLog.receiveLid;
        wecupLid.quantity -= franchiseeLog.receiveLid;
        await franchiseeLid.save();
        await wecupLid.save();
      }
    }

    franchiseeLog.canceled = true;
    await franchiseeLog.save();
    res.json(franchiseeLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;