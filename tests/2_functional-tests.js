const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /* My Tests */
  const PATH = "/api/stock-prices";

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
            0,
            "response should return an object with a property of 'likes' that is greater than '0'"
          );
          done();
        });
    });
  });
});
