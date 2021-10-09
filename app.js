require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 5000;

const {
  getGas,
  broadcast,
  reply,
} = require("./helpful_functions.js");

const gasNoti = setInterval(async () => {
  let gasFee = await getGas();
  broadcast("broadcast", gasFee);
}, 1800000);

let minElapsed=0;

const checkGasFeeBelow50gwei = setInterval(async () => {
  let gasFee = await getGas();
  // minElapsed = Math.max(0, minElapsed);
  let delay15mins = minElapsed >= 15 ? true : false
  if (gasFee.SafeGasPrice < 50 && delay15mins) {
    broadcast("cheapGas", gasFee);
    clearInterval(checkGasFeeBelow50gwei);
    minElapsed = 0;
  }
  minElapsed += 1;
}, 60000);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  console.log("get /")
  res.send(

    "welcome to the frontpage..."
  )
})
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
app.listen(port, async () => {
  console.log("listening on port...", port);
  // let gas = await getGas();
  // console.log("this is gas", gas)
});
