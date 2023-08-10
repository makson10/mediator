const express = require('express');
const router = express.Router();
const db = require('@/db');

router.get('/', async (req, res) => {
    const hw = await db.getHWs();
    res.status(200).send(hw);
});

router.post('/addHw', async (req, res) => {
    const hw = req.body;

    await db.insertHWToDB(hw);
    res.sendStatus(200);
});

router.post('/delete', async (req, res) => {
    const hwName = req.body.lessonTitle;

    await db.deleteHW(hwName);
    res.sendStatus(200);
});

router.post('/deleteAllHw', async (req, res) => {
    await db.deleteAllHw();
    res.sendStatus(200);
});

module.exports = router;