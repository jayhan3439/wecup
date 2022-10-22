const { Router } = require('express');
const wregexp = require('../../helpers/wregexp');
const router = Router();
const { UserLog, User } = require('../../models');

router.get('/user-logs/me', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { phoneNumber, q, from, to } = req.query;
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user)
      return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });

    const findOption = {};
    const dateFilter = {};
    if (q)
      findOption['franchisee.name'] = wregexp(q);
    if (from)
      dateFilter.$gte = new Date(from);
    if (to)
      dateFilter.$lte = new Date((new Date(to) - 0) + 1000 * 60 * 60 * 24);

    if (from || to)
      findOption.createdAt = dateFilter;
    const query = UserLog.aggregate()
      .match({ userPhoneNumber: user.phoneNumber })
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

    res.json(await query);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;