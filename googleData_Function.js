const { GoogleSpreadsheet } = require("google-spreadsheet");
const moment = require("moment"); // require

//Get Data from googlesheet CreditCard
const creatCreditRow = (rows, i) => {
  let myPromise = new Promise((resolve, reject) => {
    const ID = rows[i]._rawData[0];
    const fourNum = rows[i]._rawData[1];
    const transDate = rows[i]._rawData[2];
    const transAmount = rows[i]._rawData[3];
    const chargeDate = rows[i]._rawData[4];
    const bizName = rows[i]._rawData[5];
    const chargeAmount = rows[i]._rawData[6];
    const Notes = rows[i]._rawData[7];
    const Tag = rows[i]._rawData[8];
    const chargeMonth = rows[i]._rawData[9];

    const row = {
      ID: ID,
      FourNum: fourNum,
      TransDate: transDate,
      TransAmount: transAmount,
      ChargeDate: chargeDate,
      BizName: bizName,
      ChargeAmount: chargeAmount,
      Notes: Notes,
      Tag: Tag,
      ChargeMonth: chargeMonth,
    };
    // console.log(row);
    resolve(row);
  });
  return myPromise;
};

const getPrevCreditCardSheetData = async () => {
  const creds = require("./config/CreditTransaction-d9fe1ef7e128.json");
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(
    "1HqU_lKtYC40AB0gYbq60uoW3ZltmUuINZ22oJSLjRTY"
  );

  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo(); // loads document properties and worksheets
  //   console.log(doc.title);
  //   await doc.updateProperties({ title: "renamed doc" });
  const promises = [];
  for (let i = 1; i < 6; i++) {
    // const sheet = doc.sheetsByIndex[i]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title
    const Title = "Prev" + i;
    const sheet = doc.sheetsByTitle[Title]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

    if (sheet) {
      console.log(sheet.title);
      const rows = await sheet.getRows(); // can pass in { limit, offset }

      for (let i = 0; i < rows.length; i++) {
        promises.push(creatCreditRow(rows, i));
      }
    }
  }
  const PrevCreditData = Promise.all(promises);
  return PrevCreditData;
};

const getCurrCreditCardSheetData = async () => {
  const creds = require("./config/CreditTransaction-d9fe1ef7e128.json");
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(
    "1HqU_lKtYC40AB0gYbq60uoW3ZltmUuINZ22oJSLjRTY"
  );

  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo(); // loads document properties and worksheets
  //   console.log(doc.title);
  //   await doc.updateProperties({ title: "renamed doc" });

  const promises2 = [];
  for (let i = 1; i < 6; i++) {
    // const sheet = doc.sheetsByIndex[i]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title
    const Title = "Current" + i;
    const sheet = doc.sheetsByTitle[Title]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

    if (sheet) {
      console.log(sheet.title);
      const rows = await sheet.getRows(); // can pass in { limit, offset }

      for (let i = 0; i < rows.length; i++) {
        promises2.push(creatCreditRow(rows, i));
      }
    }
  }

  const CurrCreditData = Promise.all(promises2);
  return CurrCreditData;
};

//Get Data from googlesheet Banks
const creatBankRow = (rows, i) => {
  let myPromise = new Promise((resolve, reject) => {
    const Date = rows[i]._rawData[0];
    const BizName = rows[i]._rawData[1];
    const Minus = rows[i]._rawData[2];
    const Plus = rows[i]._rawData[3];
    const Balance = rows[i]._rawData[4];
    const AcountNum = rows[i]._rawData[5];
    const BankName = rows[i]._rawData[6];

    const row = {
      Date: Date,
      BizName: BizName,
      Minus: Minus,
      Plus: Plus,
      Balance: Balance,
      AcountNum: AcountNum,
      BankName: BankName,
    };
    // console.log(row);
    resolve(row);
  });
  return myPromise;
};

const getBanksSheetData = async (BankNames) => {
  const creds = require("./config/CreditTransaction-d9fe1ef7e128.json");
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(
    "1HqU_lKtYC40AB0gYbq60uoW3ZltmUuINZ22oJSLjRTY"
  );

  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo(); // loads document properties and worksheets
  //   console.log(doc.title);
  //   await doc.updateProperties({ title: "renamed doc" });
  const promises = [];
  for (let i = 0; i < BankNames.length; i++) {
    const sheet = doc.sheetsByTitle[BankNames[i]]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

    if (sheet) {
      const rows = await sheet.getRows(); // can pass in { limit, offset }

      for (let i = 0; i < rows.length; i++) {
        promises.push(creatBankRow(rows, i));
      }
    }
  }
  const result = Promise.all(promises);
  return result;
};

const BankDataRow = (row, Income, M, Y) => {
  // console.log(row);
  let myPromise = new Promise((resolve, reject) => {
    const newRow = {
      Acc_ID: row.BankName,
      ChargeMonth: M,
      ChargeYear: Y,
      ChargeAmount: Income ? row.Plus : row.Minus,
    };
    // console.log(row, newRow, row.Minus.length);
    resolve(newRow);
  });
  return myPromise;
};

