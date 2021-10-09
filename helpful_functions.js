const request = require("request");
const axios = require("axios");

module.exports = {
  convertTimeZone: function (date, tzString) {
    return new Date(date.toLocaleString("en-US", { timeZone: tzString }));
  },
  getTime: function () {
    //This depends on the server, since it runs on HEROKU the time is UTC and needs to convert to GMT+7
    let date_ob_UTC = new Date();
    let date_ob_GMT7 = module.exports.convertTimeZone(
      date_ob_UTC,
      "Asia/Bangkok"
    );
    // adjust 0 before single digit date
    let date = ("0" + date_ob_GMT7.getDate()).slice(-2);
    let month = ("0" + (date_ob_GMT7.getMonth() + 1)).slice(-2);
    let year = date_ob_GMT7.getFullYear();
    // current hours, Plus 7 to convert to GMT+7 since heroku server uses UTC
    let hours = ("0" + date_ob_GMT7.getHours()).slice(-2);
    let minutes = ("0" + date_ob_GMT7.getMinutes()).slice(-2);
    let seconds = ("0" + date_ob_GMT7.getSeconds()).slice(-2);
    const dateString =
      year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds +
      " (GMT+7)";
    return dateString;
  },

  getGas: async function () {
    try {
      const response = await axios.get(
        "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" +
          process.env.ETHERSCAN_TOKEN
      );
      return response.data.result;
    } catch (err) {
      console.log("error occurred", err);
    }
  },

  broadcast: function (type, gasFee) {
    let headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
    };
    let body = JSON.stringify({
      messages: [
        {
          type: "text",
          text:
            `${
              type === "broadcast"
                ? "📢ETH Gas Fee Every 1 hour... \r\n"
                : "💚 GAS FEE BELOW 50 GWEI! \r\n"
            }` +
            `Last Block is ${
              gasFee.LastBlock
            } ⛓ \r\nCurrent Time is ${module.exports.getTime()}\r\n\r\nLow Gas Price is ${
              gasFee.SafeGasPrice
            } gwei 🐌 \r\nAverage Gas Price is ${
              gasFee.ProposeGasPrice
            } gwei 🕛\r\nFast Gas Price is ${gasFee.FastGasPrice} gwei 🚀`,
        },
      ],
      notificationDisabled: `${type === "broadcast" ? true : false}`,
    });

    request.post(
      {
        url: "https://api.line.me/v2/bot/message/broadcast",
        headers: headers,
        body: body,
      },
      (err, res, body) => {
        switch (res.statusCode) {
          case 200:
            console.log(
              `status = ${res.statusCode} successfully ${
                type === "broadcast"
                  ? "broadcasting gas fee..."
                  : "send gas below 50 alert..."
              }`
            );
            break;
          case 400:
            console.log("status = " + res.statusCode + " bad request");
            console.log("errors...", err);
            break;
          default:
            console.log("unknown error occurred ", res.statusCode);
            console.log("errors...", err);
            break;
        }
      }
    );
  },
};
