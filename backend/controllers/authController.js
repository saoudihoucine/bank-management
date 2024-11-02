const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Client = require('../models/client');
const Agence = require('../models/agence');
const { Op } = require('sequelize'); 


const SECRET_KEY = 'your_secret_key'; 
const RESET_TOKEN_SECRET = 'your_reset_token_secret'; 


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'emna.maatougui2018@gmail.com',
        pass: 'emqn hppd cbtm qzjm'
    }
});


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        
        let client = await Client.findOne({ where: { email: email } });
        if (client) {
            const isMatch = await bcrypt.compare(password, client.password);
            if (!isMatch || !client.active) {
                return res.status(401).json({ message: 'Mot de passe incorrect ou compte inactif' });
            }

          
            const agence = await Agence.findByPk(client.agenceId);
            if (!agence || !agence.status) {
                return res.status(401).json({ message: 'Agence inactive' });
            }

            const token = jwt.sign({ id: client.id, role: 'client', agenceId: client.agenceId }, SECRET_KEY, { expiresIn: '1h' });
            return res.json({ token });
        }

      
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch || !user.active) {
                return res.status(401).json({ message: 'Mot de passe incorrect ou compte inactif' });
            }

           
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





const recoverPassword = async (req, res) => {
    const { email } = req.body;

    try {
        
        let user = await Client.findOne({ where: { email: email } });
        if (!user) {
            user = await User.findOne({ where: { email: email } });
        }

       
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiration = Date.now() + 3600000; // 1 hour

       
        await user.update({ resetToken, resetTokenExpiration });

        
        const resetLink = `http://localhost:4200/#/rest-password?token=${resetToken}`;

        
        const mailOptions = {
            from: 'emna.maatougui2018@gmail.com',
            to: email,
            subject: 'Réinitialisation du mot de passe',
            html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                   <p>Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :</p>
                   <a href="${resetLink}">${resetLink}</a>`
        };

        await transporter.sendMail(mailOptions);

     
        res.status(200).json({ message: resetLink });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};


const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        
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

        
        console.log('Received Token:', token); 

        const account = user || client; 

        if (account) {
            console.log('Stored Reset Token:', account.resetToken); 
            console.log('Stored Expiration:', account.resetTokenExpiration); 
        }

        
        if (!account) {
            return res.status(400).json({ message: 'Token invalide ou expiré' });
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        await account.update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiration: null
        });

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        console.error('Error during password reset:', error); 
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};



module.exports = {
    login,
    recoverPassword,
    resetPassword,
    profile
};
