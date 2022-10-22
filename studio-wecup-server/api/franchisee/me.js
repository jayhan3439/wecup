const { Router } = require('express');
const authorize = require('../../helpers/franchisee-authorize');
const { Franchisee } = require('../../models');
const router = Router();

router.get('/me', authorize(), async (req, res) => {
  const franchiseeId = req.franchisee._id;
  try {
    const franchisee = await Franchisee.findOne({ _id: franchiseeId, hidden: { $ne: true } });
    if (!franchisee)
      return res.status(404).json({ message: '로그인한 가맹점 정보를 찾을 수 없습니다.' });
    const f = franchisee.toObject();
    delete f.password;
    res.json(f);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;