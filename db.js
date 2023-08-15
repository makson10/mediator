const axios = require('axios').default;
const client = require("./mongoClient");
const dateRegex = /[0-3][0-9].[0-1][0-9]/gm;

const getVars = async () => {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('vars');

    const [vars] = await collection
        .find({})
        .toArray()
        .catch(console.error)
        .finally(() => client.close());

    return vars;
}

const updateLinkMessageId = async (newLinkMessageId) => {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('vars');

    await collection.updateOne(
        { vars: { $exists: true } },
        { $set: { "vars.LINK_MESSAGE_ID": newLinkMessageId } }
    ).catch(console.error).finally(() => client.close());
}


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


const getHomeworksToToday = async (homeworks) => {
    const date = new Date();
    const todayDay = date.getDate();
    let todayMonth = date.getMonth() + 1;
    if (todayMonth.toString().length === 1) todayMonth = '0' + todayMonth;

    const todayRegex = new RegExp(todayDay + '.' + todayMonth, 'gm');

    const homeworksWithTodayWord = homeworks.filter((homework) => /сегодня/gmi.test(homework.lessonTitle));
    const homeworksToTodayByDate = homeworks.filter((homework) => todayRegex.test(homework.lessonTitle));
    const homeworksWithYesterdayWord = homeworks.filter((homework) => /завтра/gmi.test(homework.lessonTitle));

    const homeworksToToday = [
        ...homeworksWithTodayWord,
        ...homeworksToTodayByDate,
        ...homeworksWithYesterdayWord
    ];

    return homeworksToToday;
}

const getHomeworksWithDate = async (homeworks) => {
    const homeworksWithDate = homeworks.filter(
        (homework) => homework['lessonTitle'].match(dateRegex)
    );

    return homeworksWithDate;
}

const makeBubbleSorting = async (homeworks) => {
    const hwAmount = homeworks.length;

    for (let i = 0; i < hwAmount - 1; i++) {
        const homework = homeworks[i];
        const homeworkDate = homework['lessonTitle'].match(dateRegex);
        let [homeworkDay, homeworkMonth] = homeworkDate[0].split('.');
        homeworkDay = +homeworkDay;
        homeworkMonth = +homeworkMonth;

        const nextHomework = homeworks[i + 1];
        const nextHomeworkDate = nextHomework['lessonTitle'].match(dateRegex);
        let [nextHomeworkDay, nextHomeworkMonth] = nextHomeworkDate[0].split('.');
        nextHomeworkDay = +nextHomeworkDay;
        nextHomeworkMonth = +nextHomeworkMonth;

        if (homeworkMonth > nextHomeworkMonth) {
            const temp = homeworks[i];
            homeworks[i] = homeworks[i + 1];
            homeworks[i + 1] = temp;
        }
    }

    for (let i = 0; i < hwAmount - 1; i++) {
        let swaped = false;

        for (let j = 0; j < hwAmount - i - 1; j++) {
            const homework = homeworks[j];
            const homeworkDate = homework['lessonTitle'].match(dateRegex);
            let [homeworkDay, homeworkMonth] = homeworkDate[0].split('.');
            homeworkDay = +homeworkDay;
            homeworkMonth = +homeworkMonth;

            const nextHomework = homeworks[j + 1];
            const nextHomeworkDate = nextHomework['lessonTitle'].match(dateRegex);
            let [nextHomeworkDay, nextHomeworkMonth] = nextHomeworkDate[0].split('.');
            nextHomeworkDay = +nextHomeworkDay;
            nextHomeworkMonth = +nextHomeworkMonth;

            if (homeworkMonth === nextHomeworkMonth && homeworkDay > nextHomeworkDay) {
                const temp = homeworks[j];
                homeworks[j] = homeworks[j + 1];
                homeworks[j + 1] = temp;

                swaped = true;
            }
        }

        if (!swaped) return;
    }

    return homeworks;
};

