const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const PORT = 4000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});


app.route('/lessons')
    .get(async (req, res) => {
        const lessons = await fs.readFile('./lessons.json', 'utf-8', (err) => {
            if (err) throw err;
        });

        res.status(200).send(lessons);
    })
    .post((req, res) => {
        const lessonsData = req.body;

        fs.writeFile('./lessons.json', JSON.stringify(lessonsData));

        res.status(200).send('Your data was saved');
    });

// make validation: make correct order of lessons, correct time number


app.listen(PORT, () => {
    console.log(`Server was started on ${PORT}`);
});

//* code to future
// fetch('http://127.0.0.1:4000/lessons', {
//     method: 'POST',
//     body: JSON.stringify(lessons),
//     headers: {
//         'Content-Type': 'application/json'
//     },
// });