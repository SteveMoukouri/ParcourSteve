const express = require('express')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
require('dotenv').config()
const jwt = require('jsonwebtoken');

console.log(process.env.MOTDEPASSE)

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
const addFormationParNiveau = require('./crontab/add_formation_niveau');
const machinelearningTools = require ('./tools/machinelearningTools');

mongoose.connect(`mongodb+srv://${process.env.USERMONGODB}:${process.env.PASSWORDMONGODB}@${process.env.HOSTMONGODB}/${process.env.MONGODBNAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

connection.on('error', error => {
	console.error(`Connection to MongoDB error: ${error.message}`);
});

const crontabType = process.argv[2];

connection.once('open', () => {
	console.log('Connected to MongoDB');
  switch (crontabType) {
    case "addEcole":
      addEcole();
      break;
    case "addFormation":
      addFormation();
      break;
    case "addFormationParNiveau":
      addFormationParNiveau();
      break;
    case "machineLearning":
      machinelearningTools();
      break;

    case "addParcours":
      parcours.searchParcours1('meteorologiste').then(metiers => {
        console.log(metiers);
        if (metiers.length > 0) {
          parcours.searchParcours2(metiers[0].id_metier, 2, "Pessac").then(formations => {
            console.log(formations);
          });
        }
      });
      break;

    case "autoParcours":
      parcours.searchParcours1('meteorologiste').then(metiers => {
        console.log(metiers);
        if (metiers.length > 0) {
          parcours.createParcours(metiers[0].id_metier, 2).then(formations => {
            console.log(formations);
          });
        }
      });
      break;
  
    default:
      break;
  }
  // parcours.createParcours("meteorologiste", 5);
  // parcours.createParcours("conseiller/ere en fusion-acquisition", 5);
});

if (crontabType === undefined) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // for parsing application/json
  app.use(bodyParser.json()); 

  // for parsing application/xwww-
  app.use(bodyParser.urlencoded({ extended: true })); 
  //form-urlencoded

  // for parsing multipart/form-data
  app.use(upload.array()); 
  app.use(express.static('public'));

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

  function authUser (req, res, next) {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split('Bearer ')[1];
      try{
        const decoded = jwt.verify(token, process.env.SECRETKEYTOKEN);
        req.headers.userId = decoded.userId;

        next();
      } catch(error) {
        res.status(401).send(error.message);
      }
    } else {
      res.status(401).send('Aucun token défini');
    }
  }

  // API Routes
  const indexRoute = require('./routes/index');
  const authRoute = require('./routes/auth');
  const schoolRoute = require('./routes/school');
  const userRoute = require('./routes/user');
  const jobRoute = require ('./routes/job');
  const parcoursRoute = require ('./routes/parcours');

  app.use('/api', indexRoute);
  app.use('/api/auth', authRoute);
  app.use('/api/school', schoolRoute);
  app.use('/api/user', userRoute);
  app.use('/api/job',jobRoute);
  app.use('/api/parcours', authUser, parcoursRoute);

  app.get('/', (req, res) => {
    res.status(301).json('API Node Test')
  })

  app.listen(port, () => {
    console.log(`ParcourSteve app listening at http://localhost:${port}`)
  })
}