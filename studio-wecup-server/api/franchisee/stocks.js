const { Router } = require('express');
const authorize = require('../../helpers/franchisee-authorize');
const { FranchiseeCup, FranchiseeLid } = require('../../models');
const router = Router();

router.get('/stocks', authorize(), async (req, res) => {
  const franchiseeId = req.franchisee._id;
  try {
    const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId });
    const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId });

    res.json({ cupQuantity: franchiseeCup.quantity, lidQuantity: franchiseeLid.quantity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;