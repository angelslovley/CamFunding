const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

require("dotenv").config();
const PORT = 4000;
const routes = require("./routes");

app.use(cors());
app.use(bodyParser.json());


app.use("/api/campaign", routes.campaign);
app.use("/api/user", routes.user);
app.use("/api/donate", routes.payment);
app.use("/api/donation", routes.donation);
app.use("/api/query", routes.query);

app.get("*", function (req, res) {
  res.send("404 Error");
});

app.listen(PORT, function () {
  console.log("Server running successfully");
});
