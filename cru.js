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
  stock: String,
  price: Number,
  likes: Number,
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
  findStock: (stock) => Stocks.findOne({ stock: stock }),
  updateStock: (_id, likes) => Stocks.updateOne({ _id: _id }, { likes: likes }),
};

module.exports = cru;
