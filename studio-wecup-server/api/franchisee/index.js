const { Router } = require('express');
const router = Router();

router.use(require('./login'));
router.use(require('./pin-codes'));
router.use(require('./serial-numbers'));
router.use(require('./rentals'));
router.use(require('./restores'));
router.use(require('./user-logs'));
router.use(require('./me'));
router.use(require('./applications'));
router.use(require('./franchisee-logs'));
router.use(require('./stocks'));

module.exports = router;