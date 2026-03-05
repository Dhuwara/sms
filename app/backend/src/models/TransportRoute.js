import mongoose from 'mongoose';

const transportRouteSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true, unique: true },
  driverName: { type: String },
  driverContact: { type: String },
  vehicleNumber: { type: String },
  capacity: { type: Number, default: 40 },
  stops: [{
    name: { type: String },
    pickupTime: { type: String },
    dropTime: { type: String },
  }],
  monthlyFee: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('TransportRoute', transportRouteSchema);
