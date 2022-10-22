const { Router } = require('express');
const authorize = require('../../helpers/admin-authorize');
const { UserLog } = require('../../models');
const router = Router();

router.get('/overdue', authorize(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { type } = req.query;
  try {
    const query = UserLog.find({ overdue: true })
      .populate('franchisee', 'name')
      .skip(offset)
      .limit(limit)
      .sort('-createdAt');

    const overdue = await query;
    const result = [];
    overdue.forEach(v => {
      if (v.cupSerialNumber && v.lidSerialNumber) {
        result.push({
          _id: v._id,
          franchiseeId: v.franchiseeId,
          userPhoneNumber: v.userPhoneNumber,
          cupSerialNumber: v.cupSerialNumber,
          type: v.type,
          expiredAt: v.expiredAt,
          overdue: v.overdue,
          canceled: v.canceled,
          createdAt: v.createdAt,
          franchisee: v.franchisee
        });
        result.push({
          _id: v._id,
          franchiseeId: v.franchiseeId,
          userPhoneNumber: v.userPhoneNumber,
          lidSerialNumber: v.lidSerialNumber,
          type: v.type,
          expiredAt: v.expiredAt,
          overdue: v.overdue,
          canceled: v.canceled,
          createdAt: v.createdAt,
          franchisee: v.franchisee
        });
      }
    });
    if (type && type === 'cup') {
      return res.json(result.filter(v => v.cupSerialNumber).sort((a, b) => b.createdAt - a.createdAt));
    }
    if (type && type === 'lid') {
      return res.json(result.filter(v => v.lidSerialNumber).sort((a, b) => b.createdAt - a.createdAt));
    }
    
    res.json(result.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;