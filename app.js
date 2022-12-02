// express
const express = require("express");
const app = express();
const port = 3000;
// import utils
const { getListOfMonitorIds, getSynthAvailability } = require("./utils.js");

// DISABLE SPOILED SYNTHETICS (UNAVAILABLE FOR 90 DAYS)
app.get("/spoiledSyntheticsCleanUp", (req, res) => {
  // get query parameters, cause why not, maybe we'll use them later
  let params = [];
  for (const [key, value] of Object.entries(req.query)) {
    params.push({ label: `${key}`, value: `${value}` });
  }

  // GET list of synthetics
  getListOfMonitorIds().then((entityListByType) => {
    // GET average avilaiblity metrics for 90 days
    getSynthAvailability(entityListByType).then((availMeans) => {
      console.log("availMeans \n" + availMeans);

      // TODO: DELETE or disable monitors
    });
  });
});

//START SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
