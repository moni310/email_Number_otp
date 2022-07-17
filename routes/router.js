const router = require('express').Router();

router.use('/auth', require('./auth.route'));
// router.use("/admin",require("../Admin/admin"))
module.exports = router;
