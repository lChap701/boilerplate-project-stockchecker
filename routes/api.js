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
    const { stock, like } = req.query;

    if (!stock) {
      res.send("No stock was provided");
      return;
    }

    const API = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;

    // Calls freeCodeCamp's API and gets the price of the stock
    https
      .get(API, (resp) => {
        let data = "";

        resp.on("data", (chunk) => (data += chunk));

        resp.on("end", () => {
          const latestPrice = JSON.parse(data).latestPrice;

          // Checks if stock needs to be created or updated and displays the stock
          cru.findStock(stock.toUpperCase()).then((stockObj) => {
            if (!stockObj) {
              let likes = 0;
              let ips = [];

              if (like == "true") {
                ips.push(req.ip);
                likes++;
              }

              cru
                .addStock({
                  name: stock,
                  price: latestPrice,
                  likes: likes,
                  ips: ips,
                })
                .then((stockObj) =>
                  res.json({
                    stockData: {
                      stock: stockObj.name,
                      price: stockObj.price,
                      likes: stockObj.likes,
                    },
                  })
                )
                .catch((ex) => res.send(ex));
              return;
            }

            if (like == "true" || stockObj.price != latestPrice) {
              let likes = stockObj.likes;

              if (like == "true" && !stockObj.ips.includes(req.ip)) {
                stockObj.ips.push(req.ip);
                likes++;
              }

              cru
                .updateStock(stockObj._id, likes, latestPrice, stockObj.ips)
                .then((newStock) =>
                  res.json({
                    stockData: {
                      stock: newStock.name,
                      price: newStock.price,
                      likes: newStock.likes,
                    },
                  })
                );
            } else {
              res.json({
                stockData: {
                  stock: stockObj.name,
                  price: stockObj.price,
                  likes: stockObj.likes,
                },
              });
            }
          });
        });
      })
      .on("error", (err) => res.send(err));
  });
};
