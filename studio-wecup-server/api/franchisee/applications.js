const { Router } = require('express');
const authorize = require('../../helpers/franchisee-authorize');
const { Application, FranchiseeCup, FranchiseeLid } = require('../../models');
const router = Router();

router.post('/applications', authorize(), async (req, res) => {
  const { cupQuantity, lidQuantity, type } = req.body;
  const franchiseeId = req.franchisee._id;
  try {
    if (type !== 'restore' && type !== 'receive')
      return res.status(400).json({ message: '입고, 반송만 할실 수 있습니다.' });

    const existsApplication = await Application.findOne({
      franchiseeId,
      type
    }).sort('-createdAt');
    if (existsApplication && existsApplication.status === 'waiting')
      return res.status(400).json({ message: '이미 신청 내역이 있습니다.' });

    if (type === 'restore') {
      const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId })
      const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId })
      if (cupQuantity && franchiseeCup.quantity < cupQuantity)
        return res.status(400).json({ message: '반송할 컵이 현재 재고(컵)보다 많습니다.' });
      if (lidQuantity && franchiseeLid.quantity < lidQuantity)
        return res.status(400).json({ message: '반송할 리드가 현재 재고(리드)보다 많습니다.' });
    }
    const application = await new Application({
      franchiseeId,
      cupQuantity,
      lidQuantity,
      type
    }).save();
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/applications/me', authorize(), async (req, res) => {
  const franchiseeId = req.franchisee._id;
  try {
    let result = {
      receive: null,
      restore: null,
    };
    const receive = await Application.findOne({
      franchiseeId,
      type: 'receive'
    }).sort('-createdAt');
    if (receive && receive.status === 'waiting')
      result.receive = receive;

    const restore = await Application.findOne({
      franchiseeId,
      type: 'restore'
    }).sort('-createdAt');
    if (restore && restore.status === 'waiting')
      result.restore = restore;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/applications/:_id/canceled', authorize(), async (req, res) => {
  const _id = req.params._id;
  try {
    const application = await Application.findById(_id);
    if (!application)
      return res.status(404).json({ message: '해당 신청 내역을 찾을 수 없습니다.' });

    if (application.status === 'completed') 
      return res.status(400).json({ message: '해당 신청 내역은 이미 처리가 완료되었습니다.' });

    if (application.status === 'canceled')
      return res.status(400).json({ message: '해당 신청 내역은 이미 취소된 내역입니다.' });

    application.status = 'canceled';
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;