const DemandeCredit = require('../models/DemandeCredit');
const Client = require('../models/client');
const TypeCredit = require('../models/typeCredit');
const multer = require('multer');
const path = require('path');
const HistoryPayment = require('../models/creditHistoryPayment');

const cron = require('node-cron');

const Compte = require('../models/compte');
const Transaction = require('../models/transaction');

const generateTransactionId = async () => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const latestTransaction = await Transaction.findOne({
        order: [['id', 'DESC']]
    });

    if (!latestTransaction) {
        return `TR${currentYear}${currentMonth}00001`;
    }

    const latestId = parseInt(latestTransaction.id.slice(-5), 10);
    const newId = (latestId + 1).toString().padStart(5, '0');

    console.log(latestId, " ")
    console.log(latestId, " latestId")

    return `TR${currentYear}${currentMonth}${newId}`;
};

const calculateMontantPlusInteret = (montant, duree) => {
    const nbJours = Number(duree) * 365;
    const interet = (Number(montant) * nbJours * 9.99) / 36000;

    const formattedInteret = interet.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    const formattedMontant = Number(montant).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

    const total = Number(montant) + interet;
    const formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

    return {
        montant: formattedMontant,
        interet: formattedInteret,
        total: formattedTotal,
    };
};


const calculateMonthlyPayment = (total, duree) => {
    const monthlyPayment = parseFloat(total.replace(/,/g, '') / (duree * 12));
    return monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};


const calculCapaciteCredit = (netSalary) => {
    if (netSalary < 600) return -1;
    if (netSalary <= 800) return netSalary * 0.3;
    if (netSalary <= 1000) return netSalary * 0.4;
    if (netSalary <= 2000) return netSalary * 0.5;
    if (netSalary >= 2000) return netSalary * 0.6;
    return 0;
};



const calculerRatioEndettement = (montantTotalDesDettes, revenuNet) => {
    return (montantTotalDesDettes / revenuNet) * 100;
};




const calculerScoreCredit = (historiquePaiement, montantDette, dureeCredit, nouveauxCredits, typeCredit) => {
    console.log(historiquePaiement, montantDette, dureeCredit, nouveauxCredits, typeCredit)
    return (0.35 * historiquePaiement) +
        (0.30 * montantDette) +
        (0.15 * dureeCredit) +
        (0.10 * nouveauxCredits) +
        (0.10 * typeCredit);
};



const listMonthlyPayments = (monthlyPayment, duree, creditId) => {
    const payments = [];
    const start = new Date();

    for (let month = 1; month <= duree * 12; month++) {
        const isPaid = month <= 4 ? "Paid" : "Not Paid"; // First four months paid, others not paid
        const dueDate = new Date(start); // Create a new date object for due date
        dueDate.setMonth(start.getMonth() + month); // Increment month for each payment

        // Format date as dd/mm/yyyy
        const dueDatePayment = `${String(dueDate.getDate()).padStart(2, '0')}/${String(dueDate.getMonth() + 1).padStart(2, '0')}/${dueDate.getFullYear()}`;


        const creditHistoryPayment = HistoryPayment.create({
            month,
            monthlyPayment,
            dueDatePayment,
            creditId
        })

        payments.push({
            month: month,
            amount: monthlyPayment,
            paymentStatus: isPaid, // Payment status for each month
            dateEcheance: dueDatePayment // Format date as dd/mm/yyyy
        });
    }

    // Calculate percentage of payments made
    // const totalPayments = payments.length;
    // const paidPayments = payments.filter(payment => payment.paymentStatus === "Paid").length;
    // const paymentPercentage = Math.floor((paidPayments / totalPayments) * 100); // No decimal point

    //return { payments, paymentPercentage };
};


exports.paidCreditMonthly = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    console.log(`${day}/${month}/${year}`)

    const task = cron.schedule('* * * * *', async () => {
        const historyPayment = await HistoryPayment.findAll({
            where: {
                statut: 'Not Paid',
                dueDatePayment: `${day}/${month}/${year}`
            },
            include: [{
                model: DemandeCredit,
                as: 'credit',
                attributes: ['rib']
            }]
        });

        for (const payment of historyPayment) {
            try {
                console.log(`Payment ID: ${payment.dataValues.id}, RIB: ${payment.dataValues.credit.rib}`);

                const compte = await Compte.findByPk(payment.dataValues.credit.rib);
                if (!compte) {
                    console.error(`Compte not found for RIB: ${payment.dataValues.credit.rib}`);
                    continue;
                }

                let solde = compte.solde;
                solde -= parseFloat(payment.dataValues.monthlyPayment.replace(/,/g, ''));

                let type = "retrait";
                let motif = "retrait crédit " + payment.dataValues.dueDatePayment;
                let montant = parseFloat(payment.dataValues.monthlyPayment.replace(/,/g, ''));
                let compteRib = compte.rib;

                compte.solde = solde;
                await compte.save();

                const transactionId = await generateTransactionId();

                const transaction = await Transaction.create({
                    id: transactionId,
                    montant,
                    type,
                    motif,
                    compteRib
                });

                payment.statut = "Paid"
                payment.save()

                console.log(`Transaction created with ID: ${transaction.id}`);
            } catch (error) {
                console.error(`Error processing payment ID ${payment.dataValues.id}:`, error);
            }
        }



        task.start();
    })
}


