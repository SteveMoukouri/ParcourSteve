const Global = require("../global");
const fs = require('fs');

const Ecole = require("../mongodb-schemas/ecole");
const Metier = require("../mongodb-schemas/metier");
const Formation = require("../mongodb-schemas/formation");


module.exports = (async() =>{
    const rawdatas = fs.readFileSync('D:/_DOCUMENTS/Mes documents/Cours_Web_M1/parcourSteveIA/projet_steven/output.json');
    const datas = JSON.parse(rawdatas);

    console.log('Ajout des métiers et formations ...');
    Formation.find({}).distinct('id_ecole', function(error, ids) {
        console.log(ids.length);
    });
    // await Global.asyncForEach(datas, (async data => { 
    //     // console.log(data.niveau_acces_min, data.nom_metier, data.identifiant);
    //     // console.log(data.secteurs_activite.map(secteur => secteur.libelle));
    //     // console.log(data.formations_min_requise);

    //     const formationsMinRequisesCodeEcoles = data.formations_min_requise.map(formation => formation.id_formateur);

    //     const listeEcoles = await Ecole.find({ code_uai: { "$in" : formationsMinRequisesCodeEcoles }  }).select({'code_uai':1}).catch(error => {
    //         console.log(error);
    //     });
    //     const listeEcoles2 = [];
    //     listeEcoles.forEach(ecole => {
    //         listeEcoles2[ecole.code_uai] = ecole._id;
    //     });

    //     if (listeEcoles.length >= 1) {
    //         let secteurActivite = data.secteurs_activite.map(secteur => secteur.libelle);
    //         secteurActivite = secteurActivite.filter(function( element ) { // remove undefined
    //             return element !== undefined;
    //         });

    //         const nouveauMetier = new Metier({
    //             nom: data.nom_metier,
    //             code_metier: data.identifiant,
    //             secteur_activite: secteurActivite,
    //             niveau_access_minimum: data.niveau_acces_min.libelle
    //         });

    //         const nouveauMetierBDD = await nouveauMetier.save().catch(error => {
    //             console.error(error.message);
    //         });
    //         if (nouveauMetierBDD) {
    //             await Global.asyncForEach(data.formations_min_requise, (async formation => {
    //                 if (formation.id_formateur) { 
    //                     const nouvelleFormation = new Formation({
    //                         nom: formation.libelle,
    //                         code_formation: formation.id,
    //                         id_ecole:listeEcoles2[formation.id_formateur],
    //                         id_metier: nouveauMetierBDD._id
    //                     });
            
    //                     const nouvelleFormationBDD = await nouvelleFormation.save().catch(error => {
    //                         console.error(error.message);
    //                     });
    //                 }
    //             }));
    //         }
            
    //     }
    // }));
    console.log('Fin de l\'ajout des métiers et formations ...');
})