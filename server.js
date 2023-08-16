require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.LOCAL_PORT;

const defaultRouteRouter = require('./routes/defaultRouteRouter');
const lessonsRouter = require('./routes/lessonsRouter');
const hwRouter = require('./routes/hwRouter');
const varsRouter = require('./routes/varsRouter');
const historyRouter = require('./routes/historyRouter');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', defaultRouteRouter);
app.use('/lessons', lessonsRouter);
app.use('/hw', hwRouter);
app.use('/vars', varsRouter);
app.use('/history', historyRouter);

app.listen(PORT, () => {
    console.log(`Server was started on ${PORT}`);
});
