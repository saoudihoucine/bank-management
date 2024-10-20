// controllers/adminController.js
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Client = require('../models/client');
const Agence = require('../models/agence');
const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password'
    }
});


const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 10; i++) {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        password += randomChar;
    }
    return password;
};


const createUser = async (req, res) => {
    const { id, nom, prenom, email, adresse, role, agenceId } = req.body;



    try {
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'client') {
            const { nom, prenom, email } = req.body;
            const client = await Client.create({ id: id, nom, prenom, email, password: hashedPassword, adresse, agenceId });
            const mailOptions = {
                from: 'your_email@gmail.com',
                to: email,
                subject: 'Création de votre compte',
                html: `<p>Bonjour ${nom},</p>
                       <p>Votre compte a été créé avec succès.</p>
                       <p>Voici vos informations de connexion :</p>
                       <p><strong>Email :</strong> ${email}</p>
                       <p><strong>Mot de passe :</strong> ${password}</p>
                       <p>Vous pouvez vous connecter à votre compte à l'adresse suivante : <a href="http://localhost:4200/#/login">Se connecter</a></p>
                       <p>Merci de changer votre mot de passe .</p>`
            };

            //await transporter.sendMail(mailOptions);
            return res.status(201).json({
                response: `<p>Bonjour ${nom},</p>
                       <p>Votre compte a été créé avec succès.</p>
                       <p>Voici vos informations de connexion :</p>
                       <p><strong>Email :</strong> ${email}</p>
                       <p><strong>Mot de passe :</strong> ${password}</p>
                       <p>Vous pouvez vous connecter à votre compte à l'adresse suivante : <a href="http://localhost:4200/#/login">Se connecter</a></p>
                       <p>Merci de changer votre mot de passe .</p>`});
        }

        if (role === 'ChargeClientele' || role === 'DirecteurFinancement') {
            const user = await User.create({ nom, prenom, email, password: hashedPassword, role, agenceId });
            const mailOptions = {
                from: 'your_email@gmail.com',
                to: email,
                subject: 'Création de votre compte',
                html: `<p>Bonjour ${nom},</p>
                       <p>Votre compte a été créé avec succès.</p>
                       <p>Voici vos informations de connexion :</p>
                       <p><strong>Email :</strong> ${email}</p>
                       <p><strong>Mot de passe :</strong> ${password}</p>
                       <p>Vous pouvez vous connecter à votre compte à l'adresse suivante : <a href="http://localhost:4200/#/login">Se connecter</a></p>
                       <p>Merci de changer votre mot de passe .</p>`
            };

            //await transporter.sendMail(mailOptions);
            return res.status(201).json({
                response: 'Création de votre compte',
                html: `<p>Bonjour ${nom},</p>
                       <p>Votre compte a été créé avec succès.</p>
                       <p>Voici vos informations de connexion :</p>
                       <p><strong>Email :</strong> ${email}</p>
                       <p><strong>Mot de passe :</strong> ${password}</p>
                       <p>Vous pouvez vous connecter à votre compte à l'adresse suivante : <a href="http://localhost:4200/#/login">Se connecter</a></p>
                       <p>Merci de changer votre mot de passe .</p>`});
        }

        return res.status(400).json({ message: 'Rôle invalide' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
        console.log(error)
    }
};



const getAllUsers = async (req, res) => {
    const { role } = req.params;
    try {


        if (role === 'client') {
            const clients = await Client.findAll({
                include: { model: Agence, as: 'agence' }
            });
            return res.status(200).json(clients);
        }

        if (role === 'ChargeClientele' || role === 'DirecteurFinancement') {
            const users = await User.findAll({
                where: { role },  // This should be part of the options object
                include: {
                    model: Agence,
                    as: 'agence'   // 'as' should match the alias defined in the association
                }
            });
            return res.status(200).json(users);
        }

        return res.status(400).json({ message: 'ERROR' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
        console.log(error)
    }
};

// controllers/adminController.js
const updateUser = async (req, res) => {
    const { id, nom, prenom, role, email, password, adresse, agenceId, active } = req.body;

    console.log(id, nom, prenom, role, email, password, adresse, agenceId, active)
    try {

        // Check if the client exists
        let client = await Client.findByPk(id);
        if (client) {
            if (password) {
                client.password = await bcrypt.hash(password, 10);
            }
            // Assuming 'username' is not a valid property for Client. You may use 'nom' and 'prenom' instead.
            if (nom) client.nom = nom;
            if (prenom) client.prenom = prenom;
            if (email) client.email = email;
            if (agenceId) client.agenceId = agenceId;
            if (adresse) client.adresse = adresse;
            if (typeof active !== 'undefined') client.active = active;

            await client.save();
            return res.status(200).json(client);
        }
        // Check if the user exists
        let user = await User.findByPk(id);
        if (user) {
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }
            if (nom) user.nom = nom;
            if (prenom) user.prenom = prenom;
            if (email) user.email = email;
            if (agenceId) user.agenceId = agenceId;
            if (role) user.role = role;
            if (typeof active !== 'undefined') user.active = active;

            await user.save();
            return res.status(200).json(user);
        }



        // If neither user nor client was found, send a 404 error response
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};


module.exports = {
    createUser,
    updateUser,
    getAllUsers
};
