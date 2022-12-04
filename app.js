// express
const express = require("express");
const app = express();
const port = 3000;
// import utils
const { getListByType, buildIterable } = require("./spoiledSyntheticsUtils.js");

// DISABLE SPOILED SYNTHETICS (UNAVAILABLE FOR 90 DAYS)
app.get("/spoiledSyntheticsCleanUp", (req, res) => {
  // get query parameters, cause why not, maybe we'll use them later
  let params = [];
  for (const [key, value] of Object.entries(req.query)) {
    params.push({ label: `${key}`, value: `${value}` });
  }

  // GET list of synthetics
  getListByType().then((entityListByType) => {
    // GET average avilaiblity metrics for 90 days
    buildIterable(entityListByType).then((iterable) => {
      Promise.all(iterable).then((availData) => {
        console.log("Returned monitors: " + availData.length + " found");
        let spoiledMonitors = availData.filter((avail) => avail.avail == 0);
        console.log(
          "Deleting spoiled monitors: ",
          spoiledMonitors.length + " in queue"
        );
        spoiledMonitors.forEach((monitor) => {
          // TODO: DELETE or disable monitors
        });
      });
    });
  });
});

//START SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
