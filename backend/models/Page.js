const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
  airline:String,
  keyword:String,
  slug:String,
  title:String,
  meta:String,
  content:String
},{timestamps:true});

module.exports = mongoose.model("Page", PageSchema);
