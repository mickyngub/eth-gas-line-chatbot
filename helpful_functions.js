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
    let hours = date_ob_GMT7.getHours();
    let minutes = date_ob_GMT7.getMinutes();
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

  //Check whether it's 6am or not, if it is then returns true, else return false
  checkGoldAvailableTime: function () {
    let date_ob_UTC = new Date();
    let date_ob_GMT7 = module.exports.convertTimeZone(
      date_ob_UTC,
      "Asia/Bangkok"
    );
    let hours = date_ob_GMT7.getHours();
    if (hours === 23) {
      return true;
    }
    return false;
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
                ? "📢ETH Gas Fee Every 10 mins... \r\n"
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

  reply: function (reply_token, msg) {
    let headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
    };
    let body;
    let log;
    if (msg === "helping") {
      body = JSON.stringify({
        replyToken: reply_token,
        messages: [
          {
            type: "text",
            text: `🤖ETHEREUM_GAS_BOT_FEE by @mickyngub has 3 functionalities
              \r\n1. User can type "gas" in the chat to get the current gas price⛽
              \r\n2. The bot will automatically check the gas price every 2 minutes, if the gas price is below 50gwei, it will notify users with push notification💚
              \r\n3. The bot will send the gas price with no push notification every 10 minutes📢
              \r\nFor further information please contact me @mickyngub in Twitter

              \r\n🤖ETHEREUM_GAS_BOT_FEE by @mickyngub มีสามฟังก์ชั่นหลัก
              \r\n1. คุณสามารถพิมพ์คำว่า "gas" ลงในช่องแชทเพื่อเชคราคาแก๊สในขณะนี้⛽
              \r\n2. บอทจะคอยเชคราคาแก๊สทุกๆสองนาที หากราคาแก๊สต่ำกว่า 50gwei บอทจะส่งข้อความแจ้งเตือนหาคุณทันที💚
              \r\n3. บอทจะคอยเชคและส่งราคาแก๊สให้คุณทุกๆสิบนาที โดยบอทจะส่งข้อความแจ้งเตือนแบบไม่มีเสียง📢
              \r\nหากมีคำถามเพิ่มเติมสามารถติดต่อผมได้ที่ @mickyngub ในทวิตเตอร์
            `,
          },
        ],
      });
      log = " successfully sending help instructions....";
    } else if (msg.SafeGasPrice) {
      body = JSON.stringify({
        replyToken: reply_token,
        messages: [
          {
            type: "text",
            text: `⛽Current ETH Gas Fee... \r\nLast Block is ${
              msg.LastBlock
            } ⛓ \r\n\Current Time is ${module.exports.getTime()}\r\n\r\nLow Gas Price is ${
              msg.SafeGasPrice
            } gwei 🐌 \r\nAverage Gas Price is ${
              msg.ProposeGasPrice
            } gwei 🕛\r\nFast Gas Price is ${msg.FastGasPrice} gwei 🚀`,
          },
        ],
      });
      log = " successfully sending real-time eth gas fee....";
    } else {
      body = JSON.stringify({
        replyToken: reply_token,
        messages: [
          {
            type: "text",
            text: `${msg} is not a command, please type "help" to see all the commands`,
          },
        ],
      });
      log = " successfully sending help commands....";
    }

    request.post(
      {
        url: "https://api.line.me/v2/bot/message/reply",
        headers: headers,
        body: body,
      },
      (err, res, body) => {
        switch (res.statusCode) {
          case 200:
            console.log("status = " + res.statusCode + log);
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
