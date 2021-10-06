require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4000;

const { getGas, broadcast, reply } = require("./helpful_functions.js");
const gasNoti = setInterval(broadcast, 10000);

app.use(bodyParser.urlencoded({ extende: false }));
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  let reply_token = req.body.events[0].replyToken;
  switch (req.body.events[0].message.text.toLowerCase()) {
    case "gas":
      let gasFee = await getGas();
      reply(reply_token, gasFee);
      break;
    case "clearnoti":
      clearInterval(gasNoti);
      break;
    default:
      console.log("incoming msg", req.body.events[0].message.text);
      reply(reply_token, req.body.events[0].message.text);
      break;
  }

  // if (
  //   req.body.events[0].message.text.localeCompare("gas", undefined, {
  //     sensitivity: "accent",
  //   }) === 0
  // ) {
  //   let reply_token = req.body.events[0].replyToken;
  //   let gasFee = await getGas();
  //   reply(reply_token, gasFee);
  // } else {
  //   let reply_token = req.body.events[0].replyToken;
  //   console.log("incoming msg", req.body.events[0].message.text);
  //   reply(reply_token, req.body.events[0].message.text);
  // }

  res.sendStatus(200);
});
app.listen(port, () => {
  console.log("listening on port...", port);
});
