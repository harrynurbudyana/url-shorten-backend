require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const mongoose = require('./db');
const Url = require('./models/Url');

const app = express();
app.use(express.json());
app.use(cors());

// Shorten URL
app.post('/shorten', async (req, res) => {
    const { originalUrl, customShortUrl } = req.body;
    const shortCode = customShortUrl || nanoid(6);

    try {
        const existing = await Url.findOne({ short_code: shortCode });
        if (existing) return res.status(400).json({ error: "Custom URL already taken" });

        const newUrl = new Url({ original_url: originalUrl, short_code: shortCode });
        await newUrl.save();
        res.json({ shortUrl: shortCode });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Redirect to original URL
app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    try {
        const urlEntry = await Url.findOne({ short_code: shortCode });
        if (!urlEntry) return res.status(404).json({ error: "Short URL not found" });

        res.redirect(urlEntry.original_url);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
