const mongoose = require("mongoose");

const SuggestedHealthCareServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    serviceDescription: {
      type: String,
      max: 50,
    },
    approveStatus: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "suggestedHealthCareService",
  SuggestedHealthCareServiceSchema
);
