const mongoose = require("mongoose");

const HealthServiceRatingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    serviceProviderId: {
      type: String,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    rating: {
      type: number,
      max: 5,
    },
    description: {
      type: String,
      max: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "HealthServiceRating",
  HealthServiceRatingSchema
);
