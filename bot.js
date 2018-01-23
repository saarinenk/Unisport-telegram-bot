var TelegramBot = require("node-telegram-bot-api");
var token = "502635179:AAEk9pjTW6JBGZIgeJXwMFbehEQ49gR3kVE";
var axios = require("axios");
var moment = require("moment");
var express = require("express");
var app = express();

app.set("port", process.env.PORT || 5000);

//For avoidong Heroku $PORT error
app
  .get("/", function(request, response) {
    var result = "App is running";
    response.send(result);
  })
  .listen(app.get("port"), function() {
    console.log(
      "App is running, server is listening on port ",
      app.get("port")
    );
  });

var bot = new TelegramBot(token, { polling: true });
bot.getMe().then(function(me) {
  console.log("Hi my name is %s!", me.username);
});

// match /unisport
bot.onText(/\/unisport(.*)/, function(msg, match) {
  var fromId = msg.chat.id; // get the id, of who is sending the message
  var givenDay = match[1].split(" ")[1];
  var day = givenDay ? moment().add(givenDay, "days") : moment();
  getUnisportData(day.format("YYYY-MM-DD"))
    .then(m => {
      bot.sendMessage(
        fromId,
        day.format("dddd DD.MM.YYYY [@ Otahalli:]") + "\n" + m.join("\n")
      );
    })
    .catch(() => bot.sendMessage(fromId, "Couldn't fetch data"));
});

// match /help
bot.onText(/\/help/, function(msg, match) {
  var text =
    "By sending /unisport you get the unisport classes of this day in Otahalli. By adding a space and a number to the end, you can get the classes of that day which is that many days away. For example '/unisport 2' gives the classes of the day after tomorrow.";
  var fromId = msg.chat.id; // get the id, of who is sending the message
  bot.sendMessage(fromId, text);
});

var classes = [
  "Pilates",
  "HIIT",
  "BODYCOMBAT®",
  "BODYATTACK®",
  "BODYPUMP®",
  "Zumba®",
  "Keskivartalotreeni",
  "Kuntojumppa",
  "Flow-jooga",
  "Latin Mix",
  "Astangajooga",
  "Yin-jooga",
  "Hathajooga",
  "Niska-selkä",
  "Kehonhuolto"
];

function getUnisportData(date) {
  var uni_url =
    "https://unisport.fi/yol/web/fi/crud/read/event.json?date=" + date;

  return (
    axios({
      method: "get",
      url: uni_url,
      responseType: "json"
    })
      .then(resp =>
        resp.data.items
          .filter(
            i => i.venue == "Otahalli" && classes.indexOf(i.activity) > -1
          )
          .map(i => [
            moment(i.startTime).format("H:mm") +
              " " +
              i.name.split("®")[0] +
              "  @ " +
              i.rooms[0]
          ])
      )
      /*    .then(
      function(response) {
        var data = response.data.items
          .filter(i => i.venue == "Otahalli" && classes.indexOf(i.name) > -1)
          .map(i => i.name);
        console.log(typeof data);
        return data;
      }.bind(this)) */
      .catch(
        function(error) {
          console.log(error);
        }.bind(this)
      )
  );
}
