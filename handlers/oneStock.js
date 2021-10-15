const https = require("https");
const cru = require("../cru");

/**
 * Module that gets and displays one stock
 * @module ./handlers/oneStock
 *
 * @param {String} stock  Represents the stock to search for and display
 * @param {String} like   Determines if the user likes a stock
 * @param {String} ip     Represents the user's IP address
 * @param {*} res         Represents the response
 *
 */
module.exports = (stock, like, ip, res) => {
  // Calls freeCodeCamp's API to get the price of the stock
  https
    .get(
      `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`,
      (resp) => {
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
                ips.push(ip);
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
              let { likes, ips } = stockObj;

              if (like == "true" && !ips.includes(ip)) {
                ips.push(ip);
                likes++;
              }

              cru.updateStock(stockObj._id, likes, latestPrice, ips).then(() =>
                cru.findStock(stockObj.name).then((newStock) =>
                  res.json({
                    stockData: {
                      stock: newStock.name,
                      price: newStock.price,
                      likes: newStock.likes,
                    },
                  })
                )
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
      }
    )
    .on("error", (err) => res.send(err));
};
