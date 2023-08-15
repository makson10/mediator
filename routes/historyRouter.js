const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/returnLastDeletedLink', async (req, res) => {
    const result = await db.returnLastDeletedLink();
    res.status(200).json({ ok: result });
});

module.exports = router;