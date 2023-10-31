const { default: axios } = require('axios');
const client = require('../../mongoClient');
const { getVars } = require('./varsFunctions');

const getLessons = async () => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const lessons = await collection
        .find({})
        .toArray()
        .then(res => res[0])
        .catch(console.error)
    // .finally(() => client.close());

    return lessons;
}

const insertLessonsToDB = async (newLessons) => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    await collection
        .deleteMany({ lessons: { $exists: true } })
        .catch(console.error);
    await collection
        .insertOne(newLessons)
        .catch(console.error)
    // .finally(() => client.close());
}

const compareTime = (a, b) => {
    const hourA = a.time.hour;
    const minuteA = a.time.minute;
    const hourB = b.time.hour;
    const minuteB = b.time.minute

    if (hourA < hourB) return -1;
    else if (hourA > hourB) return 1;
    else {
        if (minuteA < minuteB) return -1;
        else if (minuteA > minuteB) return 1;
        else return 0;
    }
}

const addLessonToSchedule = async (lessonToAdd) => {
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const lessonsSchedule = await getLessons();
    const newLessons = lessonsSchedule['lessons'];

    newLessons.push(lessonToAdd);
    newLessons.sort(compareTime);

    await collection
        .deleteMany({ lessons: { $exists: true } })
        .catch(console.error);
    await collection
        .insertOne({
            dayTitle: lessonsSchedule.dayTitle,
            lessons: newLessons,
        })
        .catch(console.error)
}

const removeLessonFromSchedule = async (lessonForRemoveTitle) => {
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const lessonsSchedule = await getLessons();
    const newLessons = lessonsSchedule['lessons'];

    newLessons.map((lesson, index) => {
        if (lesson.title === lessonForRemoveTitle) newLessons.splice(index, 1);
    });

    await collection
        .deleteMany({ lessons: { $exists: true } })
        .catch(console.error);
    await collection
        .insertOne({
            dayTitle: lessonsSchedule.dayTitle,
            lessons: newLessons,
        })
        .catch(console.error)
}

const insertLinksToLessons = async (lessonLinks) => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const [schedule] = await collection.find({}).toArray();
    const existLesson = schedule.lessons;
    const newLessons = existLesson;

    for (let i = 0; i < existLesson.length; i++) {
        newLessons[i].link = lessonLinks[i];
    }

    await collection
        .deleteMany({ lessons: { $exists: true } })
        .catch(console.error);
    await collection
        .insertOne({
            lessons: newLessons,
            dayTitle: schedule.dayTitle
        })
        .catch(console.error)
    // .finally(() => client.close());
}

const unpinLessonsScheduleMessage = async () => {
    const baseBotRequestURL = 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN;
    const vars = await getVars().then(data => data['vars']);
    const chatId = vars.supergroup_chat_id;
    const lessonScheduleMessageId = vars.LESSON_SCHEDULE_MESSAGE_ID;

    await axios.get(
        baseBotRequestURL + `/unpinChatMessage?chat_id=-100${chatId}&message_id=${lessonScheduleMessageId}`
    );
}

module.exports = {
    getLessons,
    insertLessonsToDB,
    addLessonToSchedule,
    removeLessonFromSchedule,
    insertLinksToLessons,
    unpinLessonsScheduleMessage,
}