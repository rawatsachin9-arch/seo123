const mongoose = require("mongoose");

const GeoVisitSchema = new mongoose.Schema({
  slug:    { type: String, index: true },
  country: String,
  city:    String,
  region:  String,
  ip:      String,
}, { timestamps: true });

module.exports = mongoose.model("GeoVisit", GeoVisitSchema);
