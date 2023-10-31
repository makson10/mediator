const { default: axios } = require('axios');
const client = require('../../mongoClient');
const { getVars } = require('./varsFunctions');

const dateRegex = /[0-3][0-9].[0-1][0-9]/gm;
const todayDate = new Date();

const getHWs = async () => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('hw');

    const [hw] = await collection
        .find({})
        .toArray()
        .catch(console.error)
    // .finally(() => client.close());

    return hw;
}

const insertHwToDB = async (newHw) => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('hw');

    await collection.updateOne(
        { homeworks: { $exists: true } }, { $push: { homeworks: newHw } }
    ).catch(console.error)
    // .finally(() => client.close());
}

const insertNewHwToDB = async (newHw) => {
    const db = client.db('mediatorDB');
    const hwCollection = db.collection('hw');

    await hwCollection.updateOne(
        { homeworks: { $exists: true } },
        { $set: { homeworks: newHw } }
    ).catch(console.error);
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
    // await client.connect();

    await addDeletedHwToHistory(hwName);
    await deleteHwFromDB(hwName);
}

const deleteAllHw = async () => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const hwCollection = db.collection('hw');

    await hwCollection.updateOne(
        { homeworks: { $exists: true } },
        { $set: { homeworks: [] } }
    ).catch(console.error)
    // .finally(() => client.close());
}

const returnLastDeletedLink = async () => {
    // await client.connect();
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
    ).catch(console.error);
    // .finally(() => client.close());

    return true;
}

const sendReplyMessageForDeletedHw = async (hwLink) => {
    const baseBotRequestURL = 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN;
    const supergroupId = await getVars().then(vars => vars['vars']['supergroup_chat_id']);
    const baseHwURL = 'https://t.me/c/' + supergroupId + '/';
    const hwMessageId = hwLink.replace(baseHwURL, '');

    await axios.get(
        baseBotRequestURL + `/sendMessage?chat_id=-100${supergroupId}&text=%2E&reply_to_message_id=${hwMessageId}`
    );
}

const removeOldHwLinks = async () => {
    const todayDay = todayDate.getDate();
    const todayMonth = todayDate.getMonth() + 1;
    const hws = await getHWs().then(data => data['homeworks']);

    const promiseChain = await hws.map(async (hw) => {
        const hwTitle = hw.lessonTitle;
        const homeworkDate = hwTitle.match(dateRegex);
        if (!homeworkDate) return hw;

        let [homeworkDay, homeworkMonth] = homeworkDate[0].split('.');
        [homeworkDay, homeworkMonth] = [+homeworkDay, +homeworkMonth];

        if (homeworkDay <= todayDay && homeworkMonth <= todayMonth) {
            return sendReplyMessageForDeletedHw(hw.link);
        }

        return hw;
    });

    const newHw = (await Promise.all(promiseChain)).filter(hw => !!hw);
    await insertNewHwToDB(newHw);
}

module.exports = {
    getHWs,
    insertHwToDB,
    deleteHW,
    deleteAllHw,
    returnLastDeletedLink,
    removeOldHwLinks,
}