const client = require('../../mongoClient');

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

module.exports = {
    getVars,
    updateLinkMessageId,
}