import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  product: { type: String, default: '' },
  quantity: { type: Number, required: true },
  price_at_time: { type: Number, required: true },
  weight: { type: String, default: '' },
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  name:     { type: String, default: '' },
  phone:    { type: String, default: '' },
  email:    { type: String, default: '' },
  address:  { type: String, default: '' },
  city:     { type: String, default: '' },
  state:    { type: String, default: '' },
  pincode:  { type: String, default: '' },
  lat:      { type: Number, default: null },
  lng:      { type: Number, default: null },
  maps_link: { type: String, default: '' },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone_number:      { type: String, default: '', index: true },
  status:            { type: String, default: 'Pending' },
  total_amount:      { type: Number, default: 0 },
  shipping:          { type: Number, default: 0 },
  payment_mode:      { type: String, default: 'COD' },
  payment_proof_url: { type: String, default: '' },
  notes:             { type: String, default: '' },
  customer:          { type: CustomerSchema, default: () => ({}) },
  items:             { type: [OrderItemSchema], default: [] },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

OrderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Order', OrderSchema);
