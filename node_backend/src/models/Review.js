import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name:  { type: String, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: '', maxlength: 1000 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// One review per user per product
ReviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

ReviewSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Review', ReviewSchema);
