const express = require('express');
const router = express.Router();
const { uploadAvatar } = require('../controllers/avatar.controller');

router.post('/upload/:userId', uploadAvatar);

module.exports = router;