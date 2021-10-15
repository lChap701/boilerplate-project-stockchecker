require("dotenv").config();
const mongoose = require("mongoose");

// Connects to database
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema
const Schema = mongoose.Schema;
const stockSchema = new Schema({
  name: { type: String, uppercase: true, trim: true, required: true },
  price: Number,
  likes: { type: Number, default: 0 },
  ips: [String],
});

// Model
const Stocks = mongoose.model("Stocks", stockSchema);

/**
 * Module for running create, read, and update operations once connected to the DB
 * @module ./cru
 *
 */
const cru = {
  addStock: (data) => new Stocks(data).save(),
  findStock: (stock) => Stocks.findOne({ name: stock }),
  updateStock: (_id, likes, price, ips) =>
    Stocks.updateOne({ _id: _id }, { likes: likes, price: price, ips: ips }),
};

module.exports = cru;
