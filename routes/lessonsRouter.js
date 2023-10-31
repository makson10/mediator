const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', async (req, res) => {
    const lessons = await db.getLessons();
    res.status(200).send(lessons);
});

router.post('/updateLessons', async (req, res) => {
    const newLessons = req.body;

    await db.insertLessonsToDB(newLessons);
    res.sendStatus(200);
});

router.post('/addLesson', async (req, res) => {
    const newLesson = req.body.newLesson;

    await db.addLessonToSchedule(newLesson);
    res.sendStatus(200);
});

router.post('/removeLesson', async (req, res) => {
    const lessonTitle = req.body.lessonTitle;

    await db.removeLessonFromSchedule(lessonTitle);
    res.sendStatus(200);
});

router.post('/addLinks', async (req, res) => {
    const lessonLinks = req.body.lessonLinks;

    await db.insertLinksToLessons(lessonLinks);
    res.sendStatus(200);
});

router.get('/unpinLessonsScheduleMessage', async (req, res) => {
    await db.unpinLessonsScheduleMessage();
    res.sendStatus(200);
});

module.exports = router;