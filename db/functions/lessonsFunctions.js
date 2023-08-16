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

    const [existLesson] = await collection.find({}).toArray();
    const newLessons = await existLesson.lessons;

    await newLessons.map((newLessonLink, index) => {
        if (newLessons.length === lessonLinks.length) {
            newLessonLink.link = lessonLinks[index][1];
        } else {
            if (index > lessonLinks.length - 1) return;
            const firstLessonName = newLessonLink["title"]?.trim().toLowerCase();
            const secondLessonName = lessonLinks[index][0]?.trim().toLowerCase();

            if (firstLessonName === secondLessonName) {
                newLessonLink.link = lessonLinks[index][1];
            }
        }
    });

    await collection
        .deleteOne({ lessons: { $exists: true } })
        .catch(console.error);
    await collection
        .insertOne({ lessons: newLessons, dayTitle: existLesson[0].dayTitle })
        .catch(console.error)
        .finally(() => client.close());
}

const unpinLessonsScheduleMessage = async () => {
    const baseBotRequestURL = 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN;
    const vars = await getVars().then(data => data['vars']);
    const chatId = vars['test_group_chat_id'];
    //* For Prod:
    // const chatId = vars['supergroup_chat_id'];
    const linkMessageId = vars['LINK_MESSAGE_ID'];

    await axios.get(
        baseBotRequestURL + `/unpinAllChatMessages?chat_id=-100${chatId}`
    );
    await axios.get(
        baseBotRequestURL + `/pinChatMessage?chat_id=-100${chatId}&message_id=${linkMessageId}&disable_notification=true`
    );
}

module.exports = {
    getLessons,
    insertLessonsToDB,
    insertLinksToLessons,
    unpinLessonsScheduleMessage,
}