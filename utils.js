// import dynatrace api client
// https://github.com/dynatrace-esa/dynatrace-api-client
const dynatraceApiClient = require("@dt-esa/dynatrace-api-client");
const { DynatraceTenantAPI } = require("@dt-esa/dynatrace-api-client");
const { application } = require("express");
// import csv handler
const { Parser } = require("json2csv");
// build api client
const apiConfig = require("./apiConfig.json");
const dtAPI = new DynatraceTenantAPI(
  {
    url: apiConfig.tenant,
    token: apiConfig.token,
  },
  false
);
module.exports = {
  // ----------- START SYNTHETICS CLEAN UP ----------- //
  //GET MONITORS
  getListOfMonitorIds: function () {
    console.log("getting list of monitors");
    return new Promise((resolve, reject) => {
      dtAPI.v1.synthetic.getMonitorsCollection().then((data) => {
        let entityListByType = [];
        for (entity of data.monitors) {
          entityListByType.push({ entity: entity.entityId, type: entity.type });
        }
        console.log(entityListByType);
        resolve(entityListByType);
      });
    });
  },
  getSynthAvailability: function (entityListByType) {
    return new Promise((resolve, reject) => {
      let availMeans = [];
      for (entity of entityListByType) {
        if (entity.type == "BROWSER") {
          dtAPI.v2.metrics
            .query({
              metricSelector:
                "builtin:synthetic.browser.availability.location.total:splitBy()",
              resolution: "1M",
              from: "now-90d",
              entitySelector: 'entityId("' + entity.entity + '")',
            })
            .then((timeseries) => {
              let reduceable = timeseries.result[0].data.length > 0;
              if (reduceable) {
                let valueLength = timeseries.result[0].data[0].values.length;
                availMeans.push({
                  entity: entity,
                  avail:
                    timeseries.result[0].data[0].values.reduce(
                      (a, b) => a + b,
                      0
                    ) / valueLength,
                });
              } else {
                availMeans.push({
                  entity: entity,
                  avail: 0,
                });
              }
            });
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
                availMeans.push({
                  entity: entity,
                  avail:
                    timeseries.result[0].data[0].values.reduce(
                      (a, b) => a + b,
                      0
                    ) / valueLength,
                });
              }
            });
        }
      }
      // TO-DO: resolve availMeans asynchronously
      resolve(availMeans);
    });
  },
};
