const { MongoClient } = require('mongodb');
const mongoURL = process.env.mongoURL;
const client = new MongoClient(mongoURL);

const express = require('express');
const app = express();
const path = require('path');

const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.LOCAL_PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.route('/api/lessons')
    .get(async (req, res) => {
        const lessons = await getDataFromDB()
            .then((data) => data)
            .catch(console.error)
            .finally(() => client.close());

        res.status(200).send(...lessons);
    })
    .post(async (req, res) => {
        const newLessons = req.body;

        await insertDataToDB(newLessons);
    });


async function getDataFromDB() {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const data = await collection.find({}).toArray();
    return data;
}

async function insertDataToDB(data) {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    await collection.deleteMany({lessons: {$exists: true}});
    await collection.insertOne(data);
}

app.listen(PORT, () => {
    console.log(`Server was started on ${PORT}`);
});

module.exports = app;