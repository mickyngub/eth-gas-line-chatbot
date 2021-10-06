require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const request = require("request");
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extende: false }));
app.use(bodyParser.json());

const reply = (reply_token, gasResponse) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
  };
  let body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      {
        type: "text",
        text: `Low Gas is ${gasResponse.SafeGasPrice} gwei🐌 \r\nAverage Gas is ${gasResponse.ProposeGasPrice} gwei🕛\r\nFast Gas is ${gasResponse.FastGasPrice} gwei🚀`,
      },
    ],
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body,
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};

const getGas = async () => {
  try {
    const response = await axios.get(
      "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken"
    );
    console.log(response.data);
    return response.data.result;
  } catch (err) {
    console.log("error occurrded", err);
  }
};
app.post("/webhook", async (req, res) => {
  let reply_token = req.body.events[0].replyToken;
  console.log("incoming msg", req.body.events[0].message.text);
  console.log("Getting gas fee...");
  let gasFee = await getGas();
  console.log("Gas Fee is ", gasFee);
  console.log("Replying user...");
  reply(reply_token, gasFee);
  res.sendStatus(200);
});
app.listen(port, () => {
  console.log("listening on port...", port);
});
