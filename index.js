'use strict';
process.env["NTBA_FIX_319"] = 1;
require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
const checkSession = require('./lib/app/checkSession');
const updateSession = require('./lib/app/updateSession');

//Bot hosting variables
//Change these variables to the address for your server
//Also make sure that the PORT variable is defined in your .env file
//This will make sure that the Telegram bot knows where to find this bot
const url = process.env.BASEURL;
const port = process.env.PORT;
const token = process.env.TOKEN;

//<---------------- EXPRESS ---------------->

// Calls the express function "express()" and puts new Express application
// inside the app variable to start a new Express application
const app = express();

// Start Express server for our web application framework
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

// Passing bodyParser into Express
// Returns middleware that will make sure we are only parsing JSON
// bodyParser will make the form data available
app.use(bodyParser.json());

// This route will accept the HTTP POST payload sent by
// Telegram whenever an user event has occurred
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

//<---------------- ZOBOT ---------------->

// Telegram module include and cretion of new bot instance
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${token}`);

// Conversation logging function
function logChat(msg){
  console.log(msg.chat.username + " :: " + msg.text);
  //TODO: log to database
}

// Function to send final message if something is not in the dictionary
function finalTry(chatId){
  bot.sendMessage(chatId,"Sorry, I didn't understand that. Type /help to see available commands.");
}

// Function returns the session state
// Session state is stored in a database
async function getSession(id){
  try{

    let resp = await checkSession(id);
    return resp;

  } catch(err){

    console.log(err);
    console.log('Could not process request due to an error');
    return;

  }
}

// Matches /echo [whatever] and returns to use
// This is a testing function that will allow developer to
// understand how to use slash commands and variables after commands
bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
  let resp = match[1];
  bot.sendMessage(msg.chat.id, resp);
  logChat(msg);
});

// Start message - this is what the user will first see
// when initiating a session with the bot
bot.onText(/\/start/, async function onStartText(msg) {
  let chatId = msg.chat.id;
  try {
    let resp = await getSession(chatId);
    let active_session = resp.active_session;

    if(active_session == 1){
      bot.sendMessage(msg.chat.id,"Looks like you have an unfinished call. Please finish it or type /cancel to cancel the open call");
    } else if(active_session == 0) {
      bot.sendMessage(msg.chat.id,"Welcome to Zobot!");
    }
  } catch (err){
    console.log(err);
  }

});

// Settings - Functionality TBD
bot.onText(/\/settings/, function onSettingsText(msg) {
  bot.sendMessage(msg.chat.id, 'Look deep inside...tell me what you find!');
  logChat(msg);
});

// Help - will return overview of bot and purpose
// as well as commands and functionality
bot.onText(/\/help/, function onHelpText(msg) {
  bot.sendMessage(msg.chat.id, 'Here are a list of comands \n /help \n /ojo \n /zobot \n /zobot [coin] <-- replace with the coin symbol such as btc or ltc and only enter one at a time');
  logChat(msg);
});

// Zobot message with nothing after the zobot command
// This has no functionality
// TODO: Update function so that this returns information about
// zobot and how to use it
bot.onText(/\/zobot/, function onZobotOnlyText(msg) {
  let zomsg = msg.text;
  if(zomsg=="/zobot"){
    bot.sendMessage(msg.chat.id, 'Dis empty');
    logChat(msg);
  }
});

// Cancel Calls - This cancels the flow of the current call adding process
// in the event that the user does not want to add the call that was started
// This also ensures that only one call is being added at a time - however
// multiple calls can be added
bot.onText(/\/cancel/, function onCancelText(msg) {

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Yes, Cancel My Call',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'cancel_call'
          }
        ],
        [
          {
            text: 'Complete My Call!',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'finish_call'
          }
        ],
      ]
    }
  };

  bot.sendMessage(msg.chat.id, 'Are you sure you want to cancel your active call?',opts);
  logChat(msg);
});

// Ojo - Call adding system that initiates the ojo functionality
// Users will be able to add calls or view their calls
// TODO - Allow user to see all calls or top 10 calls
// TODO - Allow user to lookup calls by user (/ojo @TheZoman)
bot.onText(/\/ojo/, function onOjoText(msg) {

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Add Coin',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'add_zobot_call'
          }
        ],
        [
          {
            text: 'List My Calls',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'my_zobot_calls'
          }
        ]
      ]
    }
  };

  bot.sendMessage(msg.chat.id, "Choose what you would like to do", opts);
  logChat(msg);

});

// Zobot - Allows user to lookup the Zobot status on a particular coin
// Currently, Zobot supports Binance, Bittrex, and Poloniex
// TODO: Return graceful message if the coin does not exist in the exchange
// OR: Return only keyboard for supported exchanges for the coin
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

// Handle callback queries - Callback queries are keyboard responses
bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
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
        logChat(msg);
    })
  } else if (action === 'bittrex'){
    let coinUrl = 'https://1pj8odvnid.execute-api.us-west-1.amazonaws.com/prod/zobot_status/bittrex/'+msg_coin[3];
    axios
      .get(coinUrl)
      .then(res => {
        const data = res.data.message;
        bot.sendMessage(msg.chat.id,data);
        logChat(msg);
    })
  } else if (action === 'poloniex'){
    let coinUrl = 'https://1pj8odvnid.execute-api.us-west-1.amazonaws.com/prod/zobot_status/poloniex/'+msg_coin[3];
    axios
      .get(coinUrl)
      .then(res => {
        const data = res.data.message;
        bot.sendMessage(msg.chat.id,data);
        logChat(msg);
    })
  } else if (action === "add_zobot_call"){
    //Check database to see if the user has an active session
    let chatId = msg.chat.id;
    try {

      let resp = await getSession(chatId);

      //A record exists in the database
      if(resp){
        let active_session = resp.active_session;
        let session_type = resp.session_type;
        let next_step = resp.next_step;
        let id = resp.ID;

        if(active_session == 1){
          bot.sendMessage(msg.chat.id,"Looks like you have an unfinished call. Please finish it or type /cancel to cancel the open call");
          logChat(msg);
        } else if(active_session == 0) {
          bot.sendMessage(msg.chat.id,"What coin is this call for? Please enter the symbol only such as BTC or ETH.");
          updateSession(msg.chat.id,"coin_name","call",id);
          console.log("id="+id);
          logChat(msg);
          //log next step coin_name
          //create new conversation session for user if not already created (need function - send start/end and it will determine if row needed)
          //make sure new conversation is active session = 1
        }
      //No conversation records in the database
      } else {
        bot.sendMessage(msg.chat.id,"What coin is this call for? Please enter the symbol only such as BTC or ETH.");
        updateSession(msg.chat.id,"coin_name","call",0);
        logChat(msg);
      }
    } catch (err){
      console.log(err);
    }
  } else if (action === "zobot_call_complete"){
    //log next step complete
    //set conversation as inactive
    //tell user call is stored
    //provide instructions on how to retrieve call
  } else if (action=== "binance_exchange"){
    //Check database to see if the user has an active session
    let chatId = msg.chat.id;
    try {
      let resp = await getSession(chatId);
      if(resp){
        let id = resp.ID;

        //log next step t1
        bot.sendMessage(msg.chat.id,"Great! I've got the coin name and exchange.");
        bot.sendMessage(msg.chat.id,"Now I'll need your targets. Let's start with T1, please enter it below. Only enter the price in USD or Satoshis. Do not any symbols. It can be something like 4000.18 or .00003432.");
        bot.sendMessage(msg.chat.id,"Ok, go ahead and enter T1.")
        updateSession(msg.chat.id,"t1","call",id);
        logChat(msg);
      }
    } catch (err){
      console.log(err);
    }
  } else if (action==="cancel_call"){
    //Check database to see if the user has an active session
    let chatId = msg.chat.id;
    try {
      let resp = await getSession(chatId);
      if(resp){
        let id = resp.ID;

        //log next step t1
        bot.sendMessage(msg.chat.id,"Your call has been cancelled.");
        bot.sendMessage(msg.chat.id,"This only applies to the most recent call that was unfinished - the rest of your calls are still stored");
        updateSession(msg.chat.id,"cancelled","call",id);
        logChat(msg);
      }
    } catch (err){
      console.log(err);
    }
  }
});

//Always checks messages to see if anaything needs to happen
bot.on('message', async function onMessageQuery(msg) {

  // Checks to see if message starts with /
  // If it does, it ignores, otherwise attempts to process
  // Commands that start with / are handled above
  if(msg.text.substring(0,1)=="/"){
    return;
  } else {
    //Check database to see if the user has an active session
    let chatId = msg.chat.id;
    try {
      const resp = await getSession(chatId);
      if(resp){
        let active_session = resp.active_session;
        let session_type = resp.session_type;
        let next_step = resp.next_step;
        let id = resp.ID

        // If there is an active session for the current user
        if(active_session == 1){

          // CALL STEP - Coin Name
          // Start by defining the coin for the call
          if(next_step=="coin_name" || next_step=="start"){
            // Keyboard that asks user the exchange for the call
            // Currently we support Binance, Bittrex, and Poloniex
            const opts = {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Binance',
                      callback_data: 'binance_exchange'
                    }
                  ],
                  [
                    {
                      text: 'Bittrrex',
                      callback_data: 'bittrex_exchange'
                    }
                  ],
                  [
                    {
                      text: 'Poloniex',
                      callback_data: 'poloniex_exchange'
                    }
                  ],
                ]
              }
            };
            bot.sendMessage(msg.chat.id,"Thanks - I'll note that this is a call for "+msg.text);
            bot.sendMessage(msg.chat.id,"Next, I'll need the exchange where "+msg.text+" is traded and corresponds to this call",opts);
            updateSession(msg.chat.id,"exchange","call",id);
            logChat(msg);

          // CALL STEP - Target 1
          // Define target 1 for the call
          } else if (next_step=="t1"){
            //log next step t2
            bot.sendMessage(msg.chat.id,"T1 recorded.");
            bot.sendMessage(msg.chat.id,"What is T2?");
            updateSession(msg.chat.id,"t2","call",id);
            logChat(msg);

          // CALL STEP - Target 2
          // Define target 2 for the call
          } else if (next_step=="t2"){
            //log next step t3
            bot.sendMessage(msg.chat.id,"T2 recorded.");
            bot.sendMessage(msg.chat.id,"What is T3?");
            updateSession(msg.chat.id,"t3","call",id);
            const opts = {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Finished',
                      callback_data: 'finished_call'
                      //make a case for this
                    }
                  ],
                ]
              }
            }
            logChat(msg);

          // CALL STEP - Target 3
          // Define target 3 for the call
          } else if (next_step=="t3"){
            //log next step stop_loss
            bot.sendMessage(msg.chat.id,"T3 recorded.");
            bot.sendMessage(msg.chat.id,"Now I'll need your recommended stop loss?");
            updateSession(msg.chat.id,"stop_loss","call",id);
            logChat(msg);

          // CALL STEP - Stop Loss
          // Define stop loss for the call
          } else if (next_step=="stop_loss"){
            //log next step wrap_up
            //log date, type, user, status
            const opts = {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Submit My Call',
                      // Check for this value when we listen
                      // for "callback_query"
                      callback_data: 'submit_call'
                    }
                  ],
                  [
                    {
                      text: 'Start Again',
                      // Check for this value when we listen
                      // for "callback_query"
                      callback_data: 'start_call_again'
                    }
                  ]
                ]
              }
            };
            bot.sendMessage(msg.chat.id,"Ok, I have all the information I need. Please verify the following information and respond accordingly:",opts);
            updateSession(msg.chat.id,"wrap_up","call",id);
            logChat(msg);

          // CALL STEP - Finish call process
          // Confirm details of call with user 
          } else if (next_step=="wrap_up"){
            //return full call details
            //show keyboard with callback query zobot_call_complete
            bot.sendMessage(msg.chat.id,"Thanks! I've recorded your call and will be monitoring status regularly. You caan update the stop loss on this call or monitor the rest of your calls by typing /ojo and selecting My Calls.");
            updateSession(msg.chat.id,"complete","call",id);
            logChat(msg);
          }
        // There is no current session for the user
        } else if(active_session == 0) {
          //###########COMPLETE THIS AREA###########
        }
      }
    } catch (err){
      console.log(err);
    }
  }

})
