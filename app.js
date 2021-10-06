require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4000;

const { getGas, broadcast, reply } = require("./helpful_functions.js");

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
    case "help":
      reply(reply_token, "helping");
      break;
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