exports.validateDemandeCredit = async (req, res) => {
    const { id, status, currentProfile } = req.body;

    try {
        const demande = await DemandeCredit.findByPk(id);
        if (!demande) {
            return res.status(404).json({ message: "Demande de crédit non trouvée." });
        }

        if (status == "approuvée" && currentProfile == "DirecteurFinancement") {
            // const compte = await Compte.findByPk(demande.clientId);
            // if (!compte) {
            //     return res.status(404).json({ message: 'Compte non trouvé' });
            // }
            const compte = await Compte.findOne({ where: { clientId: demande.clientId } });
            if (!compte) {
                return res.status(404).json({ message: 'Compte non trouvé' });
            }

            const transactionId = await generateTransactionId();
            // let numericValue = parseFloat(numberString.replace(/,/g, ''));
            let solde = compte.solde;
            solde += parseFloat(demande.montant.replace(/,/g, ''));
            let type = "dépot"
            let motif = "dépot credit"
            let montant = parseFloat(demande.montant.replace(/,/g, ''));
            let compteRib = compte.rib;





            compte.solde = solde;
            await compte.save();

            console.log(compte)


            const transaction = await Transaction.create({
                id: transactionId,
                montant,
                type,
                motif,
                compteRib
            });
            demande.statut = status;
            demande.rib = compteRib
            demande.currentProfile = "";
            listMonthlyPayments(demande.mensualites, demande.duree, id)
            await demande.save();
            res.status(200).json({ message: "Traitement effectué avec succès." });
        }
        if (status == "avis favorable") {
            demande.currentProfile = "DirecteurFinancement";
            demande.statut = "en attente";
            await demande.save();
            res.status(200).json({ message: "Traitement effectué avec succès.", documents: demande.documents });
        }

        if (status == "refusée") {
            demande.currentProfile = "";
            demande.statut = status;
            await demande.save();
            res.status(200).json({ message: "Traitement effectué avec succès.", documents: demande.documents });
        }

        if (status == "en cours de traitement") {
            demande.statut = status;
            await demande.save();
            res.status(200).json({ message: "Traitement effectué avec succès.", documents: demande.documents });
        }






    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erreur serveur" });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Define the uploads directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);  // File name structure
    }
});

// Initialize multer
const upload = multer({ storage: storage }).array('documents', 10);




