const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const routes=require("./routes/router")
// const admin = require("./Admin/admin")
app.use(cors());
app.use(express.json());


const PORT=process.env.PORT || 5000
const DB_URI=process.env.DB_URI



app.use("/",routes);

// app.use(express("/admin",admin))
const Main = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("db conected")


    app.listen(PORT, async () => {

      console.log(`server started ON ${PORT}`)
    });
  } catch (error) {
    console.log(error);
  }
};

Main();

