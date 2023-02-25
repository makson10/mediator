const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs/promises');

const PORT = 4000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'pug');


app.get('/', (req, res) => {
    res.render('index');
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


// * fuck html code 
// <!DOCTYPE html>
// <html lang="en">
// 	<head>
// 		<meta charset="UTF-8" />
// 		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
// 		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
// 		<title>Mediator</title>
// 		<style>
// 			body {
// 				overflow: hidden;
// 				min-height: 100vh;
// 				font-family: sans-serif;

// 				display: flex;
// 				flex-direction: column;
// 				gap: 40px;
// 				justify-content: center;
// 				align-items: center;
// 			}

// 			#mediator-logo {
// 				width: 150px;
// 				height: 150px;
// 			}

// 			#mediator-text-wrapper {
// 				display: flex;
// 				flex-direction: column;
// 				gap: 10px;
// 			}

// 			#mediator-title {
// 				width: 100%;
// 				font-size: 3rem;
// 				text-align: center;
// 				font-weight: bold;

// 				animation: titleAnim 4000ms linear infinite;
// 			}

// 			#mediator-subtitle {
// 				font-size: 1.2rem;
// 			}

// 			@keyframes titleAnim {
// 				0%,
// 				100% {
// 					text-shadow: 0 0 5px blue;
// 				}

// 				25% {
// 					text-shadow: 0 0 5px yellow;
// 				}

// 				50% {
// 					text-shadow: 0 0 5px red;
// 				}

// 				75% {
// 					text-shadow: 0 0 5px green;
// 				}
// 			}
// 		</style>
// 	</head>
// 	<body>
// 		<img
// 			id="mediator-logo"
// 			src="https://img.icons8.com/officel/200/000000/mediator.png" />
// 		<div id="mediator-text-wrapper">
// 			<span id="mediator-title">Mediator</span>
// 			<span id="mediator-subtitle">
// 				Intermediate server between PHPBoyFriend and LessonReminder
// 			</span>
// 		</div>
// 	</body>
// </html>