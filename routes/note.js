const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const NoteTools = require("../tools/noteTools");

router.post('/add', async (req,res) =>{
    const schema = Joi.object({
        id_ecole: Joi.objectId().required(),
		satisfaction_generale:Joi.number().min(0).max(5).required(),
		satisfaction_cours_et_prof:Joi.number().min(0).max(5),
		satisfaction_encadrement:Joi.number().min(0).max(5),
		satisfaction_locaux:Joi.number().min(0).max(5),
		satisfaction_reseau_etudiant:Joi.number().min(0).max(5),
		satisfaction_vie_associative:Joi.number().min(0).max(5),
		satisfaction_ouverture_internationale:Joi.number().min(0).max(5),
		satisfaction_relations_avec_les_entreprises:Joi.number().min(0).max(5),
		satisfaction_preparation_vie_active:Joi.number().min(0).max(5), // correlation cours / métier
		satisfaction_qualite_services_dedie_aux_etudiants:Joi.number().min(0).max(5),
		satisfaction_relations_entre_etudiants:Joi.number().min(0).max(5),
		satisfaction_accompagnement_projet_personnel:Joi.number().min(0).max(5)
    });

    try {
        const body = await schema.validateAsync(req.body);
        const note = await NoteTools.addNote(body.id_ecole,req.headers.userId, body.satisfaction_generale,
			body.satisfaction_cours_et_prof,
			body.satisfaction_encadrement,
			body.satisfaction_locaux,
			body.satisfaction_reseau_etudiant,
			body.satisfaction_vie_associative,
			body.satisfaction_ouverture_internationale,
			body.satisfaction_relations_avec_les_entreprises,
			body.satisfaction_preparation_vie_active,
			body.satisfaction_qualite_services_dedie_aux_etudiants,
			body.satisfaction_relations_entre_etudiants,
			body.satisfaction_accompagnement_projet_personnel).catch(error => {
            res.status(400).send(error.message)
        });

        if (note) {
            res.status(200).json({
                texte: "Votre note a bien ete ajoutee",
                note: note
            });
        }
    } catch(error) {
        res.status(400).send(error.message);
    }

})