const Prev_ExpencesCompareData = async (BanksData, CreditCardData) => {
  // const BanksData = await getBanksSheetData(["BankIgud", "BankLeumi"]);
  // const CreditCardData = await getCreditCardSheetData();

  const GetArrayMonthes = () => {
    const months = [];
    const dateStart = moment().add(-12, "month");
    const dateEnd = moment();
    while (dateEnd.diff(dateStart, "months") >= 0 && dateStart <= dateEnd) {
      months.push(dateStart.format("M") + "/" + dateStart.format("Y"));
      dateStart.add(1, "month");
    }
    return months;
  };
  const MonthesArray = GetArrayMonthes();
  console.log("monthes", MonthesArray);

  let ExpensePerMonth = [];
  let IncomePerMonth = [];
  for (let i = 0; i < MonthesArray.length; i++) {
    const promises = [];
    const promises2 = [];

    const M = parseInt(MonthesArray[i].split("/")[0]);
    const Y = parseInt(MonthesArray[i].split("/")[1]);

    for (let A = 0; A < BanksData.length; A++) {
      if (BanksData[A].Date) {
        const basicDateCheck = BanksData[A].Date.split("/");
        const dateTo = new Date(new Date().setDate(10));
        const dateFrom = new Date(
          new Date(
            new Date(new Date().setFullYear(dateTo.getFullYear() - 1)).setMonth(
              dateTo.getMonth() != 0 ? dateTo.getMonth() - 1 : 12
            )
          ).setDate(11)
        );
        // console.log(dateTo.getMonth(), dateFrom.getMonth());
        const dateCheck = new Date(
          basicDateCheck[1] +
            "/" +
            basicDateCheck[0] +
            "/20" +
            basicDateCheck[2]
        );
        // console.log(dateCheck, dateFrom, dateTo);
        if (
          dateCheck > dateFrom &&
          dateCheck < dateTo &&
          BanksData[A].Plus.length > 1 &&
          ((parseInt(BanksData[A].Date.substring(3, 5)) === M &&
            parseInt("20" + BanksData[A].Date.substring(6, 8)) === Y &&
            parseInt(BanksData[A].Date.substring(0, 3)) < 11) ||
            (parseInt(BanksData[A].Date.substring(3, 5)) === M - 1 &&
              parseInt("20" + BanksData[A].Date.substring(6, 8)) === Y &&
              parseInt(BanksData[A].Date.substring(0, 3)) > 10) ||
            (MonthesArray[i].split("/")[0] === 1 &&
              parseInt(BanksData[A].Date.substring(3, 5)) === 12 &&
              parseInt("20" + BanksData[A].Date.substring(6, 8)) === Y - 1 &&
              parseInt(BanksData[A].Date.substring(0, 3)) > 10))
        ) {
          // console.log(
          //   BanksData[A],
          //   M,
          //   Y,
          //   parseInt(BanksData[A].Date.substring(3, 5)),
          //   parseInt("20" + BanksData[A].Date.substring(6, 8)),
          //   parseInt(BanksData[A].Date.substring(0, 3))
          // );
          const row = BanksData[A];
          promises2.push(BankDataRow(row, true, M, Y));
        }
      }
    }

    for (let B = 0; B < BanksData.length; B++) {
      if (BanksData[B].Date) {
        const basicDateCheck = BanksData[B].Date.split("/");
        const dateTo = new Date(new Date().setDate(10));
        const dateFrom = new Date(
          new Date(
            new Date(new Date().setFullYear(dateTo.getFullYear() - 1)).setMonth(
              dateTo.getMonth() - 1
            )
          ).setDate(11)
        );
        const dateCheck = new Date(
          basicDateCheck[1] +
            "/" +
            basicDateCheck[0] +
            "/20" +
            basicDateCheck[2]
        );
        // console.log(dateCheck, dateFrom, dateTo);
        if (
          dateCheck > dateFrom &&
          dateCheck < dateTo &&
          BanksData[B].Minus.length > 1 &&
          ((parseInt(BanksData[B].Date.substring(3, 5)) === M &&
            parseInt("20" + BanksData[B].Date.substring(6, 8)) === Y &&
            parseInt(BanksData[B].Date.substring(0, 3)) < 11) ||
            (parseInt(BanksData[B].Date.substring(3, 5)) === M - 1 &&
              parseInt("20" + BanksData[B].Date.substring(6, 8)) === Y &&
              parseInt(BanksData[B].Date.substring(0, 3)) > 10) ||
            (MonthesArray[i].split("/")[0] === 1 &&
              parseInt(BanksData[B].Date.substring(3, 5)) === 12 &&
              parseInt("20" + BanksData[B].Date.substring(6, 8)) === Y - 1 &&
              parseInt(BanksData[B].Date.substring(0, 3)) > 10))
        ) {
          // console.log(BanksData[B], BanksData[B].Minus.length);
          const row = BanksData[B];
          promises.push(BankDataRow(row, false, M, Y));
        }
      }
    }

    const result = await Promise.all(promises);
    const result2 = await Promise.all(promises2);
    ExpensePerMonth.push(result);
    IncomePerMonth.push(result2);
  }

  let Totals = [];
  for (let a = 0; a < ExpensePerMonth.length; a++) {
    const getSum = (total, num) =>
      total + parseFloat(num.ChargeAmount.replace(",", ""));
    // console.log(ExpensePerMonth[a][0]);
    const TotalExp = ExpensePerMonth[a].reduce(getSum, 0);
    const TotalInc = IncomePerMonth[a].reduce(getSum, 0);
    const Month =
      ExpensePerMonth[a][0].ChargeMonth > 0
        ? ExpensePerMonth[a][0].ChargeMonth +
          "/" +
          ExpensePerMonth[a][0].ChargeYear
        : "";
    const TotalPerMonth = {
      Total_Expenc: parseInt(TotalExp.toFixed(2)),
      Total_Incom: parseInt(TotalInc.toFixed(2)),
      Month: Month,
    };
    Totals.push(TotalPerMonth);
  }
  console.log("Totals", Totals);

  // console.log(CreditPerMonth);
  return [Totals, ExpensePerMonth, IncomePerMonth];
};

