const express = require('express');
const app = express();
const fs = require('fs/promises');
const path = require('path');

const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 4000;
const lessonsFilePath = path.join(__dirname, '../lessons.json');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.route('/api/lessons')
    .get(async (req, res) => {
        const lessons = await fs.readFile(lessonsFilePath, 'utf8', (err) => {
            if (err) throw err;
        });

        res.send(lessons);
    })
    .post(async (req, res) => {
        const newLessons = req.body;

        await fs.writeFile(lessonsFilePath, JSON.stringify(newLessons), (err) => {
            if (err) throw err;
        });
    });


app.listen(PORT, () => {
    console.log(`Server was started on ${PORT}`);
});

module.exports = app;