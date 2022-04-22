const Formation = require ('../mongodb-schemas/formation');
const Ecoles = require ('../mongodb-schemas/ecole');

const globalFunc = require('../global');
const fs = require('fs');

module.exports =  (async () => {

    // console.log("Creation du json qui liste les formations \n");
            
    // const formations_list = await Formation.find({}).catch(error =>{
    //         console.log(error);
    //     }) 

    // // convert JSON object to string
    // const data = JSON.stringify(formations_list, null, 4);

    // // write JSON string to a file
    // fs.writeFile('formation.json', data, (err) => {
    //     if (err) {
    //         throw err;
    //     }
    //     console.log("JSON data is saved.");
    // });

    console.log("Creation du json qui liste les ecoles \n");

    const ecoles_list = await Ecoles.find({}).catch(error =>{
            console.log(error);
        }) 
    console.log(ecoles_list)

    // convert JSON object to string
    const ecoles = JSON.stringify(ecoles_list, null, 4);

    // write JSON string to a file
    fs.writeFile('ecoles.json', ecoles, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });

    //process.exit();
    

})