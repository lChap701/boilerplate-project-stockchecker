"use strict";
const https = require("https");
const cru = require("../cru");

/**
 * Module that handles most of the routing
 * @module ./routes/api
 *
 * @param {*} app   Represents the Express application
 *
 */
module.exports = function (app) {
  app.route("/api/stock-prices").get((req, res) => {
    const { stock } = req.query;
    const API =
      "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/" +
      stock +
      "/quote";

    // Calls freeCodeCamp's API and gets the price of the stock
    https
      .get(API, (resp) => {
        let data = "";

        resp.on("data", (chunk) => (data += chunk));

        resp.on("end", () => {
          const latestPrice = JSON.parse(data).latestPrice;

          // Checks if stock needs to be created or updated and displays the stock
          cru
            .findStock(stock)
            .then((stockObj) => {
              if (req.query.like) {
                cru
                  .updateStock(stockObj._id, stockObj.likes + 1)
                  .then(() => res.json({ stockData: stockObj }));
              } else {
                res.json({ stockData: stockObj });
              }
            })
            .catch(() =>
              cru
                .addStock({
                  stock: stock,
                  price: latestPrice,
                  likes: req.query.like ? 1 : 0,
                })
                .then((stockObj) => res.json({ stockData: stockObj }))
            );
        });
      })
      .on("error", (err) => res.send(err));
  });
};
