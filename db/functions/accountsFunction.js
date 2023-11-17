const client = require('../../mongoClient');

const getAccounts = async () => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('accounts');

    const accounts = await collection
        .find({})
        .toArray()
        .then(document => document[0]['accounts'])
        .catch(console.error)
    // .finally(() => client.close());

    return accounts;
}

const getUserAccount = async (appId) => {
    const accounts = await getAccounts();
    return accounts.find((account) => account.appId === appId);
};

const loginUser = async (userCredentials) => {
    const accounts = await getAccounts();
    return accounts.find((account) => {
        return account.login === userCredentials.login && account.password === userCredentials.password
    });
};

const getUserChatId = async (appId) => {
    const userAccount = await getUserAccount(appId);

    if (!userAccount) return null;
    return userAccount.userChatId;
}

const getUserSettings = async (appId) => {
    const userAccount = await getUserAccount(appId);

    if (!userAccount) return null;
    return userAccount.settings;
}

const setNewSettings = async (appId, newSettings) => {
    // await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('accounts');

    const filter = { "accounts": { $elemMatch: { "appId": appId } } };
    const update = { $set: { "accounts.$.settings": newSettings } };

    await collection
        .updateOne(filter, update)
        .catch(console.error)
    // .finally(() => client.close());
}

module.exports = {
    getAccounts,
    loginUser,
    getUserChatId,
    getUserSettings,
    setNewSettings,
};