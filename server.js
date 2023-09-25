const express = require('express');
const app = express();

const cors = require('cors');

const bodyParser = require('body-parser');


app.use(cors());
app.use(bodyParser.json());


const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});