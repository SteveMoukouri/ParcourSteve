const Ecole = require("../mongodb-schemas/ecole");
const Global = require("../global");
const { func } = require("joi");

module.exports =  (async () => {
    const datas = await Global.csvParse('D:/_DOCUMENTS/Mes documents/Cours_Web_M1/parcourSteveIA/projet_steven/ecoles.csv', ';').catch(error => {
        console.log(error);
    });

    console.log('Ajout des écoles en base de données');
    await Global.asyncForEach(datas, async element => {
        const nom = retireDepartement(element["Nom de l'établissement"]);
        const nouvelleEcole = Ecole({
            nom: nom,
            nom_recherche: Global.replaceSpecialChars(nom),
            public: (element["Types d'établissement"] === 'Public' || element["Types d'établissement"] === 'Etablissements Publics') ? true: false,
            adresse:{
                departement: element["Département"],
                ville: element["Commune"],
                region: element["Région"],
                lat_lng: element["Localisation"]
            },
            site_internet: element["Site internet"],
            type: element["type d'établissement"],
            code_uai: element["Identifiant de l'établissement"],
            note: Math.floor(Math.random() * 10) + 1
        });
    
        const nouvelleEcoleBDD = await nouvelleEcole.save().catch(error => {
            console.error(error.message);
        });
    });
    console.log('Fini');
});

function retireDepartement(nom) {
    nom = nom.split("(")[0];
    nom = nom.split(":")[0];
    return nom;
}