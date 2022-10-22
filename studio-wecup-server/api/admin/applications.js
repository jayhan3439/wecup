const { Router } = require('express');
const authorize = require('../../helpers/admin-authorize');
const { Application } = require('../../models');
const router = Router();
const wregexp = require('../../helpers/wregexp');

router.get('/applications', authorize(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const sort = req.query.sort || '-createdAt';
  const { franchiseeId, type, status } = req.query;
  try {
    const findOption = {};
    if (franchiseeId)
      findOption.franchiseeId = wregexp(franchiseeId)
    if (type)
      findOption.type = type;
    if (status)
      findOption.status = status;
    const query = Application.aggregate()
      .match(findOption)
      .lookup({
        from: 'franchisees',
        localField: 'franchiseeId',
        foreignField: '_id',
        as: 'franchisee',
      })
      .unwind('franchisee')
      .project({
        _id: '$_id',
        franchiseeId: '$franchiseeId',
        franchiseeName: '$franchisee.name',
        cupQuantity: '$cupQuantity',
        lidQuantity: '$lidQuantity',
        type: '$type',
        status: '$status',
        createdAt: '$createdAt',
      })
      .sort(sort)
      .skip(offset)
      .limit(limit)
    res.json(await query);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/applications/:_id/canceled', authorize(), async (req, res) => {
  const _id = req.params._id;
  try {
    const application = await Application.findById(_id)
    if (!application)
      return res.status(404).json({ message: '신청 내역을 찾을 수 없습니다.' });

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