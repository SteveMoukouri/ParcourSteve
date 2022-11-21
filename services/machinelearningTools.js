const Formation = require ('../mongodb-schemas/formation');
const Ecoles = require ('../mongodb-schemas/ecole');
const MetierFormation = require('../mongodb-schemas/metier-formation');
const Metier = require('../mongodb-schemas/metier');

const globalFunc = require('../global');
const fs = require('fs');

module.exports =  (async () => {

    console.log("Creation du json qui liste les formations \n");
            
    const formations_list = await Formation.find({}).catch(error =>{
            console.log(error);
        }) 

    // convert JSON object to string
    const data = JSON.stringify(formations_list, null, 4);

    // write JSON string to a file
    fs.writeFile('formation1.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });

    console.log("Creation du json qui liste les ecoles \n");

    const ecoles_list = await Ecoles.find({}).catch(error =>{
            console.log(error);
        }) 
    console.log(ecoles_list)

    // convert JSON object to string
    const ecoles = JSON.stringify(ecoles_list, null, 4);

    // write JSON string to a file
    fs.writeFile('ecoles1.json', ecoles, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });


    //process.exit();

    // Creation csv metier

    console.log("Creation du json qui liste les metiers \n");

    const list_metier_formation = await MetierFormation.find({}).select({'nom':1,'nom_recherche':1,'domaine_commun':1,'id_metier':1}).catch(error =>{
            console.log(error);
        })
    
    const joblist = [];
    globalFunc.asyncForEach(list_metier_formation, async job => {
        const job_retour = await Metier.findById(job.id_metier).select({niveau_acces_minimum:1}).catch(error => {
            console.log(error);
        });
        if(job_retour){
            joblist.pust({
                nom: job.nom,
                nom_recherche: job.nom_recherche,
                domaine_commun: job.domaine_commun,
                id_metier: job.id_metier,
                niveau_acces_minimum: job_retour.niveau_access_minimum
            })
        }
    })
    console.log(joblist)

    // convert JSON object to string
    const metiers = JSON.stringify(joblist, null, 4);

    // write JSON string to a file
    fs.writeFile('job1.json', metiers, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
    

})