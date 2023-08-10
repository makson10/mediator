const { MongoClient } = require('mongodb');
const mongoURL = process.env.mongoURL;
const client = new MongoClient(mongoURL);

module.exports = client;