const client = require('../../mongoClient');

const getLessons = async () => {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const [lessons] = await collection
        .find({}).toArray()
        .catch(console.error)
        .finally(() => client.close());;

    return lessons;
}

const insertLessonsToDB = async (newLessons) => {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    await collection
        .deleteMany({ lessons: { $exists: true } })
        .catch(console.error);
    await collection
        .insertOne(newLessons)
        .catch(console.error)
        .finally(() => client.close());
}

const insertLinksToLessons = async (lessonLinks) => {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const [scheduleFromDb] = await collection.find({}).toArray();
    const existLesson = scheduleFromDb.lessons;

    const newLessons = await existLesson.map((lesson, index) => {
        if (lessonLinks[index][1] === undefined && existLesson.length === lessonLinks.length) {
            lesson.link = lessonLinks[index][0];
            return lesson;
        } else {
            if (index > lessonLinks.length - 1) return;
            const firstLessonName = lesson.title?.trim().toLowerCase();
            const secondLessonName = lessonLinks[index][0]?.trim().toLowerCase();

            if (firstLessonName === secondLessonName) {
                lesson.link = lessonLinks[index][1];
            }

            return lesson;
        }
    });

    await collection
        .deleteOne({ lessons: { $exists: true } })
        .catch(console.error);
    await collection
        .insertOne({ lessons: newLessons, dayTitle: scheduleFromDb.dayTitle })
        .catch(console.error)
        .finally(() => client.close());
}

const unpinLessonsScheduleMessage = async () => {
    const baseBotRequestURL = 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN;
    const vars = await getVars().then(data => data['vars']);
    const chatId = vars['supergroup_chat_id'];
    const lessonScheduleMessageId = vars['LESSON_SCHEDULE_MESSAGE_ID'];

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