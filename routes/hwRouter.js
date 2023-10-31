const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', async (req, res) => {
    const hw = await db.getHWs().then(data => data['homeworks']);
    const sortedHw = await db.sortingHw(hw);
    res.status(200).send(sortedHw);
});

router.post('/addHw', async (req, res) => {
    const hw = req.body;

    await db.insertHwToDB(hw);
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

router.post('/removeOldHwLinks', async (req, res) => {
    await db.removeOldHwLinks();
    res.sendStatus(200);
});

module.exports = router;