const Ecole = require("../mongodb-schemas/ecole");
const Note = require("../mongodb-schemas/child/note");
const Global = require("../global");
const { func } = require("joi");

module.exports =  (async () => {
    const stats_univ = await Global.csvParse('D:/_DOCUMENTS/Mes documents/Cours_Web_M1/parcourSteveIA/Formations/df_final_univ.csv', ';').catch(error => {
        console.log(error);
    });

	const stats_ecole_commerce = await Global.csvParse('D:/_DOCUMENTS/Mes documents/Cours_Web_M1/parcourSteveIA/Formations/df_ecole_com_final.csv', ';').catch(error => {
        console.log(error);
    });

	const stats_ecole_inge = await Global.csvParse('D:/_DOCUMENTS/Mes documents/Cours_Web_M1/parcourSteveIA/Formations/df_ecole_inge_final.csv', ';').catch(error => {
        console.log(error);
    });
	const stats_bachelor = await Global.csvParse('D:/_DOCUMENTS/Mes documents/Cours_Web_M1/parcourSteveIA/Formations/df_bachelor_final.csv', ';').catch(error => {
        console.log(error);
    });

    console.log('Ajout des écoles en base de données');
    await Global.asyncForEach(datas, async element => {
        const nom = retireDepartement(element["Nom de l'établissement"]);
        let lngLat = element["Localisation"].split(',');
        lngLat = [lngLat[1], lngLat[0]];

        const nouvelleEcole = Ecole({
            nom: nom,
            nom_recherche: Global.replaceSpecialChars(nom),
            public: (element["Types d'établissement"] === 'Public' || element["Types d'établissement"] === 'Etablissements Publics') ? true: false,
            address:{
                departement: element["Département"],
                ville: element["Commune"],
                region: element["Région"],
                location: { type: "Point", coordinates: lngLat}
            },
            site_internet: element["Site internet de l'établissement"],
            type: element["type d'établissement"],
            code_uai: element["Identifiant de l'établissement"],
            note: {satisfaction_generale:0}
        });
    
        const nouvelleEcoleBDD = await nouvelleEcole.save().catch(error => {
            console.log(element["Localisation"]);
            console.error(error.message, '\n\n');
        });
    });
    console.log('Fini');
});

function retireDepartement(nom) {
    nom = nom.split("(")[0];
    nom = nom.split(":")[0];
    return nom;
}