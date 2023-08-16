const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', async (req, res) => {
    const vars = await db.getVars();
    res.status(200).send(vars);
});

router.post('/updateLinkMessageId', async (req, res) => {
    const newLinkMessageId = req.body.newLinkMessageId;

    await db.updateLinkMessageId(newLinkMessageId);
    res.sendStatus(200);
});

module.exports = router;