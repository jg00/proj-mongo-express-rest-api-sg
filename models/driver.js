const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
  To calculate geometry over an Earth-like sphere, store your location data as GeoJSON objects.
  2dsphere indexes support queries that calculate geometries on an earth-like sphere.
  2d indexes support queries that calculate geometries on a two-dimensional plane. 
  In other words there needs to be an index created - geometry.coordinates of '2dsphere'
*/
const PointSchema = new Schema({
  type: {
    type: String,
    default: "Point",
  },
  coordinates: {
    type: [Number],
    index: "2dsphere", // Define index of '2dsphere' placed on the coordinates (Mongo requirement for geography queries).
  },
});

const DriverSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  driving: {
    type: Boolean,
    default: false,
  },
  geometry: PointSchema,
});

const Driver = mongoose.model("driver", DriverSchema);

module.exports = Driver;
