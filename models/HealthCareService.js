const mongoose = require("mongoose");

const HealthCareServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    serviceDescription: {
      type: String,
      max: 50,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthCareService", HealthCareServiceSchema);
