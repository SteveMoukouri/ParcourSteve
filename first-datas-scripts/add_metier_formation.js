const fs = require('fs');
const moment = require('moment');
moment.locale('fr');

const Ecole = require("../mongodb-schemas/ecole");
const Metier = require("../mongodb-schemas/metier");
const Formation = require("../mongodb-schemas/formation");
const Note = require("../mongodb-schemas/child/note");


const Global = require("../global");
const ParcoursFunc = require("../services/parcours");

module.exports = (async() =>{
    const rawdatas = fs.readFileSync('D:/_DOCUMENTS/Mes documents/Cours_Web_M1/parcourSteveIA/New Databases/output3.json');
    const datas = JSON.parse(rawdatas);

    //nb ecole distincte :
    // Formation.find({}).distinct('id_ecole', function(error, ids) {
        //     console.log(ids.length);
        // });
        
        // Formation.find({}).distinct('id_onisep', function(error, ids) {
            //     console.log(ids.length);
            // });
            
            
            //AJOUT FORMATION MIN & METIER :
            
    console.log('Ajout des métiers et formations ...');
    await Global.asyncForEach(datas, (async data => { 
        // console.log(data.niveau_acces_min, data.nom_metier, data.identifiant);
        // console.log(data.secteurs_activite.map(secteur => secteur.libelle));
        // console.log(data.formations_min_requise);

        const formationsMinRequisesCodeEcoles = data.formations_min_requise.map(formation => formation.id_formateur);

        const listeEcoles = await Ecole.find({ code_uai: { "$in" : formationsMinRequisesCodeEcoles }  }).select({'code_uai':1}).catch(error => {
            console.log(error);
        });
        const listeEcoles2 = [];
        listeEcoles.forEach(ecole => {
            listeEcoles2[ecole.code_uai] = ecole._id;
        });

        if (listeEcoles.length >= 1) {
            let secteurActivite = data.secteurs_activite.map(secteur => secteur.libelle);
            secteurActivite = secteurActivite.filter(function( element ) { // remove undefined
                return element !== undefined;
            });

            const nouveauMetier = new Metier({
                nom: data.nom_metier,
                nom_recherche: Global.replaceSpecialChars(data.nom_metier),
                code_metier: data.identifiant,
                secteur_activite: secteurActivite,
                niveau_access_minimum: Number((data.niveau_acces_min.libelle).replace(/\D/g, ''))
            });

            const nouveauMetierBDD = await nouveauMetier.save().catch(error => {
                console.error(error.message);
            });
            if (nouveauMetierBDD) {
                await Global.asyncForEach(data.formations_min_requise, (async formation => {
                    if (formation.id_formateur && listeEcoles2[formation.id_formateur] ) { 
                        const nouvelleFormation = new Formation({
                            nom: formation.libelle,
                            nom_recherche: Global.replaceSpecialChars(formation.libelle),
                            code_formation: formation.id,
                            id_onisep: formation.id_onisep,
                            code_rncp: formation.code_rncp,
                            domaine: formation.domaine.split(/[,|]/),
                            type_formation: formation.type_formation,
                            nature_formation: formation.nature_formation,
                            niveau_sortie: Number((formation.niveau_sortie).replace(/\D/g, '')),
                            niveau_entree: ParcoursFunc.triFormation(formation.niveau_sortie, formation.duree_cycle_standard),
                            duree_cycle_standard: formation.duree_cycle_standard,
                            url_diplome: formation.url_diplome,
                            cout_scolarite: formation.cout_scolarite,
                            modalite_scolarite: formation.modalite_scolarite,
                            date_modif: moment(formation.date_modif, 'DD/MM/YYYY').toDate(),
                            code_uai_ecole: formation.id_formateur,
                            id_ecole:listeEcoles2[formation.id_formateur],
                            id_metier: nouveauMetierBDD._id,
                            note:{satisfaction_generale:0}
                        });
            
                        const nouvelleFormationBDD = await nouvelleFormation.save().catch(error => {
                            console.error(error.message);
                        });
                    }
                }));
            }
            
        }
    })); 

    //AJOUT DES FORMATIONS RESTANTES (formation non minimum pour accéder à un métier):
    
    console.log('Ajout des formations restantes ... ');
    const formation_rest = await Global.csvParse('D:/_DOCUMENTS/Mes documents/Cours_Web_M1/parcourSteveIA/New Databases/list_formation1.csv', ';').catch(error => {
        console.log(error);
    });

    await Global.asyncForEach(formation_rest,(async elem => {

        const ecoleTrouvee = await Ecole.findOne({ code_uai: elem["ENS code UAI"] }).catch(error => {
            console.log(error);
        });

        if (ecoleTrouvee) {
    
            const formationExiste = await Formation.countDocuments({ code_formation: elem['code_formation'] }).catch(err => {
                    console.log(err);
                })
            
            if (formationExiste === 0) {
                    // On ajoute le nouveau diplome en BDD
                    const nouvelleFormation = new Formation({
                        nom: elem["Formation (FOR) libellé"],
                        nom_recherche: Global.replaceSpecialChars(elem["Formation (FOR) libellé"]),
                        code_formation: elem["code_formation"],
                        id_onisep: elem["Action de Formation (AF) identifiant Onisep"],
                        code_rncp: elem["code_rncp"],
                        domaine: elem["FOR indexation domaine web Onisep"].split(/[,|]/),
                        type_formation: elem["FOR type"],
                        nature_formation: elem["FOR nature du certificat"],
                        niveau_sortie: Number((elem["FOR niveau de sortie"]).replace(/\D/g, '')),
                        niveau_entree: ParcoursFunc.triFormation(elem["FOR niveau de sortie"],  elem["AF durée cycle standard"]),
                        duree_cycle_standard: elem["AF durée cycle standard"],
                        url_diplome: elem["FOR URL référentiel"],
                        cout_scolarite: elem["AF coût scolarité"],
                        modalite_scolarite: elem["AF modalités scolarité"],
                        date_modif: moment(elem["AF date de modification"], 'DD/MM/YYYY').toDate(),
                        code_uai_ecole: elem["ENS code UAI"],
                        id_ecole:ecoleTrouvee._id,
                        note:{satisfaction_generale:0}

                    });
            
                    const nouvelleFormationBDD = await nouvelleFormation.save().catch(error => {
                        console.error(error.message);
                    });
            }
        }
    }))



    // TEST POUR PARCOURS
    /*console.log("Add metier test");
    const nouveauMetier = new Metier({
        nom: "Metier de test",
        code_metier: "TEST",
        secteur_activite: [],
        niveau_access_minimum: "Bac + 5"
    });

    const nouveauMetierBDD = await nouveauMetier.save().catch(error => {
        console.error(error.message);
    });
    if(nouveauMetierBDD) {
        const nouvelleFormation = new Formation({
            nom: "Formation de premier niveau",
            code_formation: "TEST1",
            id_onisep: "TEST",
            code_rncp: "TEST",
            domaine: ["test", "argriculteur", "cultivateur"],
            type_formation: "Diplome d'ingénieur",
            nature_formation: "Titre habilité à faire des test",
            niveau_sortie: "Bac + 2",
            duree_cycle_standard: "2 ans",
            url_diplome: "http://test.com/3232",
            cout_scolarite: "200€",
            modalite_scolarite: "temps plein",
            date_modif: "11/02/2022",
            id_ecole:"61e2d1a42a52c760ac218b55",
            id_metier: nouveauMetierBDD._id
        });

        const nouvelleFormationBDD = await nouvelleFormation.save().catch(error => {
            console.error(error.message);
        });

        const nouvelleFormation2 = new Formation({
            nom: "Formation de second niveau",
            code_formation: "TEST2",
            id_onisep: "TEST",
            code_rncp: "TEST",
            domaine: ["test", "argriculteur", "cultivateur","entrepreneur","gestion"],
            type_formation: "Diplome d'ingénieur",
            nature_formation: "Titre habilité à faire des test et gérer une entreprise de test",
            niveau_sortie: "Bac + 5",
            duree_cycle_standard: "3 ans",
            url_diplome: "http://test.com/3232",
            cout_scolarite: "700€",
            modalite_scolarite: "temps plein",
            date_modif: "11/02/2022",
            id_ecole:"61e2d1a42a52c760ac218b55",
            id_metier: nouveauMetierBDD._id
        });

        const nouvelleFormation2BDD = await nouvelleFormation2.save().catch(error => {
            console.error(error.message);
        });

        const nouvelleFormation3 = new Formation({
            nom: "Formation de second niveau mais une autre",
            code_formation: "TEST2.2",
            id_onisep: "TEST",
            code_rncp: "TEST",
            domaine: ["test", "argriculteur", "cultivateur","informatique","economie agronome"],
            type_formation: "Diplome d'ingénieur",
            nature_formation: "Titre habilité à faire des test et creer des logiciels de test ",
            niveau_sortie: "Bac + 5",
            duree_cycle_standard: "3 ans",
            url_diplome: "http://test.com/3232",
            cout_scolarite: "900€",
            modalite_scolarite: "temps plein",
            date_modif: "11/02/2022",
            id_ecole:"61e2d1a42a52c760ac218b55",
            id_metier: nouveauMetierBDD._id
        });

        const nouvelleFormation3BDD = await nouvelleFormation3.save().catch(error => {
            console.error(error.message);
        });
    } */

    console.log('Fin de l\'ajout des métiers et formations.');
    process.exit();
})