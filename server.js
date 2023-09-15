require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const client = require('./mongoClient');

const PORT = process.env.LOCAL_PORT;

const defaultRouteRouter = require('./routes/defaultRouteRouter');
const lessonsRouter = require('./routes/lessonsRouter');
const hwRouter = require('./routes/hwRouter');
const varsRouter = require('./routes/varsRouter');
const historyRouter = require('./routes/historyRouter');
const accountsRouter = require('./routes/accountsRouter');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', defaultRouteRouter);
app.use('/lessons', lessonsRouter);
app.use('/hw', hwRouter);
app.use('/vars', varsRouter);
app.use('/history', historyRouter);
app.use('/accounts', accountsRouter);

app.listen(PORT, async () => {
    await client.connect();
    console.log(`Server was started on ${PORT}`);
});
