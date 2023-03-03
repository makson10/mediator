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
        const lessons = await getLessonsFromDB()
            .then((data) => data)
            .catch(console.error)
            .finally(() => client.close());

        res.status(200).send(...lessons);
    })
    .post(async (req, res) => {
        const newLessons = req.body;

        await insertLessonsToDB(newLessons);
    });

app.post('/api/lessons/addLinks', async (req, res) => {
    const lessonLinks = req.body.lessonLinks;

    await addLinksToLesson(lessonLinks);
    res.status(200).send('All is good!');
});

app.route('/api/hw')
    .get(async (req, res) => {
        const hw = await getHWFromDB()
            .then((data) => data)
            .catch(console.error)
            .finally(() => client.close());

        console.log(hw);

        res.status(200).send(...hw);
    })
    .post(async (req, res) => {
        const hw = req.body;

        await insertHWToDB(hw);
        res.status(200).send('All is good!');
    });

app.post('/api/hw/remove', async (req, res) => {
    const hwName = req.body.lessonName;

    await deleteOneHW(hwName);
    res.status(200).send('All is good!');
});

app.post('/api/hw/remove/all', async (req, res) => {
    await deleteAllHW();
    res.status(200).send('All is good!');
});

app.get('/api/vars', async (req, res) => {
    const vars = await getVars()
        .then((data) => data)
        .catch(console.error)
        .finally(() => client.close());

    res.status(200).send(vars);
});

app.post('/api/vars/setLinkMessage', async (req, res) => {
    const linkMessageId = req.body.linkMessageId;

    await insertLinkMessageId(linkMessageId);
    res.status(200).send('All is good!');
});



async function getVars() {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('vars');

    const data = await collection.find({}).toArray();
    return data;
}

async function insertLinkMessageId(data) {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('vars');

    await collection.updateOne(
        { vars: { $exists: true } },
        { $set: { "vars.LINK_MESSAGE_ID": data } }
    );
}

async function addLinksToLesson(lessonLinks) {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const existLesson = await collection.find({}).toArray();
    const newLessons = await existLesson[0].lessons;

    await newLessons.map((newLessonLink, index) => {
        if (newLessons.length === lessonLinks.length) {
            newLessonLink.link = lessonLinks[index][1];
        } else {
            if (index > lessonLinks.length - 1) return;
            const firstLessonName = newLessonLink["title"] && newLessonLink["title"].trim().toLowerCase();
            const secondLessonName = lessonLinks[index][0]?.trim().toLowerCase();

            if (firstLessonName === secondLessonName) {
                newLessonLink.link = lessonLinks[index][1];
            }
        }
    });

    await collection.deleteOne({ lessons: { $exists: true } });
    await collection.insertOne({ lessons: newLessons, dayTitle: existLesson[0].dayTitle });
}

async function getHWFromDB() {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('hw');

    const data = await collection.find({}).toArray();
    return data;
}

async function insertHWToDB(data) {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('hw');

    await collection.updateOne(
        { homeworks: { $exists: true } }, { $push: { homeworks: data } }
    );
}

async function deleteOneHW(hwName) {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('hw');

    await collection.updateOne(
        { homeworks: { $exists: true } },
        { $pull: { homeworks: { lessonName: hwName } } }
    );
}

async function deleteAllHW() {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('hw');

    await collection.updateOne(
        { homeworks: { $exists: true } },
        { $set: { homeworks: [] } }
    );
}

async function getLessonsFromDB() {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    const data = await collection.find({}).toArray();
    return data;
}

async function insertLessonsToDB(data) {
    await client.connect();
    const db = client.db('mediatorDB');
    const collection = db.collection('lessons');

    await collection.deleteMany({ lessons: { $exists: true } });
    await collection.insertOne(data);
}


app.listen(PORT, () => {
    console.log(`Server was started on ${PORT}`);
});

module.exports = app;