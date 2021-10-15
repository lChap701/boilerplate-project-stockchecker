"use strict";
const oneStock = require("../handlers/oneStock");
const twoStocks = require("../handlers/twoStocks");

/**
 * Module that handles most of the routing
 * @module ./routes/api
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = function (app) {
  app.route("/api/stock-prices").get((req, res) => {
    const { stock, like } = req.query;

    if (!stock) {
      res.send("Missing a stock symbol");
      return;
    }

    if (Array.isArray(stock)) {
      twoStocks(stock, like, req.ip, res);
    } else {
      oneStock(stock, like, req.ip, res);
    }
  });
};
