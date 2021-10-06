const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
app.post("/webhook", (req, res) => res.sendStatus(200));
app.listen(port);
