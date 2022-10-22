const { Router } = require('express');
const authorize = require('../../helpers/admin-authorize');
const { FranchiseeLog, Franchisee, WecupCup, WecupLid, FranchiseeCup, FranchiseeLid, Application } = require('../../models');
const router = Router();

router.post('/release', authorize(), async (req, res) => {
  const { franchiseeId, applicationId } = req.body;
  const cupQuantity = Number(req.body.cupQuantity);
  const lidQuantity = Number(req.body.lidQuantity);
  try {
    if ((!cupQuantity && !lidQuantity) ||( cupQuantity === 0 && lidQuantity === 0))
      return res.status(400).json({ message: '컵/리드의 개수가 0개 입니다.' });

    const franchisee = await Franchisee.findById(franchiseeId)
      .select('_id');
    if (!franchisee)
      return res.status(404).json({ message: '가맹점을 찾을 수 없습니다.' });

    const wecupCup = await WecupCup.findById('wecup');
    if (!wecupCup || wecupCup.quantity < cupQuantity)
      return res.status(400).json({ message: '출고수량 (컵)이 위컵 (컵) 재고수량보다 많습니다.' });

    const wecupLid = await WecupLid.findById('wecup');
    if (!wecupLid || wecupLid.quantity < lidQuantity)
      return res.status(400).json({ message: '출고수량 (리드)이 위컵 (리드) 재고수량보다 많습니다.' });

    if (applicationId) {
      const application = await Application.findOne({ _id: applicationId, type: 'receive', status: 'waiting' });
      if (!application)
        return res.status(404).json({ message: '신청내역을 찾을 수 없거나 이미 처리가 완료됐습니다.' });

      application.cupQuantity = cupQuantity;
      application.lidQuantity = lidQuantity;
      application.status = 'completed';
      await application.save();
    }

    const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId });
    const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId });
    wecupCup.quantity -= cupQuantity;
    wecupLid.quantity -= lidQuantity;
    franchiseeCup.quantity += cupQuantity;
    franchiseeLid.quantity += lidQuantity;
    await franchiseeCup.save();
    await franchiseeLid.save();
    await wecupCup.save();
    await wecupLid.save();
    const franchiseeLog = await new FranchiseeLog({
      franchiseeId,
      releaseCup: cupQuantity,
      releaseLid: lidQuantity,
      wecupCupQuantity: wecupCup.quantity,
      wecupLidQuantity: wecupLid.quantity,
      franchiseeCupQuantity: franchiseeCup.quantity,
      franchiseeLidQuantity: franchiseeLid.quantity,
      receiveCup: 0,
      receiveLid: 0,
    }).save();
    res.status(201).json(franchiseeLog);
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;