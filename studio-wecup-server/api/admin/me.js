const { Router } = require('express');
const router = Router();
const authorize = require('../../helpers/admin-authorize');

router.get('/me', authorize(), async (req, res) => {
  const admin = req.admin;
  try {
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

module.exports = router;