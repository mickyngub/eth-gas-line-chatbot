require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 4000;

const {
  getGas,
  broadcast,
  reply,
  checkGoldAvailableTime,
} = require("./helpful_functions.js");

const gasNoti = setInterval(async () => {
  let gasFee = await getGas();
  broadcast("broadcast", gasFee);
}, 600000);

const checkGasFeeBelow50gwei = setInterval(async () => {
  let gasFee = await getGas();
  if (gasFee.SafeGasPrice < 50) {
    broadcast("cheapGas", gasFee);
  }
}, 120000);

const pingAppEvery29mins = setInterval(async () => {
  //timeToPingGold is true if the time is 6am
  let timeToPingGold = checkGoldAvailableTime();
  console.log("timeToPingGold status is ", timeToPingGold);
  //ping gold-hsh-line-chatbot to start gold server
  if (timeToPingGold) {
    let pingGoldResponse = await axios.get(
      "https://gold-hsh-line-chatbot.herokuapp.com/webhook"
    );
    console.log("...ping gold!", pingGoldResponse);
  }
  let pingEthResponse = await axios.get(
    "https://eth-gas-line-chatbot.herokuapp.com/webhook"
  );
  console.log("...ping eth!", pingEthResponse);
}, 10000);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/webhook", (req, res) => {
  res.send("...ping!!!");
});

app.post("/webhook", async (req, res) => {
  let reply_token = req.body.events[0].replyToken;
  switch (req.body.events[0].message.text.toLowerCase()) {
    case "gas":
      let gasFee = await getGas();
      reply(reply_token, gasFee);
      break;
    // case "clearnoti":
    //   clearInterval(gasNoti);
    //   break;
    case "help":
      reply(reply_token, "helping");
      break;
    default:
      reply(reply_token, req.body.events[0].message.text);
      break;
  }

  res.sendStatus(200);
});
app.listen(port, () => {
  console.log("listening on port...", port);
});
