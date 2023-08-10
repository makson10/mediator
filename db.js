const client = require("@/mongoClient");

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
};