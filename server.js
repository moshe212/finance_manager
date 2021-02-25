const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const server = http.createServer(app);
const {
  getPrevCreditCardSheetData,
  getCurrCreditCardSheetData,
  getBanksSheetData,
  Prev_ExpencesCompareData,
  Curr_ExpencesCompareData,
} = require("./googleData_Function");

dotenv.config();
app.use(bodyParser.json());

app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "Client/build")));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.get("/api/sheet", async (req, res) => {
  console.log(1);

  const PrevCreditCardDataForClient = await getPrevCreditCardSheetData();
  const CurrCreditCardDataForClient = await getCurrCreditCardSheetData();
  const BanksDataForClient = await getBanksSheetData(["BankIgud", "BankLeumi"]);

  const PrevExpenc_IncomePerMonthData = await Prev_ExpencesCompareData(
    BanksDataForClient
  );

  const CurrExpenc_IncomePerMonthData = await Curr_ExpencesCompareData(
    BanksDataForClient,
    CurrCreditCardDataForClient
  );

  const Totals_ExpencesIncomPerMonth = PrevExpenc_IncomePerMonthData[0].concat(
    CurrExpenc_IncomePerMonthData[0]
  );

  DataForClient = [
    PrevCreditCardDataForClient,
    CurrCreditCardDataForClient,
    BanksDataForClient,
    PrevExpenc_IncomePerMonthData,
    CurrExpenc_IncomePerMonthData,
    Totals_ExpencesIncomPerMonth,
  ];
  res.status(200).send(DataForClient);
});

app.get("*", (req, res) => {
  console.log(1);
  res.sendFile(path.join(__dirname + "/Client/build/index.html"));
});

// connectToDB().then(() => {
server.listen(port, () => {
  console.log("Example app listening on port " + port);
});
// });
