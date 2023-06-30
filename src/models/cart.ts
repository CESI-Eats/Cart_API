import mongoose from 'mongoose';

// Define schema for myModel

const cartSchema = new mongoose.Schema({
  _idUser: {
    type: String,
    required: true
  },
  _idRestorer: {
    type: String,
    required: false
  },
  menus: {
    type: [String],
    required: false
  },
  price: {
    type: Number,
    required: false
  }
});

// Export model
export default mongoose.model('Cart', cartSchema);
