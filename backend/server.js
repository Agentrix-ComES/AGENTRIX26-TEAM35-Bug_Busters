require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const planRoute = require("./api/plan");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", planRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
