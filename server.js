const express = require('express');
const app = express();

const {logger} = require('./lib/logger');

const cors = require('cors');

const bodyParser = require('body-parser');


const { router: authRouter } = require('./router/auth');
const MyCustomError = require('./lib/custom_error');
const mongo = require('./lib/mongo');


app.use(cors());
app.use(bodyParser.json());


const server_port = process.env.PORT || 3000;

app.use('/auth', authRouter);

app.use((req,res)=>{
  throw new MyCustomError('NotFound','Not found', 404);
})

app.use((err, req, res, next)=>{
  console.log(err);
  if(err instanceof MyCustomError){
    res.status(err.status).json({error: err.name, message: err.message});
  }else{
    res.status(500).json({error: 'Something went wrong'});
  }
})


mongo
  .connect()
  .then(async () => {
    //初期化用のコード
    await mongo.init();
  })
  .then(() => {
    app.listen(server_port, () => {
      logger.info(`Server is listening on port ${server_port}`);
    });
  })
  .catch((err) => {
    logger.error(err);
  });