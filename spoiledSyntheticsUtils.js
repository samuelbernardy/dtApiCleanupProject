// import dynatrace api client
// https://github.com/dynatrace-esa/dynatrace-api-client
const dynatraceApiClient = require("@dt-esa/dynatrace-api-client");
const { DynatraceTenantAPI } = require("@dt-esa/dynatrace-api-client");
// build api client
const apiConfig = require("./apiConfig.json");
const dtAPI = new DynatraceTenantAPI(
  {
    url: apiConfig.tenant,
    token: apiConfig.token,
  },
  false
);
// GET availability metrics and average them for each monitor
function getSynthAvailability(entity) {
  console.log("getting availability metrics for " + entity.entity);
  return new Promise((resolve, reject) => {
    let availMean = [];
    if (entity.type == "BROWSER") {
      // call /metrics endpoint
      dtAPI.v2.metrics
        .query({
          metricSelector:
            "builtin:synthetic.browser.availability.location.total:splitBy()",
          resolution: "1M",
          from: "now-90d",
          entitySelector: 'entityId("' + entity.entity + '")',
        })
        // reduce results to averages
        .then((timeseries) => {
          let reduceable = timeseries.result[0].data.length > 0;
          if (reduceable) {
            let valueLength = timeseries.result[0].data[0].values.length;
            availMean = {
              entity: entity,
              avail:
                timeseries.result[0].data[0].values.reduce((a, b) => a + b, 0) /
                valueLength,
            };
          } else {
            availMean = {
              entity: entity,
              avail: 0,
            };
          }
          resolve(availMean);
        });

      // for HTTP monitors, all else is same
    } else if (entity.type == "HTTP") {
      dtAPI.v2.metrics
        .query({
          metricSelector:
            "builtin:synthetic.http.availability.location.total:splitBy()",
          resolution: "1M",
          from: "now-90d",
          entitySelector: 'entityId("' + entity.entity + '")',
        })
        .then((timeseries) => {
          let reduceable = timeseries.result[0].data.length > 0;
          if (reduceable) {
            let valueLength = timeseries.result[0].data[0].values.length;
            availMean = {
              entity: entity,
              avail:
                timeseries.result[0].data[0].values.reduce((a, b) => a + b, 0) /
                valueLength,
            };
          } else {
            availMean = {
              entity: entity,
              avail: 0,
            };
          }
          resolve(availMean);
        });
    }
    // TO-DO: resolve availMean asynchronously
  });
}
module.exports = {
  //Disable Monitor
  getMonitor: function (entityId) {
    return newPromise((resolve, reject) => {
      dtAPI.v1.synthetic.getMonitor(entityId).then((data) => {
        resolve(data);
      });
    });
  },
  disableMonitor: function (data) {
    data.enabled = false;
    return newPromise((resolve, reject) => {
      dtAPI.v1.synthetic.replaceMonitor(data).then(() => {
        resolve("disabled");
      });
    });
  },

  //GET monitor list
  getListByType: function () {
    console.log("getting list of monitors");
    return new Promise((resolve, reject) => {
      dtAPI.v1.synthetic.getMonitorsCollection().then((data) => {
        let entityListByType = [];
        for (entity of data.monitors) {
          entityListByType.push({ entity: entity.entityId, type: entity.type });
        }
        console.log(entityListByType);

        // passback list of entityIds and their types
        resolve(entityListByType);
      });
    });
  },
  // build promise iterable
  buildIterable: function (list) {
    return new Promise((resolve, reject) => {
      console.log("building promise array");
      let availabilityCalls = [];
      list.forEach((entity) => {
        availabilityCalls.push(getSynthAvailability(entity));
      });
      resolve(availabilityCalls);
    });
  },
};
