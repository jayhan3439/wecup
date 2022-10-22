const { Router } = require('express');
const router = Router();

router.use('/admin', require('./admin'));
router.use('/franchisee', require('./franchisee'));
router.use('/user', require('./user'));

router.use(require('./coords'));

module.exports = router;