const Curr_ExpencesCompareData = async (BanksData, CreditCardData) => {
  const Year = parseInt(new Date().getFullYear());
  const Month = parseInt(new Date().getMonth()) + 1;
  const Day = parseInt(new Date().getDate());
  const promises = [];
  const promises2 = [];

  for (let A = 0; A < BanksData.length; A++) {
    if (BanksData[A].Date) {
      if (
        BanksData[A].Plus.length > 1 &&
        ((Day > 10 &&
          Day <= 31 &&
          parseInt(BanksData[A].Date.substring(3, 5)) === Month &&
          parseInt("20" + BanksData[A].Date.substring(6, 8)) === Year &&
          parseInt(BanksData[A].Date.substring(0, 3)) > 10) ||
          (Day < 10 &&
            parseInt(BanksData[A].Date.substring(3, 5)) === Month &&
            parseInt("20" + BanksData[A].Date.substring(6, 8)) === Year &&
            parseInt(BanksData[A].Date.substring(0, 3)) < 10))
      ) {
        const row = BanksData[A];
        promises2.push(BankDataRow(row, true, Month, Year));
      }
    }
  }

  for (let B = 0; B < BanksData.length; B++) {
    if (BanksData[B].Date) {
      if (
        BanksData[B].Minus.length > 1 &&
        ((Day > 10 &&
          Day <= 31 &&
          parseInt(BanksData[B].Date.substring(3, 5)) === Month &&
          parseInt("20" + BanksData[B].Date.substring(6, 8)) === Year &&
          parseInt(BanksData[B].Date.substring(0, 3)) > 10) ||
          (Day < 10 &&
            parseInt(BanksData[B].Date.substring(3, 5)) === Month &&
            parseInt("20" + BanksData[B].Date.substring(6, 8)) === Year &&
            parseInt(BanksData[B].Date.substring(0, 3)) < 10))
      ) {
        const row = BanksData[B];
        promises.push(BankDataRow(row, false, Month, Year));
      }
    }
  }

  let CreditRows = CreditCardData.map((row, rowIndex) => {
    // console.log(row);
    if (row.TransDate) {
      let creditRow = {
        Acc_ID: row.FourNum,
        ChargeMonth: Month,
        ChargeYear: Year,
        ChargeAmount: row.ChargeAmount.split(" ")[1],
      };
      return creditRow;
    }
  });

  const BankExpens = await Promise.all(promises);
  const BankIncoms = await Promise.all(promises2);

  const CurrExpences = BankExpens.concat(CreditRows);
  const CurrIncom = BankIncoms;
  // console.log(CurrExpences);
  const getSum = (total, num) => {
    if (num) {
      return total + parseFloat(num.ChargeAmount);
    } else return total;
  };

  const ExpencTotal = CurrExpences.reduce(getSum, 0);
  const IncomTotal = CurrIncom.reduce(getSum, 0);

  const CurrTotal = {
    Total_Expenc: parseInt(ExpencTotal.toFixed(2)),
    Total_Incom: parseInt(IncomTotal.toFixed(2)),
    Month: Day > 10 ? Month + 1 + "/" + Year : Month + "/" + Year,
  };
  console.log(CurrTotal);
  return [CurrTotal, BankExpens, BankIncoms, CreditRows];
};

module.exports = {
  getPrevCreditCardSheetData,
  getCurrCreditCardSheetData,
  getBanksSheetData,
  Prev_ExpencesCompareData,
  Curr_ExpencesCompareData,
};
