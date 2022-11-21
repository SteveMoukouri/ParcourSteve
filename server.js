const express = require('express')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
require('dotenv').config()
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const connection = mongoose.connection;

const app = express()
const port = 3000
const CronJob = require('cron').CronJob;
const fs = require('fs');
const parse = require('csv-parse');
var cors = require('cors');
// const globalFunc = require('./routes/fonctions/global');
const write = require('write');

const addEcole = require ("./first-datas-scripts/add_ecole");
const addFormation = require('./first-datas-scripts/add_metier_formation');
const parcours = require('./services/parcours');
const addFormationParNiveau = require('./first-datas-scripts/add_formation_niveau');
const machinelearningTools = require ('./services/machinelearningTools');

mongoose.connect(`mongodb+srv://${process.env.USERMONGODB}:${process.env.PASSWORDMONGODB}@${process.env.HOSTMONGODB}/${process.env.MONGODBNAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

connection.on('error', error => {
	console.error(`Connection to MongoDB error: ${error.message}`);
});

const scriptType = process.argv[2];

connection.once('open', () => {
	console.log('Connected to MongoDB');
  switch (scriptType) {
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
          const localisation = [1.37422, 43.57598];
          parcours.searchParcours2(metiers[0].id_metier, 2,localisation).then(formations => {
            console.log(formations);
          });
        }
      });
      break;

    case "autoParcours":
      parcours.searchParcours1('meteorologiste').then(metiers => {
        console.log(metiers);
        if (metiers.length > 0) {
          const localisation = [1.37422, 43.57598];
          parcours.createParcours(metiers[0].id_metier, 2, localisation).then(formations => {
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

if (scriptType === undefined) {

  // const params = { 
  //   list_profile: ["femme"]
  // }
  // console.log(params)

  // parcours.getBestFormation(params).then(formation => {
  //   console.log(formation);
  //   // if (metiers.length > 0) {
  //   //   const localisation = [1.37422, 43.57598];
  //   //   parcours.createParcours(metiers[0].id_metier, 2, localisation).then(formations => {
  //   //     console.log(formations);
  //   //   });
  //   // }
  // });



//   const User = require('./mongodb-schemas/user');

//   User.find(
//     {
//       'address.location':
//         { $near:
//            {
//              $geometry: { type: "Point",  coordinates: [48.860294, 2.338629] },
//              $minDistance: 0,
//              $maxDistance: 5000
//            }
//         }
//     }
//  ).then(users => {
//    console.log(users);
//  });

//  User.aggregate( [
//   {
//      $geoNear: {
//        query: { }, // c'est le find()
//         near: { type: "Point", coordinates: [48.860294, 2.338629] },
//         spherical: true,
//         distanceField: "calcDistance"
//      }
//   }
// ] ).then(users => {
//   console.log(users);
// });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(cors());

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
        req.headers.userSexe = decoded.userSexe;
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
  const authRoute = require('./routes/auth.route');
  const schoolRoute = require('./routes/school.route');
  const userRoute = require('./routes/user.route');
  const jobRoute = require ('./routes/job.route');
  const parcoursRoute = require ('./routes/parcours.route');
  const needHelpRoute = require ('./routes/need_help.route');
  const followRoute = require('./routes/follow.route');
  const formationRoute = require('./routes/formation.route');
  const ratingRoute = require('./routes/note.route')

  app.use('/api', indexRoute);
  app.use('/api/auth', authRoute);
  app.use('/api/school', schoolRoute);
  app.use('/api/user',authUser, userRoute);
  app.use('/api/job',jobRoute);
  app.use('/api/parcours', authUser, parcoursRoute);
  app.use('/api/needHelp',authUser,needHelpRoute);
  app.use('/api/follow',authUser,followRoute);
  app.use('/api/formation',formationRoute);
  app.use('/api/ratings',authUser,ratingRoute)

  app.get('/', (req, res) => {
    res.status(301).json('API Node Test')
  })

  app.listen(port, () => {
    console.log(`ParcourSteve app listening at http://localhost:${port}`)
  })
}