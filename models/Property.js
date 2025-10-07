const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
   },
   description: {
    type: String,
    required: true
   },
   price: {
    type: Number,
    required: true
   },
   location: {
    type: String,
    required: true
   },
   images: {
    type: [String], 
    required: true
},
  videos: [String],
  owner: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     required: true 
    }
},
{ timestamps: true }
);

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
