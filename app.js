// express
const express = require("express");
const app = express();
const port = 3000;
// import utils
const { getListOfMonitorIds, getSynthAvailability } = require("./utils.js");
//EXPORT SYNTHETIC DETAIL CSV
app.get("/spoiledSyntheticsCleanUp", (req, res) => {
  // get query parameters, cause why not
  let params = [];
  for (const [key, value] of Object.entries(req.query)) {
    params.push({ label: `${key}`, value: `${value}` });
  }
  // get list of synthetics
  getListOfMonitorIds().then((entityListByType) => {
    // iterate through synthetics and get availability timeseries for last 30 days
    getSynthAvailability(entityListByType).then((availMeans) => {
      // disable list
      console.log("availMeans \n" + availMeans);
    });
  });
});

//TEST API
app.get("/testclient", (req, res) => {
  console.log("testing api token and connectivity");

  testToken().then((data) => {
    if (data.scopes && data.scopes.length > 0 && data.enabled) {
      console.log(
        "API CONNECTION SUCCESSFUL: " + JSON.stringify(data, null, 2)
      );
      res.send("API CONNECTION SUCCESSFUL: " + JSON.stringify(data, null, 2));
    }

    if (data.status && data.status == 404) {
      console.log("TOKEN INVALID: " + data.message);
      res.send("TOKEN INVALID: " + data.message);
    }

    if (data.status && data.status !== 404 && data.message) {
      console.log("API ACCESS PROBLEM: " + data.message);
      res.send("API ACCESS PROBLEM: " + data.message);
    }
  });
});

//START SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
