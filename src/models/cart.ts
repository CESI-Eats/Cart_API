import mongoose from 'mongoose';

// Define schema for myModel
const menuSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  menus: {
    type: [menuSchema],
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

// Export model
export default mongoose.model('Cart', cartSchema);
