const Client = require('../models/client');
const Compte = require('../models/compte');
const Transaction = require('../models/transaction');

exports.chat = async (req, res) => {
    const { userMessage, id } = req.body;
    let botResponse = '';
    let conversations = [];




    conversations.push({ user: 'Client', text: userMessage });


    if (userMessage.toLowerCase().includes('mes comptes')) {
        const client = await Client.findOne({ where: { id: id } });
        if (client) {
            const comptes = await Compte.findAll({ where: { clientId: client.id } });
            if (comptes.length > 0) {
                botResponse = `Vous avez ${comptes.length} compte(s). Voici les détails :\n`;
                comptes.forEach((compte, index) => {
                    botResponse += `Compte ${index + 1} (RIB: ${compte.rib}) - Solde: ${compte.solde} TND\n`;
                });
            } else {
                botResponse = 'Vous n\'avez aucun compte associé à votre profil.';
            }
        } else {
            botResponse = 'Je ne trouve pas votre profil. Veuillez vérifier vos informations de connexion.';
        }

        // Vérifier si l'utilisateur demande un virement
    } else if (userMessage.toLowerCase().includes('virement')) {
        // Exemple: "Je souhaite effectuer un virement de 100 TND vers le compte 12345678901234567890"
        const montant = userMessage.match(/\d+/g)[0]; // Trouver le montant dans le message
        const ribDestinataire = userMessage.match(/\d{20}/g); // Trouver le RIB destinataire
        const client = await Client.findOne({ where: { where: { id: id } } });

        if (client && ribDestinataire) {
            const compteEmetteur = await Compte.findOne({ where: { clientId: client.id } });

            if (compteEmetteur && compteEmetteur.solde >= montant) {
                const compteDestinataire = await Compte.findOne({ where: { rib: ribDestinataire } });

                if (compteDestinataire) {
                    // Effectuer le virement
                    compteEmetteur.solde -= montant;
                    compteDestinataire.solde += montant;

                    await compteEmetteur.save();
                    await compteDestinataire.save();

                    // Enregistrer la transaction
                    await Transaction.create({
                        id: `TR${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(Math.random() * 10000).toFixed(0)}`,
                        montant: montant,
                        type: 'virement',
                        compteRib: compteEmetteur.rib,
                        approuveParClientId: client.id,
                        motif: `Virement vers ${compteDestinataire.rib}`
                    });

                    botResponse = `Virement de ${montant} TND effectué avec succès vers le compte ${compteDestinataire.rib}.`;
                } else {
                    botResponse = 'Le compte destinataire n\'existe pas. Veuillez vérifier le RIB.';
                }
            } else {
                botResponse = 'Solde insuffisant pour effectuer ce virement.';
            }
        } else {
            botResponse = 'Je ne trouve pas votre profil ou le RIB du destinataire. Veuillez vérifier les informations fournies.';
        }

        // Vérifier si l'utilisateur demande le solde
    } else if (userMessage.toLowerCase().includes('solde')) {
        const client = await Client.findOne({ where: { where: { id: id } } });
        if (client) {
            const comptes = await Compte.findAll({ where: { clientId: client.id } });

            if (comptes.length > 0) {
                botResponse = 'Voici le solde de vos comptes :\n';
                comptes.forEach((compte, index) => {
                    botResponse += `Compte ${index + 1} (RIB: ${compte.rib}) - Solde: ${compte.solde} TND\n`;
                });
            } else {
                botResponse = 'Je ne trouve aucun compte associé à votre profil.';
            }
        } else {
            botResponse = 'Je ne trouve pas votre profil. Veuillez vérifier vos informations de connexion.';
        }

        // Si l'utilisateur demande une autre requête ou n'est pas compris
    } else if (userMessage.toLowerCase().includes('merci')) {
        botResponse = 'Avec plaisir ! Si vous avez d\'autres questions, n\'hésitez pas.';
    } else if (userMessage.toLowerCase().includes('bonjour')) {
        botResponse = 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?';
    } else if (userMessage.toLowerCase().includes('fermer compte')) {
        botResponse = 'Pour fermer votre compte, veuillez contacter notre service client ou passer à l\'agence.';
    } else {
        botResponse = 'Je suis désolé, je ne comprends pas votre demande. Pourrais-je vous aider autrement ?';
    }

    // Ajouter la réponse du bot à la conversation
    conversations.push({ user: 'Bot', text: botResponse });

    // Envoyer la réponse
    res.json({ response: botResponse });
};

