const { Router } = require('express');
const router = Router();
const { User } = require('../../models');

router.get('/me', async (req, res) => {
  const { phoneNumber } = req.query;
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user)
      return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });

    res.json({ userId: user._id, phoneNumber: user.phoneNumber });
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;