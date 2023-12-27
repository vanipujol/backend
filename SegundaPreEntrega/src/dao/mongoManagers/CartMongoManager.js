import cartsModel from "../models/carts.model.js";
import productsModel from "../models/products.model.js";
import {ProductManagerMongo} from "./ProductMongoManager.js";

const productsManager = new ProductManagerMongo();

class CartManagerMongo {
    /**
     * Retrieves all carts from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of carts.
     */
    getCarts = async () => {
        return await cartsModel.find();
    };

    /**
     * Adds a new cart to the database.
     * @returns {Promise<Object>} A promise that resolves to the created cart.
     */
    createCart = async body => {
        return await cartsModel.create();
    };

    /**
     * Retrieves a cart by its ID.
     * @param {string} id - The ID of the cart to retrieve.
     * @returns {Promise<Object>} A promise that resolves to the retrieved cart.
     */
    async getCartById(id) {
        return await cartsModel.find({_id: id});
    }

    async addProductToCart(cartId, productId, quantity) {
        const cart = await cartsModel.findOne({_id:cartId});
        if (!cart){
            return {
                status: "error",
                msg: `El carrito con el id ${cartId} no existe`
            }
        }
        const product = await productsModel.findOne({_id:productId});
        if (!product){
            return {
                status: "error",
                msg: `El producto con el id ${productId} no existe`
            }
        }
        let productsToCart = carts.product;

        const indexProduct = productsToCart.findIndex((product)=> product.product === productId );

        if(indexProduct === -1){
            const newProduct = {
                product: productId,
                quantity: quantity
            }
            carts.product.push(newProduct);
        }else{
            carts.product[indexProduct].quantity += quantity;
        }

        await cart.save();

        return cart;
    }
}

export {CartManagerMongo};
