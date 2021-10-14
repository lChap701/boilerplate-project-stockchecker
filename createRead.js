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
  likes: { type: Number, default: 0 },
});

// Model
const Stocks = mongoose.model("Stocks", stockSchema);

/**
 * Module for running cread and read operations once connected to the DB
 * @module ./createRead
 *
 */
const createRead = {
  addStock: (data) => new Stocks(data).save(),
  findStock: (stock) => Stocks.findOne({ stock: stock }),
};

module.exports = createRead;
