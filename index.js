'use strict';
process.env["NTBA_FIX_319"] = 1;
require('dotenv').config();
const token = process.env.TOKEN;

const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token);


const url = 'https://ee8e1585.ngrok.io';
const port = process.env.PORT;

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${token}`);

const app = express();

// parse the updates to JSON
app.use(bodyParser.json());

// We are receiving updates at the route below!
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
  let resp = match[1];
  bot.sendMessage(msg.chat.id, resp);
});

// Start message
bot.onText(/\/start/, function onStartText(msg) {
  let resp = 'Welcome to Zobot!';
  bot.sendMessage(msg.chat.id, resp);
});

// Start message
bot.onText(/\/settings/, function onSettingsText(msg) {
  bot.sendMessage(msg.chat.id, 'Look deep inside...tell me what you find!');
});

// Help message
bot.onText(/\/help/, function onHelpText(msg) {
  bot.sendMessage(msg.chat.id, 'Here are a list of comands \n /help \n /ojo \n /zobot \n /zobot [coin] <-- replace with the coin symbol such as btc or ltc and only enter one at a time');
});

// Help message
bot.onText(/\/zobot/, function onZobotOnlyText(msg) {
  let zomsg = msg.text;
  if(zomsg=="/zobot"){
    bot.sendMessage(msg.chat.id, 'Dis empty');
  }
});

// Zobot
bot.onText(/\/ojo/, function onOjoText(msg, match) {

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Add Call',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'Add Call'
          }
        ],
        [
          {
            text: 'My Calls',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'My Calls'
          }
        ]
      ]
    }
  };

  bot.sendMessage(msg.chat.id, "Choose what you would like to do", opts);

});

// Zobot
bot.onText(/\/zobot (.+)/, function onZobotText(msg, match) {
  const chat_coin = match[1];
  const coin = chat_coin.toLowerCase();
  //console.log("coin="+coin);

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Binance',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'binance'
          }
        ],
        [
          {
            text: 'Bittrrex',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'bittrex'
          }
        ],
        [
          {
            text: 'Poloniex',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'poloniex'
          }
        ],
      ]
    }
  };

  bot.sendMessage(msg.chat.id, "Choose exchanage for " + coin, opts);

});

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const msg_text = callbackQuery.message.text;
  const msg_coin = msg_text.split(' ');

  if (action === 'binance') {
    let coinUrl = 'https://1pj8odvnid.execute-api.us-west-1.amazonaws.com/prod/zobot_status/binance/'+msg_coin[3];
    axios
      .get(coinUrl)
      .then(res => {
        const data = res.data.message;
        console.log(res.data);
        bot.sendMessage(msg.chat.id,data);
    })

  } else if (action === 'bittrex'){
    let coinUrl = 'https://1pj8odvnid.execute-api.us-west-1.amazonaws.com/prod/zobot_status/bittrex/'+msg_coin[3];
    axios
      .get(coinUrl)
      .then(res => {
        const data = res.data.message;
        bot.sendMessage(msg.chat.id,data);
    })

  } else if (action === 'poloniex'){
    let coinUrl = 'https://1pj8odvnid.execute-api.us-west-1.amazonaws.com/prod/zobot_status/poloniex/'+msg_coin[3];
    axios
      .get(coinUrl)
      .then(res => {
        const data = res.data.message;
        bot.sendMessage(msg.chat.id,data);
    })
  }

});
