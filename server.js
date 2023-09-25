const express = require('express');
const app = express();

const cors = require('cors');

const bodyParser = require('body-parser');


const { router: authRouter } = require('./router/auth');
const MyCustomError = require('./lib/custom_error');


app.use(cors());
app.use(bodyParser.json());


const port = process.env.PORT || 3000;

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

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});