var TelegramBot = require("node-telegram-bot-api");
var token = "502635179:AAEk9pjTW6JBGZIgeJXwMFbehEQ49gR3kVE";
var axios = require("axios");
var moment = require("moment");
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(3000, () => console.log("Example app listening on port 3000!"));

var bot = new TelegramBot(token, { polling: true });
bot.getMe().then(function(me) {
  console.log("Hi my name is %s!", me.username);
});

// match /unisport
bot.onText(/\/unisport/, function(msg, match) {
  var fromId = msg.chat.id; // get the id, of who is sending the message
  var day = moment();
  getUnisportData(day.format("YYYY-MM-DD"))
    .then(m => {
      bot.sendMessage(
        fromId,
        day.format("dddd DD.MM.YYYY [Otaniemi:]") + "\n" + m.join("\n")
      );
    })
    .catch(() => bot.sendMessage(fromId, "Couldn't fetch data"));
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
