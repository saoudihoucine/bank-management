const Transaction = require('../models/transaction');
const Compte = require('../models/compte');
const User = require('../models/user');
const Client = require('../models/client');

// Fonction pour générer le prochain ID de transaction
const generateTransactionId = async () => {
    const currentYear = new Date().getFullYear().toString().slice(-2); // Les deux derniers chiffres de l'année
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // Mois avec un zéro initial
    const latestTransaction = await Transaction.findOne({
        order: [['createdAt', 'DESC']]
    });

    if (!latestTransaction) {
        return `TR${currentYear}${currentMonth}00001`;
    }

    const latestId = parseInt(latestTransaction.id.slice(-5), 10);
    const newId = (latestId + 1).toString().padStart(5, '0');

    return `TR${currentYear}${currentMonth}${newId}`;
};

// Créer une transaction
const createTransaction = async (req, res) => {
    const { montant, type, motif, compteRib, transferRib, approuveParChargeId, approuveParClientId } = req.body;

    console.log(req.body)

    try {
        const compte = await Compte.findByPk(compteRib);
        if (!compte) {
            return res.status(404).json({ message: 'Compte non trouvé' });
        }

        const transactionId = await generateTransactionId();
        let compteDestString = ''

        let solde = compte.solde;
        if (type === 'dépot') {
            solde += montant;
        } else if (type === 'retrait') {
            if (solde < montant) {
                return res.status(400).json({ message: 'Solde insuffisant' });
            }
            solde -= montant;
        } else if (type === 'transfert') {
            const { compteDestinataire, montant } = req.body;
            if (solde < montant) {
                return res.status(400).json({ message: 'Solde insuffisant pour le transfert' });
            }

            const compteDest = await Compte.findByPk(compteDestinataire);
            if (!compteDest) {
                const tunisianBankCodes = [
                    { code: '00', bank: 'Banque Centrale de Tunisie (BCT)' },
                    { code: '01', bank: 'Arab Tunisian Bank (ATB)' },
                    { code: '02', bank: 'Banque Franco-Tunisienne (BFT)' },
                    { code: '03', bank: 'Banque Nationale Agricole (BNA)' },
                    { code: '04', bank: 'Attijari Bank' },
                    { code: '05', bank: 'Banque de Tunisie (BT)' },
                    { code: '07', bank: 'Amen Bank (AB)' },
                    { code: '08', bank: 'Banque Internationale Arabe de Tunisie (BIAT)' },
                    { code: '09', bank: 'Banque de Développement Économique de Tunisie (BDET)' },
                    { code: '10', bank: 'Société Tunisienne de Banque (STB)' },
                    { code: '11', bank: 'Union Bancaire pour le Commerce et l\'Industrie (UBCI)' },
                    { code: '12', bank: 'Union Internationale de Banques (UIB)' },
                    { code: '14', bank: 'Banque de l\'Habitat (BH)' },
                    { code: '16', bank: 'Citibank' },
                    { code: '17', bank: 'Centre des Chèques Postaux (CCP)' },
                    { code: '18', bank: 'Banque Nationale de Développement Touristique (BNDT)' },
                    { code: '20', bank: 'Banque Tuniso-Koweitienne (BTK)' },
                    { code: '21', bank: 'Banque Tuniso-Saoudienne (STUSID)' },
                    { code: '23', bank: 'Qatar National Bank (QNB)' },
                    { code: '24', bank: 'Banque Tuniso-Émiratie (BTE)' },
                    { code: '25', bank: 'Banque Zitouna' },
                    { code: '26', bank: 'Banque Tuniso-Libyenne de Développement (BTL)' },
                    { code: '27', bank: 'Banque Tunisienne de Solidarité (BTS)' },
                    { code: '28', bank: 'Arab Banking Corporation (ABC)' },
                    { code: '31', bank: 'BCMA Tunisie (BCMA)' },
                    { code: '32', bank: 'El Baraka Bank' },
                    { code: '33', bank: 'North African International Bank (NAIB)' },
                    { code: '35', bank: 'ALUBAF Tunisie (ALUBAF)' },
                    { code: '47', bank: 'Wifak International Bank (WIB)' },
                    { code: '66', bank: 'Caisse Mutuelle de Crédit Agricole de Tunisie (CMCAT)' },
                    { code: '72', bank: 'Union Tunisienne de Banques (UTB)' },
                    { code: '73', bank: 'Tunis International Bank (TIB)' },
                    { code: '74', bank: 'Loan and Investment Company (LINC)' }
                ];
                 compteDestString = compteDestinataire.toString()
                if (compteDestString.length == 20 && tunisianBankCodes.some(bank => bank.code === compteDestString.substring(0, 2))) {
                    console.log(compteDestString)
                    solde -= montant;

                }else{
                    
                    return res.status(404).json({ message: 'Compte destinataire non trouvé' });
                }
            }else{

                solde -= montant;
                compteDest.solde += montant;
                await compteDest.save();
            }

        }

        compte.solde = solde;
        await compte.save();


        const transaction = await Transaction.create({
            id: transactionId,
            montant,
            type,
            motif,
            compteRib,
            compteDestString,
            approuveParClientId,
            approuveParChargeId
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
        console.log(error)
    }
};


const depotCredit = async (clientId, montant, typeCredit) => {
    try {
        const compte = await Compte.findOne(clientId);
        if (!compte) {
            return res.status(404).json({ message: 'Compte non trouvé' });
        }

        const transactionId = await generateTransactionId();

        let solde = compte.solde;
        solde += montant;
        let type = "dépot"
        let motif = "dépot credit " + typeCredit


        compte.solde = solde;
        await compte.save();

        console.log(compte)


        const transaction = await Transaction.create({
            id: transactionId,
            montant,
            type,
            motif,
        });

        console.log(transaction)

    } catch (error) {
        console.log(error)
    }
}

// Obtenir l'historique des transactions pour un compte
const getTransactionHistory = async (req, res) => {
    const { compteRib } = req.params;

    try {
        const transactions = await Transaction.findAll({
            where: { compteRib },
            include: [
                { model: Compte, as: 'compte' },
                { model: User, as: 'approuveParCharge' },
                { model: Client, as: 'approuveParClient' }
            ]
        });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Obtenir les détails d'une transaction spécifique
const getTransactionDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await Transaction.findByPk(id, {
            include: [
                { model: Compte, as: 'compte' },
                { model: User, as: 'approuveParCharge' },
                { model: Client, as: 'approuveParClient' }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction non trouvée' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

module.exports = {
    createTransaction,
    getTransactionHistory,
    getTransactionDetail,
    depotCredit
};
