const { Router } = require('express');
const { Franchisee } = require('../../models');
const router = Router();

router.get('/franchisees', async (req, res) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);
  try {
    if (!lng || !lat)
      return res.status(400).json({ message: '위치설정을 해주세요.' });

    const findOption = {};
    findOption.location = { $exists: true };
    findOption.activation = true;
    findOption.hidden = { $ne: true };
    const query = Franchisee.aggregate([
      {
        $geoNear: {
          near: [lng, lat],
          distanceField: 'distance',
          key: 'location',
          spherical: true,
          distanceMultiplier: 6371,
          maxDistance: 5 / 6371
        }
      },
      {
        $match: findOption
      }
    ])
    query.addFields({ distance: { $toInt: "$distance" } });
    query.sort({ distance: 1 });
    const franchisees = await query;
    res.json(franchisees.map(f => {
      delete f.password;
      delete f.username;
      return f;
    }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/franchisees/:_id', async (req, res) => {
  const _id = req.params;
  try {
    const franchisee = await Franchisee.findById(_id);
    if (!franchisee)
      return res.status(404).json({ message: '가맹점 정보를 찾을 수 없습니다.' });

    const f = franchisee.toObject();
    delete f.password;
    delete f.username;
    res.json(f);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;