const Client = require('./models/client');
const User = require('./models/user');
const Compte = require('./models/compte');
const Agence = require('./models/agence');
const Transaction = require('./models/transaction');
const Category = require('./models/categorie');





const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/config');
require('dotenv').config();
const bcrypt = require('bcrypt');



const userRoutes = require('./routes/userRoutes');
const demandeCreditRoutes = require('./routes/demandeCreditRoutes');
const agenceRoutes = require('./routes/agenceRoutes');
const authRoutes = require('./routes/authRoutes');
const compteRoutes = require('./routes/compteRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const transcationRoutes = require('./routes/transactionRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dashboardClient = require('./routes/dashboardRoutes');
const chatRoutes = require('./routes/chatRoutes');
const TypeCredit = require('./models/typeCredit');
const { paidCreditMonthly } = require('./controllers/demandeCreditController');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api', userRoutes);
app.use('/api', demandeCreditRoutes);
app.use('/api', agenceRoutes);
app.use('/api', authRoutes);
app.use('/api', compteRoutes);
app.use('/api', categorieRoutes);
app.use('/api', transcationRoutes);
app.use('/api', clientRoutes);
app.use('/api', dashboardClient);
app.use('/api', chatRoutes);








paidCreditMonthly();














const cities = [
    { name: 'Tunis', lat: '36.8065', lng: '10.1815' },
    { name: 'Sfax', lat: '34.7398', lng: '10.7600' },
    { name: 'Sousse', lat: '35.8256', lng: '10.6360' },
    { name: 'Gabes', lat: '33.8815', lng: '10.0982' },
    { name: 'Kairouan', lat: '35.6781', lng: '10.0963' },
    { name: 'Bizerte', lat: '37.2746', lng: '9.8739' },
    { name: 'Tozeur', lat: '33.9206', lng: '8.1335' },
    { name: 'Kebili', lat: '33.7051', lng: '8.9736' },
    { name: 'Monastir', lat: '35.7770', lng: '10.8260' },
    { name: 'Nabeul', lat: '36.4561', lng: '10.7376' },
    { name: 'Zarzis', lat: '33.5003', lng: '11.1111' },
    { name: 'Mahdia', lat: '35.5038', lng: '11.0622' },
    { name: 'Gafsa', lat: '34.4250', lng: '8.7842' },
    { name: 'Tataouine', lat: '32.9292', lng: '10.4518' },
    { name: 'Beja', lat: '36.7336', lng: '9.1843' },
    { name: 'Jendouba', lat: '36.5011', lng: '8.7796' },
    { name: 'Kef', lat: '36.1829', lng: '8.7148' },
    { name: 'Medenine', lat: '33.3540', lng: '10.5055' },
    { name: 'Siliana', lat: '36.0844', lng: '9.3684' },
    { name: 'Sidi Bouzid', lat: '35.0391', lng: '9.4845' }
];












sequelize.sync({ force: true }).then(async () => {
    console.log('Base de données synchronisée');

    const hashedPassword = await bcrypt.hash('password123', 10);

    for (let i = 0; i < 20; i++) {
        const city = cities[i % cities.length];
        const status = true;

        const agence1 = await Agence.create({
            nom: `Agence de ${city.name}`,
            adresse: `${city.name}, Tunisia`,
            telephone: `+216 71 ${Math.floor(100000 + Math.random() * 900000)}`,
            latitude: city.lat,
            longitude: city.lng,
            status: true
        });

    }



    const agence = await Agence.create({
        nom: 'Agence de Tunis',
        adresse: 'Centre Ville, Tunis',
        telephone: '+216 71 123 456',
        latitude: '36.8065',
        longitude: '10.1815',
        status: true
    });


    const creditPresalaire = await TypeCredit.create({
        id: "creditPresalaire",
        nom: "Crédit Présalaire (Avance sur Salaire)"
    });

    const creditAmenagements = await TypeCredit.create({
        id: "creditAmenagements",
        nom: "Crédit Aménagements (Rénovation ou Amélioration de l'Habitat)"
    });

    const créditImmobilier = await TypeCredit.create({
        id: "créditImmobilier",
        nom: "Crédit Immobilier (Credim Express et Credim Watani)"
    });

    const creditAutoInvest = await TypeCredit.create({
        id: "creditAutoInvest",
        nom: "Crédit Auto Invest (Financement de Véhicule)"
    });


    const client = await Client.create({
        id: '12345678',
        nom: 'Hassen',
        prenom: 'Ben Salah',
        email: 'hassen.bensalah@example.com',
        password: hashedPassword,
        agenceId: agence.id
    });


    const charge = await User.create({
        nom: 'Mohamed',
        prenom: 'Khalil',
        email: 'mohamed.khalil@example.com',
        password: hashedPassword,
        role: 'ChargeClientele',
        agenceId: agence.id
    });

    const admin = await User.create({
        nom: 'admin',
        prenom: 'admin',
        email: 'admin.admin@example.com',
        password: hashedPassword,
        role: 'Admin',
        agenceId: 1
    });


    const df = await User.create({
        nom: 'Faten',
        prenom: 'Hajri',
        email: 'faten.hajri@example.com',
        password: hashedPassword,
        role: 'DirecteurFinancement',
        agenceId: agence.id
    });

    const category = await Category.create({
        code: '1001',
        description: 'Compte Courant'
    });

    const compte = await Compte.create({
        rib: '12345678901234567890',
        solde: 5000.0,
        clientId: client.id,
        categoryId: category.code
    });

    const compte1 = await Compte.create({
        rib: '12345678901234567891',
        solde: 5000.0,
        clientId: client.id,
        categoryId: category.code
    });

    const compte2 = await Compte.create({
        rib: '12345678901234567892',
        solde: 5000.0,
        clientId: client.id,
        categoryId: category.code
    });


    for (let i = 1; i <= 10; i++) {
        const isRetrait = i % 2 !== 0;

        await Transaction.create({
            id: `TR${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${i.toString().padStart(5, '0')}`,
            montant: isRetrait ? -(Math.random() * 500) : Math.random() * 500,
            type: isRetrait ? 'retrait' : 'dépot',
            compteRib: compte.rib,
            motif: isRetrait ? 'Transac retrait' : 'Transac dépot',
            approuveParChargeId: !isRetrait ? charge.id : null,
            approuveParClientId: isRetrait ? client.id : null
        });
    }

    console.log('Default data created successfully.');

}).catch(err => console.error('Erreur de synchronisation :', err));

app.get('/', (req, res) => {
    res.send('API Banque Application fonctionne');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
