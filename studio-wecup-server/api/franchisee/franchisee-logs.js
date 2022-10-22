const { Router } = require('express');
const authorize = require('../../helpers/franchisee-authorize');
const { FranchiseeLog, Application } = require('../../models');
const router = Router();

router.get('/franchisee-logs/me', authorize(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const franchiseeId = req.franchisee._id;
  try {
    const franchiseeLogs = await FranchiseeLog.find({ franchiseeId })
      .skip(offset)
      .limit(limit)
      .sort('-createdAt');
    const createdAts = [];
    if (franchiseeLogs.length === 0)
      return res.json(franchiseeLogs);
    const result = franchiseeLogs.map(l => {
      createdAts.push(l.createdAt);
      if (l.releaseCup !== 0 || l.releaseLid !== 0) {
        return {
          type: 'receive',
          cupQuantity: l.releaseCup,
          lidQuantity: l.releaseLid,
          createdAt: l.createdAt
        }
      }
      if (l.receiveCup !== 0 || l.receiveLid !== 0) {
        return {
          type: 'restore',
          cupQuantity: l.receiveCup,
          lidQuantity: l.receiveLid,
          createdAt: l.createdAt
        }
      }
    });

    const endDate = offset !== 0 ? new Date(Math.min(...createdAts)) : new Date();
    const startDate = new Date(Math.max(...createdAts));

    const applicationLogs = await Application.find({
      franchiseeId,
      status: 'canceled',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    applicationLogs.forEach(l => {
      if (l.type === 'receive') {
        result.push({
          type: 'receive',
          cupQuantity: l.cupQuantity || 0,
          lidQuantity: l.lidQuantity || 0,
          createdAt: l.createdAt,
          status: l.status
        });
      }
      if (l.type === 'restore') {
        result.push({
          type: 'restore',
          cupQuantity: l.cupQuantity || 0,
          lidQuantity: l.lidQuantity || 0,
          createdAt: l.createdAt,
          status: l.status
        });
      }
    })
    res.json(result.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;