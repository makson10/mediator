const client = require('../../mongoClient');

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
    getHWs,
    insertHWToDB,
    deleteHW,
    deleteAllHw,
    returnLastDeletedLink,
}