'use strict';
process.env["NTBA_FIX_319"] = 1;
require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
var checkSession = require('./lib/app/checkSession');

//Bot hosting variables
//Change these variables to the address for your server
//Also make sure that the PORT variable is defined in your .env file
//This will make sure that the Telegram bot knows where to find this bot
const url = 'https://ee8e1585.ngrok.io';
const port = process.env.PORT;
const token = process.env.TOKEN;

//<---------------- ZOBOT FUNCTIONALITY ---------------->

//Telegram module include and cretion of new bot instance
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${token}`);

const app = express();

// parse the updates to JSON
app.use(bodyParser.json());

//Function to log what users arae saying
function logChat(msg){
  console.log(msg.chat.username + " :: " + msg.text);
}

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
  logChat(msg);
});

// Start message
bot.onText(/\/start/, function onStartText(msg) {
  let resp = 'Welcome to Zobot!';
  bot.sendMessage(msg.chat.id, resp);
  logChat(msg);
  checkSession(msg.chat.id);
});

// Start message
bot.onText(/\/settings/, function onSettingsText(msg) {
  bot.sendMessage(msg.chat.id, 'Look deep inside...tell me what you find!');
  logChat(msg);
});

// Help message
bot.onText(/\/help/, function onHelpText(msg) {
  bot.sendMessage(msg.chat.id, 'Here are a list of comands \n /help \n /ojo \n /zobot \n /zobot [coin] <-- replace with the coin symbol such as btc or ltc and only enter one at a time');
  logChat(msg);
});

// Help message
bot.onText(/\/zobot/, function onZobotOnlyText(msg) {
  let zomsg = msg.text;
  if(zomsg=="/zobot"){
    bot.sendMessage(msg.chat.id, 'Dis empty');
    logChat(msg);
  }
});

// Zobot
bot.onText(/\/ojo/, function onOjoText(msg) {

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Add Coin',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'add_call'
          }
        ],
        [
          {
            text: 'Add Stop Loss',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'add_call'
          }
        ],
        [
          {
            text: 'Add T1',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'add_call'
          }
        ],
        [
          {
            text: 'Add T2',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'add_call'
          }
        ],
        [
          {
            text: 'Add T3',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'add_call'
          }
        ],
        [
          {
            text: 'List My Calls',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'my_calls'
          }
        ]
      ]
    }
  };

  bot.sendMessage(msg.chat.id, "Choose what you would like to do", opts);
  logChat(msg);

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
  logChat(msg);

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
        bot.sendMessage(msg.chat.id,data);
        console.log(msg.chat.username + " :: binance");
    })

  } else if (action === 'bittrex'){
    let coinUrl = 'https://1pj8odvnid.execute-api.us-west-1.amazonaws.com/prod/zobot_status/bittrex/'+msg_coin[3];
    axios
      .get(coinUrl)
      .then(res => {
        const data = res.data.message;
        bot.sendMessage(msg.chat.id,data);
        console.log(msg.chat.username + " :: bittrex");
    })

  } else if (action === 'poloniex'){
    let coinUrl = 'https://1pj8odvnid.execute-api.us-west-1.amazonaws.com/prod/zobot_status/poloniex/'+msg_coin[3];
    axios
      .get(coinUrl)
      .then(res => {
        const data = res.data.message;
        bot.sendMessage(msg.chat.id,data);
        console.log(msg.chat.username + " :: poloniex");
    })
  } else if (action === "add_call"){

    bot.sendMessage(msg.chat.id,"What coin is this call for? Please enter the symbol only such as BTC or ETH.");
    console.log("Search database for open calls for " + msg.chat.id + ". If none are found, open a new call and respond with remaining items");

  }

});

//Always checks messages to see if anaything needs to happen
bot.on('message', (msg) => {
  //Check database to see if the user has an active session
  //checkCall(msg.chat.id) //checks to see if there are any opens calls
  //if there are open calls offer to delete or complete
  //addCall(msg.chat.id,"add_call"); //creates a new call
  const active_session = 1;
  if(active_session==1){
    const session_type = "call";
    if(session_type == "call"){
      const next_step = "coin_name";
      if(next_step=="coin_name"){
        //bot.sendMessage(msg.chat.id,"Great, looks like you want to make a call for " + msg.text + ". Next, I'll need to know the stop loss you recommend for this call. Please enter it below.");

        bot.onText(/\/moon/, function onStartText(msg) {
          let resp = 'To the moon!';
          bot.sendMessage(msg.chat.id, resp);
          logChat(msg);
        });
      }
    }

  } else {

  }
})
