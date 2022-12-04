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
      // TODO: DELETE or disable monitors
      Promise.all(iterable).then((availData) => {
        availData.forEach((monitor) => {
          if (monitor.avail == 0) {
            //do delete call
            console.log("Deleting monitor: ", monitor.entity);
          }
        });
      });
    });
  });
});

//START SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
