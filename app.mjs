import { getGas, broadcast, reply } from "./helpful_functions";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extende: false }));
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  if (
    req.body.events[0].message.text.localeCompare("gas", undefined, {
      sensitivity: "accent",
    }) === 0
  ) {
    let reply_token = req.body.events[0].replyToken;
    console.log("incoming msg", req.body.events[0].message.text);
    console.log("Getting gas fee...");
    let gasFee = await getGas();
    console.log("Gas Fee is ", gasFee);
    console.log("Replying user...");
    reply(reply_token, gasFee);
  } else {
    let reply_token = req.body.events[0].replyToken;
    console.log("incoming msg", req.body.events[0].message.text);
    reply(reply_token, req.body.events[0].message.text);
  }

  res.sendStatus(200);
});
app.listen(port, () => {
  console.log("listening on port...", port);
  setInterval(broadcast, 100000);
});
