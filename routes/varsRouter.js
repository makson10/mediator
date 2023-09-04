const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', async (req, res) => {
    const vars = await db.getVars();
    res.status(200).send(vars);
});

router.post('/updateLinkMessageId', async (req, res) => {
    const newMessageId = req.body.newLinkMessageId;

    await db.updateLinkMessageId(newMessageId);
    res.sendStatus(200);
});

router.post('/updateLessonScheduleMessageId', async (req, res) => {
    const newMessageId = req.body.newLessonScheduleMessageId;

    await db.updateLessonScheduleMessageId(newMessageId);
    res.sendStatus(200);
});

module.exports = router;