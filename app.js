require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4000;

const { getGas, broadcast, reply } = require("./helpful_functions.js");

const gasNoti = setInterval(async () => {
  let gasFee = await getGas();
  broadcast("broadcast", gasFee);
}, 60000);

const checkGasFeeBelow100gwei = setInterval(async () => {
  let gasFee = await getGas();
  if (gasFee.SafeGasPrice < 100) {
    broadcast("cheapGas", gasFee);
  }
}, 10000);

app.use(bodyParser.urlencoded({ extende: false }));
app.use(bodyParser.json());

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
    default:
      console.log("incoming msg", req.body.events[0].message.text);
      reply(reply_token, req.body.events[0].message.text);
      break;
  }

  res.sendStatus(200);
});
app.listen(port, () => {
  console.log("listening on port...", port);
});
