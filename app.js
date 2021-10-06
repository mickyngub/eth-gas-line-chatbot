require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
const port = process.env.PORT || 4000;

const reply = (reply_token, msg) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
  };
  let body = JSON.stringify({
    reply_token: reply_token,
    messages: [
      {
        type: "text",
        text: msg,
      },
    ],
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body,
    },
    (res) => {
      console.log("status = " + res.statusCode);
    }
  );
};

app.use(bodyParser.urlencoded({ extende: false }));
app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  let reply_token = req.body.events[0].replyToken;
  let msg = "test message";
  reply(reply_token, msg);
  res.sendStatus(200);
});
app.listen(port);
