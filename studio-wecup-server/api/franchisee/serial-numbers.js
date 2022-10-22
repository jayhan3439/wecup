const { Router } = require('express');
const authorize = require('../../helpers/franchisee-authorize');
const { Cup, Lid, UserLog } = require('../../models');
const router = Router();

router.get('/serial-numbers/:serialNumber', authorize(), async (req, res) => {
  const serialNumber = req.params.serialNumber;
  const { type } = req.query;
  try {
    if (type === 'rental') {
      const cup = await Cup.findOne({ serialNumber });
      const lid = await Lid.findOne({ serialNumber });
      if (!cup && !lid)
        return res.status(404).json({ message: '해당 일련번호의 컵/리드를 찾을 수 없습니다.' });
      if (cup && lid)
        return res.status(400).json({ message: '컵의 일련번호와 리드의 일련번호가 중복됩니다.' });
      if (cup && !lid)
        return res.json({ cup });
      if (!cup && lid)
        return res.json({ lid });
    }
    else if (type === 'restore') {
      const cup = await Cup.findOne({ serialNumber });
      const lid = await Lid.findOne({ serialNumber });
      if (!cup && !lid)
        return res.status(404).json({ message: '해당 일련번호의 컵/리드를 찾을 수 없습니다.' });
      if (cup && lid)
        return res.status(400).json({ message: '컵의 일련번호와 리드의 일련번호가 중복됩니다.' });
      if (cup && !lid) {
        const rentalCup = await UserLog.findOne({ cupSerialNumber: serialNumber }).sort('-createdAt');
        if (!rentalCup || (rentalCup.type !== 'rental' && (rentalCup.canceled !== true || !rentalCup.canceled))) {
          return res.status(400).json({ message: '대여되지 않은 컵입니다.' });
        }
        return res.json({ cup });
      }
      if (!cup && lid) {
        const rentalLid = await UserLog.findOne({ lidSerialNumber: serialNumber }).sort('-createdAt');
        if (!rentalLid || (rentalLid.type !== 'rental' && (rentalLid.canceled !== true || !rentalLid.canceled)))
          return res.status(400).json({ message: '대여되지 않은 리드입니다.' });
        return res.json({ lid });
      }
    }
    else
      return res.status(400).json({ message: 'type 쿼리값을 지정해 주세요.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;