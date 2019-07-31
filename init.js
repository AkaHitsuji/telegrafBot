const firebase = require('firebase-admin');
const Telegraf = require('telegraf');

const config = require('./config/config.json');
const serviceAccount = require('./config/serviceAccountKey.json');

const { apikey, databaseURL } = config;
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseAuthVariableOverride: { uid: 'admin' },
  databaseURL
});

module.exports.db = firebase.firestore();

module.exports.bot = new Telegraf(apikey);
