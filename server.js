// filepath: /path/to/bank-details-api/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bankDetailsDB';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Bank Details Schema
const bankDetailsSchema = new mongoose.Schema({
    merchantName: String,
    accountName: String,
    bankName: String,
    accountNumber: String,
});

const BankDetail = mongoose.model('BankDetail', bankDetailsSchema);

// Routes
app.get('/bank-details', async (req, res) => {
    try {
        const bankDetails = await BankDetail.find();
        res.json(bankDetails);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/bank-details', async (req, res) => {
    const bankDetail = new BankDetail({
        merchantName: req.body.merchantName,
        accountName: req.body.accountName,
        bankName: req.body.bankName,
        accountNumber: req.body.accountNumber,
    });

    try {
        const newBankDetail = await bankDetail.save();
        res.status(201).json(newBankDetail);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/bank-details/:id', async (req, res) => {
    try {
        const bankDetail = await BankDetail.findById(req.params.id);
        if (!bankDetail) return res.status(404).json({ message: 'Bank detail not found' });

        bankDetail.merchantName = req.body.merchantName;
        bankDetail.accountName = req.body.accountName;
        bankDetail.bankName = req.body.bankName;
        bankDetail.accountNumber = req.body.accountNumber;

        const updatedBankDetail = await bankDetail.save();
        res.json(updatedBankDetail);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/bank-details/:id', async (req, res) => {
    try {
        const bankDetail = await BankDetail.findById(req.params.id);
        if (!bankDetail) return res.status(404).json({ message: 'Bank detail not found' });

        await bankDetail.remove();
        res.json({ message: 'Bank detail deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});