const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId, // or mongoose.ObjectId
      ref: "Category", //collection name in mongoose.model('Category', categorySchema)
      required: true,
    },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //collection name in mongoose.model('User', userSchema)
      required: true,
    },

    picture: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    shipping: { type: Boolean},
    amount: { type: Number, default:1},
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = { ProductModel };
