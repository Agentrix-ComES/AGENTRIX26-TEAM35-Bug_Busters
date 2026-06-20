const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const planRoute = require("./api/plan");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", planRoute);

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
