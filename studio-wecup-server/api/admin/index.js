const { Router } = require('express');
const router = Router();

router.use(require('./login'));
router.use(require('./me'));
router.use(require('./franchisees'));
router.use(require('./cups'));
router.use(require('./lids'));
router.use(require('./release'));
router.use(require('./receive'));
router.use(require('./franchisee-logs'));
router.use(require('./users'));
router.use(require('./user-logs'));
router.use(require('./applications'));
router.use(require('./overdue'));

module.exports = router;