const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.post('/login', async (req, res) => {
    const userCredentials = req.body;

    const userAccount = await db.loginUser(userCredentials);

    if (!userAccount) return res.status(200).json({ error: 'Don\'t have user with this credentials' });
    res.status(200).json({ appId: userAccount.appId });
});

router.post('/getuserchatid', async (req, res) => {
    const { appId } = req.body;
    const userChatId = await db.getUserChatId(appId);

    if (!userChatId) return res.status(200).json({ error: 'Don\'t have user chat id' });
    res.status(200).json({ userChatId: userChatId });
});

router.post('/getusersettings', async (req, res) => {
    const { appId } = req.body;

    const userSettings = await db.getUserSettings(appId);
    res.status(200).json(userSettings);
});

router.post('/setnewsettings', async (req, res) => {
    const { appId, newSettings } = req.body;

    await db.setNewSettings(appId, newSettings);
    res.sendStatus(200);
});

module.exports = router;
