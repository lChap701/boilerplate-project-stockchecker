const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /* My Tests */
  const PATH = "/api/stock-prices";
  let likes = 0;

  suite("One Stock Tests", () => {
    test("1)  Get Stock (without Likes)", (done) => {
      chai
        .request(server)
        .get(PATH + "?stock=GOOG")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.deepPropertyVal(
            JSON.parse(res.text).stockData,
            "stock",
            "GOOG",
            "response should return an object with a property of 'stock' that equals 'GOOG'"
          );
          done();
        });
    });

    test("2)  Get Stock with Likes", (done) => {
      chai
        .request(server)
        .get(PATH + "?stock=GOOG&like=true")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.notDeepEqual(
            JSON.parse(res.text).stockData.likes,
            likes,
            `response should return an object with a property of 'likes' that is greater than '${likes}'`
          );
          likes = JSON.parse(res.text).stockData.likes;
          done();
        });
    });

    test("3)  Get the Same Stock with Likes", (done) => {
      chai
        .request(server)
        .get(PATH + "?stock=goog&like=true")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.equal(
            JSON.parse(res.text).stockData.likes,
            likes,
            `response should return an object with a property of 'likes' that equals '${likes}'`
          );
          done();
        });
    });
  });

  suite("Compare Two Stocks Tests", () => {
    test("1)  Compare Stocks (without Likes)", (done) => {
      chai
        .request(server)
        .get(PATH + "?stock=GOOG&stock=MSFt")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.isArray(JSON.parse(res.text).stockData);
          assert.deepPropertyVal(
            JSON.parse(res.text).stockData[0],
            "stock",
            "GOOG",
            "response should return an array containing an object with a property of 'stock' that equals 'GOOG'"
          );
          assert.deepPropertyVal(
            JSON.parse(res.text).stockData[1],
            "stock",
            "MSFT",
            "response should return an array containing an object with a property of 'stock' that equals 'MSFT'"
          );
          likes = JSON.parse(res.text).stockData[1].rel_likes;
          done();
        });
    });

    test("2)  Compare Stocks (with Likes)", (done) => {
      chai
        .request(server)
        .get(PATH + "?stock=GOOG&stock=MSFT&like=true")
        .end((err, res) => {
          assert.equal(res.status, 200, "response status should be 200");
          assert.notEqual(
            JSON.parse(res.text).stockData[1].rel_likes,
            likes,
            "response should return an array containing an object with a property of 'rel_likes' that is greater than '-1'"
          );
          done();
        });
    });
  });
});
