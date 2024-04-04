import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    slug: { type: String, required: true, unique: true },
    store: { type: String, required: false },
    value: { type: Number, default: 0, required: false },
    paymentType: { type: String, required: false },
    typeOfPurchase: { type: String, required: false },
    notes: { type: String, required: false },
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
