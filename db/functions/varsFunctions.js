const client = require('../../mongoClient');

const getVars = async () => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('vars');

    const [vars] = await collection
        .find({})
        .toArray()
        .catch(console.error)
    // .finally(() => client.close());

    return vars;
}

const updateLinkMessageId = async (newMessageId) => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('vars');

    await collection.updateOne(
        { vars: { $exists: true } },
        { $set: { "vars.LINK_MESSAGE_ID": newMessageId } }
    ).catch(console.error)
    // .finally(() => client.close());
}

const updateLessonScheduleMessageId = async (newMessageId) => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('vars');

    await collection.updateOne(
        { vars: { $exists: true } },
        { $set: { "vars.LESSON_SCHEDULE_MESSAGE_ID": newMessageId } }
    ).catch(console.error)
    // .finally(() => client.close());
}

module.exports = {
    getVars,
    updateLinkMessageId,
    updateLessonScheduleMessageId,
}