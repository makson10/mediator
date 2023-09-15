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
        .insertOne({ lessons: newLessons, dayTitle: schedule.dayTitle })
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
    insertLinksToLessons,
    unpinLessonsScheduleMessage,
}