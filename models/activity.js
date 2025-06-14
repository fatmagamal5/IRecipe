import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ActivitySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Activity = model('Activity', ActivitySchema);

export default Activity; 