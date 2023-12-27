import mongoose from "mongoose";

const collection = "carts";

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
                required: true,
            },
            quantity: {
                type: Number,
                require: true,
                default: 1
            }
        }
    ]
});

cartSchema.pre("find", function(){
    this.populate("products.product");
})

const cartsModel = mongoose.model(collection, cartSchema);

export default cartsModel;