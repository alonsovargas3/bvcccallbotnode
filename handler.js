'use strict';
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const bot = new TelegramBot(token);

module.exports.zobot = (context, callback) => {
  let message;
  const bod = context.body;

  //Determining if this is a message or a callback from a button
  if(JSON.parse(bod).message) {
    //Get the message submitted by the user and chatId
    message = JSON.parse(bod).message.text;
    const chatId = JSON.parse(bod).message.chat.id;

    //Start command that begins the journey and onboards the user
    //We can deep link users right to this command
    if (message.match(/\/start/)) {
      const out = bot.sendMessage(chatId, 'Welcome to Zobot on Telegram with Ojo, our call tracking system. This bot will allow you view the status of current coins, add calls, and view current calls. \n \n For a list of commands type /help');
      return out;
    }

    //Help command to informr users of available functionality
    if (message.match(/\/help/)) {
      const out = bot.sendMessage(chatId, 'Here are a list of comands \n /help \n /ojo \n /zobot \n /zobot [coin] <-- replace with the coin symbol such as btc or ltc and only enter one at a time');
      return out;
    }

    //Settings command that will be used to allow users to modify settings
    if (message.match(/\/settings/)) {
      const out = bot.sendMessage(chatId, 'Look deep inside...tell me what you find!');
      return out;
    }

    //Zobot functionality
    if (message.startsWith('/zobot')) {
      const coins = message.replace('/zobot','').trim();
      if(coins == ''){
        const out = bot.sendMessage(chatId, 'Top 5 coins');
        return out;
      } else {
        const opts = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Binance',
                  // we shall check for this value when we listen
                  // for "callback_query"
                  callback_data: 'Binance'
                }
              ],
              [
                {
                  text: 'Bittrrex',
                  // we shall check for this value when we listen
                  // for "callback_query"
                  callback_data: 'Bittrex'
                }
              ],
              [
                {
                  text: 'Poloniex',
                  // we shall check for this value when we listen
                  // for "callback_query"
                  callback_data: 'Poloniex'
                }
              ],
            ]
          }
        };
        const out = bot.sendMessage(chatId,coins,opts);
        return out;
      }
    }

    //Ojo functionality
    if (message.startsWith('/ojo')) {
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
      const out = bot.sendMessage(chatId,"Choose what you would like to do",opts);
      return out;

    }

    //If we do not understand the messagae then let user know to try again
    const out = bot.sendMessage(chatId, 'Sorry, I did not understand. Please try again');
    return out;

  //Deterrmining that this is a callback
  } else {
    //Getting the callback value, the chatId, and the orirginal message above the buttons themselves
    const callback_query = JSON.parse(bod).callback_query.data;
    const chatId = JSON.parse(bod).callback_query.message.chat.id;
    const original_message = JSON.parse(bod).callback_query.message.text;

    //Going through list of possible cases for callbacks
    if(callback_query == 'Binance'){
      const out = bot.sendMessage(chatId, 'Getting data for ' + original_message + ' at '+callback_query);
      return out;
    } else if (callback_query == 'Bittrex'){
      const out = bot.sendMessage(chatId, 'Getting data for ' + original_message + ' at '+callback_query);
      return out;
    } else if (callback_query == 'Poloniex'){
      const out = bot.sendMessage(chatId, 'Getting data for ' + original_message + ' at '+callback_query);
      return out;
    } else if (callback_query == 'Add Call'){
      const out = bot.sendMessage(chatId, 'Seems like you want to add a call');
      return out;
    } else if (callback_query == 'My Calls'){
      const out = bot.sendMessage(chatId, 'Your current calls below');
      return out;
    }
  }

};
