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
        // Exemple: "Je souhaite effectuer un virement de 100 TND de compte 12345678901234567891 vers le compte 12345678901234567890"
        const montant = parseFloat(userMessage.match(/\d+/g)[0]); // Trouver le montant dans le message
        const ribles = userMessage.match(/\d{20}/g); // Trouver les RIBs dans le message
        const ribSource = ribles[0]; // Premier RIB (compte source)
        const ribDestinataire = ribles[1]; // Deuxième RIB (compte destinataire)

        if (ribSource && ribDestinataire) {
            // Récupérer les comptes
            const compteSource = await Compte.findOne({ where: { rib: ribSource } });
            const compteDestinataire = await Compte.findOne({ where: { rib: ribDestinataire } });

            if (compteSource && compteDestinataire) {
                // Vérifier que les deux comptes appartiennent au même client
                const client = await Client.findOne({ where: { id: compteSource.clientId } });

                if (client && compteSource.clientId === compteDestinataire.clientId) {
                    // Vérifier le solde suffisant
                    if (compteSource.solde >= montant) {
                        // Effectuer le virement
                        compteSource.solde -= montant;
                        compteDestinataire.solde += montant;

                        await compteSource.save();
                        await compteDestinataire.save();

                        // Enregistrer la transaction
                        await Transaction.create({
                            id: `TR${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(Math.random() * 10000).toFixed(0)}`,
                            montant: montant,
                            type: 'virement',
                            compteRib: ribSource,
                            approuveParClientId: client.id,
                            motif: `Virement interne vers ${ribDestinataire}`
                        });

                        // Enregistrer la transaction
                        await Transaction.create({
                            id: `TR${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(Math.random() * 10000).toFixed(0)}`,
                            montant: montant,
                            type: 'virement',
                            compteRib: ribDestinataire,
                            approuveParClientId: client.id,
                            motif: `Virement interne de ${ribSource}`
                        });

                        botResponse = `Virement de ${montant} TND effectué avec succès de votre compte ${ribSource} vers le compte ${ribDestinataire}.`;
                    } else {
                        botResponse = 'Solde insuffisant pour effectuer ce virement.';
                    }
                } else {
                    botResponse = 'Les comptes source et destinataire doivent appartenir au même client.';
                }
            } else {
                botResponse = 'L\'un des comptes spécifiés n\'existe pas. Veuillez vérifier les RIBs.';
            }
        } else {
            botResponse = 'Je ne trouve pas les RIBs dans votre message. Veuillez vérifier les informations fournies.';
        }
    }
    else if (userMessage.toLowerCase().includes('solde')) {
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

