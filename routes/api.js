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
          cru.findStock(stock.toUpperCase()).then((stockObj) => {
            if (!stockObj) {
              cru
                .addStock({
                  stock: stock,
                  price: latestPrice,
                  likes: like == "true" ? 1 : 0,
                })
                .then((stockObj) =>
                  res.json({
                    stockData: {
                      stock: stockObj.stock,
                      price: stockObj.price,
                      likes: stockObj.likes,
                    },
                  })
                )
                .catch((ex) => res.send(ex));
              return;
            }

            if (like == "true" || stockObj.price != latestPrice) {
              let likes = like == "true" ? stockObj.likes + 1 : stockObj.likes;

              cru.updateStock(stockObj._id, likes, latestPrice).then(() =>
                res.json({
                  stockData: {
                    stock: stockObj.stock,
                    price: stockObj.price,
                    likes: stockObj.likes,
                  },
                })
              );
            } else {
              res.json({
                stockData: {
                  stock: stockObj.stock,
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
