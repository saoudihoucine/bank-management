const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Client = require('../models/client');
const Agence = require('../models/agence');
const { Op } = require('sequelize'); // Import Op from sequelize


const SECRET_KEY = 'your_secret_key'; // Remplacez par une clé secrète sécurisée
const RESET_TOKEN_SECRET = 'your_reset_token_secret'; // Remplacez par une clé secrète pour les tokens de réinitialisation

// Transporteur pour envoyer les emails
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'bankamen30@gmail.com',
        pass: 'Azerty123++'
    }
});

// Fonction pour gérer la connexion
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Try to find as Client
        let client = await Client.findOne({ where: { email: email } });
        if (client) {
            const isMatch = await bcrypt.compare(password, client.password);
            if (!isMatch || !client.active) {
                return res.status(401).json({ message: 'Mot de passe incorrect ou compte inactif' });
            }

            // Check if the associated agency is active
            const agence = await Agence.findByPk(client.agenceId);
            if (!agence || !agence.status) {
                return res.status(401).json({ message: 'Agence inactive' });
            }

            const token = jwt.sign({ id: client.id, role: 'client', agenceId: client.agenceId }, SECRET_KEY, { expiresIn: '1h' });
            return res.json({ token });
        }

        // If the client is not found, try with User
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch || !user.active) {
                return res.status(401).json({ message: 'Mot de passe incorrect ou compte inactif' });
            }

            // Check if the associated agency is active
            const agence = await Agence.findByPk(user.agenceId);
            if (!agence || !agence.status) {
                return res.status(401).json({ message: 'Agence inactive' });
            }

            const token = jwt.sign({ id: user.id, role: user.role, agenceId: user.agenceId }, SECRET_KEY, { expiresIn: '1h' });
            const role = user.role;
            return res.json({ token });
        }

        res.status(401).json({ message: 'Utilisateur non trouvé' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};



const profile = async (req, res) => {
    const { id } = req.body;

    console.log(id)

    try {

        if (id.length == 8) {
            let client = await Client.findOne({ where: { id: id } });
            if (client) {
                return res.json({ client, role: "client" });
            }
        }


        // If the client is not found, try with User
        let user = await User.findOne({ where: { id: id } });
        if (user) {
            return res.json({ user, role: user.role });
        }

        res.status(401).json({ message: 'Utilisateur non trouvé' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};




// Fonction pour gérer la récupération du mot de passe
const recoverPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Search for the user by email in Client or User table
        let user = await Client.findOne({ where: { email: email } });
        if (!user) {
            user = await User.findOne({ where: { email: email } });
        }

        // If no user is found, return 404
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Generate a random reset token and set expiration to 1 hour from now
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiration = Date.now() + 3600000; // 1 hour

        // Update the user record with the reset token and expiration
        await user.update({ resetToken, resetTokenExpiration });

        // Construct the password reset link
        const resetLink = `http://localhost:4200/#/rest-password?token=${resetToken}`;

        // Define email options to send the reset link
        const mailOptions = {
            from: 'bankamen30@gmail.com',
            // to: email,
            to: "saoudihussein@gmail.com",
            subject: 'Réinitialisation du mot de passe',
            html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                   <p>Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :</p>
                   <a href="${resetLink}">${resetLink}</a>`
        };

        //await transporter.sendMail(mailOptions);

        // Respond with success message including the reset link for testing
        res.status(200).json({ message: resetLink });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};


const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Find the user or client with the valid reset token and expiration time greater than current time
        let user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() }
            }
        });

        let client;
        if (!user) {
            client = await Client.findOne({
                where: {
                    resetToken: token,
                    resetTokenExpiration: { [Op.gt]: Date.now() }
                }
            });
        }

        // Debugging logs to track the tokens and expiration
        console.log('Received Token:', token); // Log the token received in the request

        const account = user || client; // Either a user or client found

        if (account) {
            console.log('Stored Reset Token:', account.resetToken); // Log the token stored in the database
            console.log('Stored Expiration:', account.resetTokenExpiration); // Log the expiration time
        }

        // If no valid user or client found, return error message
        if (!account) {
            return res.status(400).json({ message: 'Token invalide ou expiré' });
        }

        // Hash the new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the account's password and clear the reset token and expiration
        await account.update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiration: null
        });

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        console.error('Error during password reset:', error); // Log the error for debugging
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};



module.exports = {
    login,
    recoverPassword,
    resetPassword,
    profile
};
