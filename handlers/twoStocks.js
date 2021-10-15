const https = require("https");
const cru = require("../cru");

/**
 * Module that gets, compares, and displays two stocks
 * @module ./handlers/twoStocks
 *
 * @param {[String]} stocks   Represents the stocks to search for and display
 * @param {String} like       Determines if the user likes a stock
 * @param {String} ip         Represents the user's IP address
 * @param {*} res             Represents the response
 *
 */
module.exports = (stocks, like, ip, res) => {
  let stockData = [];

  /**
   * Compares the two stocks' relative likes
   */
  const compareStocks = () => {
    if (stockData.length == 2) {
      stockData.sort((a, b) => b.rel_likes - a.rel_likes);
      stockData[0].rel_likes = stockData[0].rel_likes - stockData[1].rel_likes;
      stockData[1].rel_likes = stockData[1].rel_likes - stockData[0].rel_likes;

      res.json({ stockData: stockData });
    }
  };

  // Calls freeCodeCamp's API to get the price of each stock
  stocks.forEach((stock) => {
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
                  .then((stockObj) => {
                    stockData.push({
                      stock: stockObj.name,
                      price: stockObj.price,
                      rel_likes: stockObj.likes,
                    });
                    compareStocks();
                  })
                  .catch((ex) => res.send(ex));
                return;
              }

              if (like == "true" || stockObj.price != latestPrice) {
                let { likes, ips } = stockObj;

                if (like == "true" && !ips.includes(ip)) {
                  ips.push(ip);
                  likes++;
                }

                cru
                  .updateStock(stockObj._id, likes, latestPrice, ips)
                  .then(() =>
                    cru.findStock(stockObj.name).then((newStock) => {
                      stockData.push({
                        stock: newStock.name,
                        price: newStock.price,
                        rel_likes: newStock.likes,
                      });
                      compareStocks();
                    })
                  );
              } else {
                stockData.push({
                  stock: stockObj.name,
                  price: stockObj.price,
                  rel_likes: stockObj.likes,
                });
                compareStocks();
              }
            });
          });
        }
      )
      .on("error", (err) => res.send(err));
  });
};
