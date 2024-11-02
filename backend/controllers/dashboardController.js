const { Op } = require('sequelize');
const Compte = require('../models/compte');
const DemandeCredit = require('../models/DemandeCredit');
const Transaction = require('../models/transaction');
const Client = require('../models/client');
const { Sequelize } = require('sequelize');


exports.calculateClientFinancials = async (req, res) => {
    const { clientId } = req.params;

    try {
        const client = await Client.findByPk(clientId, {
            attributes: ['nom', 'prenom']
        });

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const comptes = await Compte.findAll({
            where: { clientId },
            attributes: ['rib', 'solde']
        });

        const totalSolde = comptes.reduce((sum, compte) => sum + compte.solde, 0);

        const credits = await DemandeCredit.findAll({
            attributes: ['totalMontant'],
            where: {
                clientId,
                paidStatut: 'Not Paid'
            }
        });

        const totalCreditOutstanding = credits.reduce((sum, credit) => {
            const amount = parseFloat(credit.totalMontant.replace(',', '')); // Remove commas and parse as float
            return sum + (isNaN(amount) ? 0 : amount); // Handle any non-numeric values
        }, 0);

        const creditCountOutstanding = await DemandeCredit.count({
            where: {
                clientId,
                paidStatut: 'Not Paid'
            }
        });

        const lastTransaction = await Transaction.findOne({
            where: { compteRib: { [Op.in]: comptes.map(compte => compte.rib) } },
            order: [['createdAt', 'DESC']]
        });

        const lastTransactionAmount = lastTransaction ? lastTransaction.montant : 0;

        const lastTransactionDate = lastTransaction ? new Date(lastTransaction.createdAt) : null;
        const formattedLastTransactionDate = lastTransactionDate
            ? `${lastTransactionDate.getFullYear()}/${String(lastTransactionDate.getMonth() + 1).padStart(2, '0')}/${String(lastTransactionDate.getDate()).padStart(2, '0')}`
            : null;

        res.status(200).json({
            nom: client.nom,
            prenom: client.prenom,
            totalSolde,
            totalCreditOutstanding: totalCreditOutstanding == null ? 0.000 : totalCreditOutstanding.toFixed(3),
            creditCountOutstanding,
            lastTransactionAmount,
            lastTransactionDate: formattedLastTransactionDate,
        });

    } catch (error) {
        console.error('Error calculating financials:', error);
        res.status(500).json({ error: 'An error occurred while calculating financials' });
    }
};