exports.createDemandeCredit = async (req, res) => {


    try {





        upload(req, res, async (err) => {
            const { typeCreditId, montant, totalMontant, duree, interet, mensualites, netSalary, clientId } = req.body;
            if (err) {
                return res.status(500).json({ message: 'File upload error', error: err });
            }




            const client = await Client.findByPk(clientId);
            if (!client) {
                return res.status(404).json({ message: "Client non trouvé." });
            }

            const typeCredit = await TypeCredit.findByPk(typeCreditId);
            if (!typeCredit) {
                return res.status(404).json({ message: "Type de crédit non trouvé." });
            }

            const currentProfile = "ChargeClientele"

            const documents = req.files.map(file => ({
                fileName: file.originalname,
                fileUrl: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`  // Generate file URL
            }));


            const nouvelleDemande = await DemandeCredit.create({
                typeCreditId,
                montant,
                interet,
                mensualites,
                totalMontant,
                duree,
                currentProfile,
                netSalary,
                documents: JSON.stringify(documents),
                clientId
            });

            res.status(201).json({ message: "Demande de crédit créée avec succès.", demandeCredit: nouvelleDemande });
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erreur serveur lors de la création de la demande de crédit." });
    }
};


exports.simulateCredit = async (req, res) => {
    const { typeCreditId, montant, duree, netSalary, clientId } = req.body;

    try {


        const result = calculateMontantPlusInteret(montant, duree);
        const monthlyPayment = calculateMonthlyPayment(result.total, duree);
        const capacity = calculCapaciteCredit(netSalary).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

        let evaluationMessage;


        if (capacity === -1) {
            evaluationMessage = "Le salaire net est trop bas pour l'évaluation du crédit.";
            return res.status(200).json({ message: "Le salaire net est trop bas pour l'évaluation du crédit." });
        }

        if (parseFloat(capacity.replace(/,/g, '')) <= parseFloat(monthlyPayment.replace(/,/g, ''))) {
            evaluationMessage = "Crédit refusé. Le paiement mensuel dépasse la capacité de crédit.";
            return res.status(200).json({
                montant: result.montant,
                interet: result.interet,
                total: result.total,
                monthlyPayment: monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                creditCapacity: capacity,
                evaluation: evaluationMessage,
            });
        }
        const ratioEndettement = Math.round(calculerRatioEndettement(monthlyPayment, netSalary));
        if (ratioEndettement > 40) {
            evaluationMessage = "Crédit refusé. Le ratio d'endettement dépasse 40%.";
            return res.status(200).json({
                montant: result.montant,
                interet: result.interet,
                total: result.total,
                monthlyPayment: monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                creditCapacity: capacity,
                ratioEndettement: ratioEndettement + '%',
                evaluation: evaluationMessage,
            });
        } else {
            let typeCredit = 0;
            switch (typeCreditId) {
                case "creditPresalaire":
                    typeCredit = 1
                    break;
                case "creditAmenagements":
                    typeCredit = 2
                    break;
                case "créditImmobilier":
                    typeCredit = 3
                    break;
                case "creditAutoInvest":
                    typeCredit = 4
                    break;


                default:
                    break;
            }

            const demande = await DemandeCredit.findAll({
                where: {
                    clientId,
                    paidStatut: 'Not Paid'
                }
            });

            const paymentHistory = 100;

            if (demande.count > 0) {

                const paidCount = await HistoryPayment.count({
                    where: {
                        statut: 'paid',
                        creditId: demande.id
                    }
                });

                // Count the total records for the specific clientId
                const totalCount = await HistoryPayment.count({
                    where: {
                        creditId: demande.id
                    }
                });

                // Calculate the percentage of 'paid' records
                paymentHistory = (paidCount / totalCount) * 100;
            }


            const montatntDette = Math.round(montant / netSalary)

             //const creditScore = Math.round(calculerScoreCredit(paymentHistory, montatntDette, duree, 2, typeCredit));


            const creditScore = 70;
            if (creditScore >= 70) {
                evaluationMessage = "Crédit approuvé.";

                res.status(201).json({
                    montant: result.montant,
                    interet: result.interet,
                    total: result.total,
                    monthlyPayment: monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                    creditCapacity: capacity,
                    ratioEndettement: ratioEndettement + '%',
                    creditScore: creditScore,
                    evaluation: evaluationMessage,
                });

            } else {
                evaluationMessage = "Crédit refusé. Score de crédit trop faible.";
                return res.status(200).json({
                    montant: result.montant,
                    interet: result.interet,
                    total: result.total,
                    monthlyPayment: monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                    creditCapacity: capacity,
                    ratioEndettement: ratioEndettement + '%',
                    creditScore: creditScore,
                    evaluation: evaluationMessage,
                });
            }


        }



    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erreur serveur lors de la création de la demande de crédit." });
    }
};

// Fonction pour ajouter des documents à une demande de crédit
exports.uploadDocuments = async (req, res) => {
    const { demandeCreditId } = req.params;
    const documents = req.files;

    try {
        const demande = await DemandeCredit.findByPk(demandeCreditId);
        if (!demande) {
            return res.status(404).json({ message: "Demande de crédit non trouvée." });
        }

        const documentPaths = documents.map(file => file.path);
        demande.documents.push(...documentPaths);
        await demande.save();

        res.status(200).json({ message: "Documents ajoutés avec succès.", documents: demande.documents });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de l'ajout des documents." });
    }
};

// Fonction pour ajouter un validateur et une décision
exports.addValidatorDecision = async (req, res) => {
    const { demandeCreditId, validateur, decision } = req.body;

    try {
        const demande = await DemandeCredit.findByPk(demandeCreditId);
        if (!demande) {
            return res.status(404).json({ message: "Demande de crédit non trouvée." });
        }

        demande.validateurs.push({ validateur, decision });
        await demande.save();

        res.status(200).json({ message: "Décision du validateur ajoutée avec succès.", validateurs: demande.validateurs });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de l'ajout de la décision du validateur." });
    }
};

// Fonction pour obtenir toutes les demandes de crédit d'un client
exports.getDemandesCreditByClient = async (req, res) => {
    const { clientId } = req.params;

    try {
        const demandes = await DemandeCredit.findAll({
            where: { clientId }, include: [
                {
                    model: Client,
                    as: 'client'
                },
                {
                    model: TypeCredit,
                    as: 'typeCredit'
                }
            ]
        });
        res.status(200).json(demandes);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erreur serveur lors de la récupération des demandes de crédit." });
    }
};


exports.getDemandesCreditDetails = async (req, res) => {
    const { creditId } = req.params;

    try {
        const id = creditId;
        const history = await HistoryPayment.findAll({
            where: { creditId }, order: [
                ['month', 'ASC']
            ],
        });
        const demande = await DemandeCredit.findAll({ where: { id } });
        demande.documents = demande.documents ? JSON.parse(demande.documents) : [];


        res.status(200).json({ history, demande });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erreur serveur lors de la récupération des paiements de crédit." });
    }
};




exports.getDemandesAllCredit = async (req, res) => {

    try {
        const demandes = await DemandeCredit.findAll({
            include: [
                {
                    model: Client,
                    as: 'client'
                },
                {
                    model: TypeCredit,
                    as: 'typeCredit'
                }
            ]
        });
        res.status(200).json(demandes);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erreur serveur lors de la récupération des demandes de crédit." });
    }
};
