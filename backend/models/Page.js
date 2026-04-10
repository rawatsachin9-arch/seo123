const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
  airline:String,
  keyword:String,
  slug:String,
  title:String,
  meta:String,
  content:String,
  callClicks: { type: Number, default: 0 },
  pageViews:  { type: Number, default: 0 },
  humanViews: { type: Number, default: 0 },
  botViews:   { type: Number, default: 0 },
},{timestamps:true});

module.exports = mongoose.model("Page", PageSchema);
