const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const app = express();
const connectDB = require('./db/db');
const routes = require('./routes/transactions');
const {readdirSync} = require('fs');
require('dotenv').config();


//middleware
app.use(cors());
app.use(express.json());


//routes
readdirSync('./routes').map((route) => { app.use('/api/v1/transactions', require(`./routes/${route}`)) })


const server = (res,req) => {
connectDB();
  app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

}
 server()
