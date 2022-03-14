const express = require('express')

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const connection = mongoose.connection;

const app = express()
const port = 3000
const CronJob = require('cron').CronJob;
const fs = require('fs');
const parse = require('csv-parse');
// const globalFunc = require('./routes/fonctions/global');
const write = require('write');

const addEcole = require ("./crontab/add_ecole");
const addFormation = require('./crontab/add_metier_formation');
const parcours = require('./tools/parcours');

mongoose.connect('mongodb+srv://nodetest:nodepassword@cluster0.ysysx.mongodb.net/parcoursDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

connection.on('error', error => {
	console.error(`Connection to MongoDB error: ${error.message}`);
});

connection.once('open', () => {
	console.log('Connected to MongoDB');
	
//  addEcole();
//  addFormation();
  parcours.createParcours("meteorologiste", 5);
//parcours.createParcours("conseiller/ere en fusion-acquisition", 5);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// API Routes
const indexRoute = require('./routes/index');
// const ecoleRoute = require('./routes/ecole');

app.use('/api', indexRoute);
// app.use('/api/ecole',ecoleRoute);

app.get('/', (req, res) => {
  res.status(301).json('API Node Test')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})