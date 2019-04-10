const TelegramBot = require('node-telegram-bot-api');
const token = '502635179:AAEk9pjTW6JBGZIgeJXwMFbehEQ49gR3kVE';
const axios = require('axios');
const moment = require('moment');
const express = require('express');
const app = express();

app.set('port', process.env.PORT || 5000);

//For avoidong Heroku $PORT error
app
  .get('/', function(request, response) {
    const result = 'App is running';
    response.send(result);
  })
  .listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
  });

const bot = new TelegramBot(token, { polling: true });
bot.getMe().then(function(me) {
  console.log('Hi my name is %s!', me.username);
});

// match /unisport
bot.onText(/\/unisport(.*)/, function(msg, match) {
  const fromId = msg.chat.id; // get the id, of who is sending the message
  const kb = [
    [
      {
        text: 'today',
        callback_data: '0'
      }
    ],
    [
      {
        text: 'tomorrow',
        callback_data: '1'
      },
      {
        text: '2',
        callback_data: '2'
      },
      {
        text: '3',
        callback_data: '3'
      }
    ],
    [
      {
        text: '4',
        callback_data: '4'
      },
      {
        text: '5',
        callback_data: '5'
      },
      {
        text: '6',
        callback_data: '6'
      }
    ],
    [
      {
        text: '7',
        callback_data: '7'
      },
      {
        text: '8',
        callback_data: '8'
      },
      {
        text: '9',
        callback_data: '9'
      }
    ]
  ]; // The keyboard array
  bot.sendMessage(msg.chat.id, 'Which schedule (how many days from today) do you want?', {
    reply_markup: {
      inline_keyboard: kb
    }
  });
});

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const fromId = msg.chat.id;

  const d = action == 'today' ? 0 : action == 'tomorrow' ? 1 : action;
  const day = d ? moment().add(d, 'days') : moment();

  getUnisportData(day.format('YYYY-MM-DD'))
    .then(m => {
      bot.sendMessage(
        fromId,
        '*' + day.format('dddd DD.MM.YYYY [@ Otahalli:]') + '*' + '\n> ' + m.join('\n> '),
        { parse_mode: 'Markdown' }
      );
    })
    .then(() => {
      bot.deleteMessage(fromId, msg.message_id);
    })
    .catch(err => {
      console.log(err);
      bot.sendMessage(fromId, "Couldn't fetch data");
    });

  bot.editMessageText(text, opts);
});

// match /help
bot.onText(/\/help/, function(msg, match) {
  const text = 'With /unisport you get the unisport classes in Otahalli. .';
  const fromId = msg.chat.id; // get the id, of who is sending the message
  bot.sendMessage(fromId, text);
});

const classes = [
  'Pilates',
  'HIIT',
  'BODYCOMBAT®',
  'BODYATTACK®',
  'BODYPUMP®',
  'Zumba®',
  'Keskivartalotreeni',
  'Kuntojumppa',
  'Flow-jooga',
  'Latin Mix',
  'Astangajooga',
  'Yin-jooga',
  'Hathajooga',
  'Niska-selkä',
  'Kehonhuolto',
  'Total Training'
];

function getUnisportData(date) {
  const uni_url = 'https://api.unisport.fi/v1/fi/events?date=' + date;

  return axios({
    method: 'get',
    url: uni_url,
    responseType: 'json'
  })
    .then(resp =>
      resp.data.items
        .filter(i => i.venue == 'Otahalli' && classes.indexOf(i.activity) > -1)
        .map(i => [
          '*' +
            moment(i.startTime).format('H:mm') +
            '*' +
            ' ' +
            i.name.split('®')[0] +
            '  @ ' +
            i.rooms[0]
        ])
    )
    .catch(
      function(error) {
        console.log(error);
      }.bind(this)
    );
}