const sortingHw = async (homeworks) => {
    const homeworksToToday = await getHomeworksToToday(homeworks);
    homeworks = homeworks.filter((hw) => !homeworksToToday.some(
        (hwToToday) => hw.lessonTitle === hwToToday.lessonTitle)
    );

    const homeworksWithDate = await getHomeworksWithDate(homeworks);
    homeworks = homeworks.filter((hw) => !homeworksWithDate.some(
        (hwWithDate) => hw.lessonTitle === hwWithDate.lessonTitle)
    );

    const otherHomework = homeworks;

    await makeBubbleSorting(homeworksWithDate);

    const sortedHomeworks = [
        ...homeworksToToday,
        ...homeworksWithDate,
        ...otherHomework,
    ];

    return sortedHomeworks;
}


const getHWs = async () => {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('hw');

    const [hw] = await collection
        .find({})
        .toArray()
        .catch(console.error)
        .finally(() => client.close());

    return hw;
}

const insertHWToDB = async (newHw) => {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('hw');

    await collection.updateOne(
        { homeworks: { $exists: true } }, { $push: { homeworks: newHw } }
    ).catch(console.error).finally(() => client.close());
}

const deleteHwFromDB = async (hwName) => {
    const db = client.db('mediatorDB');
    const hwCollection = db.collection('hw');
    const hws = await getExistHws();

    if (hws.length > 1) {
        await hwCollection.updateOne(
            { homeworks: { $exists: true } },
            { $pull: { homeworks: { lessonTitle: hwName } } }
        ).catch(console.error);
    } else {
        await hwCollection.updateOne(
            { homeworks: { $exists: true } },
            { $set: { homeworks: [] } }
        ).catch(console.error);
    }
};

const getExistHws = async () => {
    const db = client.db('mediatorDB');
    const hwCollection = db.collection('hw');

    const hws = (await hwCollection.find({}).toArray())[0]["homeworks"];
    return hws;
};

const findDeletedHw = async (hwName) => {
    const hws = await getExistHws();

    const deletedHw = hws.find((hw) => hw.lessonTitle === hwName);
    return deletedHw;
}

const addDeletedHwToHistory = async (deletedHwName) => {
    const db = client.db('mediatorDB');
    const historyCollection = db.collection('history');

    const deletedHw = await findDeletedHw(deletedHwName);

    const history = (await historyCollection.find({}).toArray())[0]["history"];

    if (history.length === 5) {
        await historyCollection.updateOne(
            { history: { $exists: true } },
            { $pop: { history: -1 } }
        ).catch(console.error);
    }

    await historyCollection.updateOne(
        { history: { $exists: true } },
        { $push: { history: deletedHw } }
    ).catch(console.error);
}

const deleteHW = async (hwName) => {
    await client.connect();

    await addDeletedHwToHistory(hwName);
    await deleteHwFromDB(hwName);
}


const deleteAllHw = async () => {
    await client.connect();
    const db = client.db('mediatorDB');
    const hwCollection = db.collection('hw');

    await hwCollection.updateOne(
        { homeworks: { $exists: true } },
        { $set: { homeworks: [] } }
    ).catch(console.error).finally(() => client.close());
}


const returnLastDeletedLink = async () => {
    await client.connect();
    const db = client.db('mediatorDB');
    const hwCollection = db.collection('hw');
    const historyCollection = db.collection('history');

    const history = (await historyCollection.find({}).toArray())[0]["history"];
    if (!history.length) return false;

    const lastDeletedLink = history.at(-1);

    await hwCollection.updateOne(
        { homeworks: { $exists: true } }, { $push: { homeworks: lastDeletedLink } }
    ).catch(console.error);

    await historyCollection.updateOne(
        { history: { $exists: true } }, { $pop: { history: 1 } }
    ).catch(console.error).finally(() => client.close());

    return true;
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
    getVars,
    updateLinkMessageId,
    insertLinksToLessons,
    getHWs,
    insertHWToDB,
    deleteHW,
    getLessons,
    insertLessonsToDB,
    deleteAllHw,
    returnLastDeletedLink,
    unpinLessonsScheduleMessage,
    sortingHw,
};