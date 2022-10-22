const { Router } = require('express');
const router = Router();

router.use(require('./franchisees'));
router.use(require('./pin-codes'));
router.use(require('./login'));
router.use(require('./rentals'));
router.use(require('./user-logs'));
router.use(require('./me'));

module.exports = router;