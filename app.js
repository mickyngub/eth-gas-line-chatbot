require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 5000;
let broadcastCounter = 0;
let halfMinElapsed = 0;

const {
  getGas,
  broadcast,
} = require("./helpful_functions.js");

const gasNoti = setInterval(async () => {
  let gasFee = await getGas();
  broadcast("broadcast", gasFee);
  broadcastCounter += 1;
  console.log("Broadcast counter = ", broadcastCounter);
}, 1800000);

const checkGasFeeBelow50gwei = setInterval(async () => {
  let gasFee = await getGas();
  // minElapsed = Math.max(0, minElapsed);
  let delay15mins = halfMinElapsed >= 30 ? true : false
  if (gasFee.SafeGasPrice < 50 && delay15mins) {
    broadcast("cheapGas", gasFee);
    clearInterval(checkGasFeeBelow50gwei);
    broadcastCounter += 1;
    halfMinElapsed = 0;
    console.log("Broadcast counter = ", broadcastCounter);
  }
  minElapsed += 1;
}, 30000);

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

app.listen(port, async () => {
  console.log("listening on port...", port);
  // let gas = await getGas();
  // console.log("this is gas", gas)
});
