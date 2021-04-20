'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// Express middleware
app.use(express.urlencoded({ extended: true }));

// Utilize ExpressJS functionality to parse the body of the request

// Specify a directory for static resources
app.use(express.static(__dirname + '/public/css'));

// define our method-override reference
app.use(methodOverride('_method'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// Use app cors
app.use(cors());


// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
app.get('/', getTenQuotes);
app.get('/favorite-quotes', getSavedQuotes);
app.get('/favorite-quotes/:quote_id', getQuoteDetails);
app.post('/quote', saveQuote);
app.delete('/favorite-quotes/:quote_id', deleteQuote);
app.put('/favorite-quotes/:quote_id', updateQuote)

// callback functions
function getTenQuotes(req, res) {
    const url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';

    superagent.get(url).set('User-Agent', '1.0').then((results) => {
        const quotes = results.body.map((quote) => {
            return new Quote(quote);
        })
        res.render('pages/index', { quotes: quotes });
    });
}

function saveQuote(req, res) {
    const { quote, character, image, characterDirection } = req.body;
    const safeValues = [quote, character, image, characterDirection];
    const sql = `INSERT INTO quotes(quote, character, image, characterDirection) VALUES ($1, $2, $3, $4);`;

    client.query(sql, safeValues).then(() => {
        res.redirect('/favorite-quotes');
    })
}

function getSavedQuotes(req, res) {
    const sql = `SELECT * FROM quotes;`;

    client.query(sql).then((results) => {
        res.render('pages/favorites', { quotes: results.rows });
    });
}

function getQuoteDetails(req, res) {
    const quoteId = req.params.quote_id;

    const safeValues = [quoteId];
    const sql = `SELECT * FROM quotes WHERE id=$1;`;

    client.query(sql, safeValues).then((results) => {
        res.render('pages/details', { quote: results.rows[0] });
    });
}

function deleteQuote(req, res) {
    const quoteId = req.params.quote_id;
    const safeValues = [quoteId];

    const sql = `DELETE FROM quotes WHERE id=$1;`;

    client.query(sql, safeValues).then(() => {
        res.redirect('/favorite-quotes');
    });
}

function updateQuote(req, res) {
    const quoteId = req.params.quote_id;
    const quote = req.body.quote;
    const safeValues = [quoteId, quote];

    const sql = `UPDATE quotes SET quote = $2 WHERE id=$1;`;

    client.query(sql, safeValues).then(() => {
        res.redirect(`/favorite-quotes/${quoteId}`);
    });
}

// helper functions

// constructor functions
const Quote = function(data) {
    this.quote = data.quote;
    this.character = data.character;
    this.image = data.image;
    this.characterDirection = data.characterDirection;
}

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);