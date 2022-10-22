const { Router } = require('express');
const router = Router();
const { UserCup, UserLid, User } = require('../../models');

router.get('/my-rentals',  async (req, res) => {
  const { phoneNumber } = req.query;
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user)
      return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });

    const userCup = await UserCup.findOne({ userId: user._id });
    const userLid = await UserLid.findOne({ userId: user._id });

    res.json({ cupQuantity: userCup.quantity, lidQuantity: userLid.quantity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;