import {Users} from "./UserManager.js";
import {CartManagerMongo} from "./CartMongoManager.js";
import {ProductManagerMongo} from "./ProductMongoManager.js";
import ticketsModel from "../models/ticketsModel.js";

const Product = new ProductManagerMongo();
const Cart = new CartManagerMongo();
const User = new Users();

export class TicketManagerMongo {
    async getTicket(email) {
        try {
            const ticket = await ticketsModel.findOne({purchaser: email}).lean();

            if (!ticket) {
                return "Ticket no encontrado";
            }

            console.log("......", ticket.purchase_datetime)
            ticket.purchase_datetime = ticket.purchase_datetime.split(' ');

            return ticket;

        } catch (error) {
            console.error('Error al obtener el ticket');
        }
    }

    async updateProductsStock(products) {
        for (const item of products) {

            const productID = await Product.getProductById(item.product._id);

            let stockUpdate = productID[0].stock - item.quantity;

            await Product.updateProduct(productID[0]._id, {stock: stockUpdate});
        }
    }

    async calculateAmount(arrayProducts) {
        let totalAmount = 0;

        for (const item of arrayProducts) {

            let amountProducts = item.quantity;

            let isStock = await Product.isInStock(amountProducts, item.product.id);

            if (isStock) {
                const product = await Product.getProductById(item.product.id);

                totalAmount += product[0].price * item.quantity;
            }
        }

        return parseFloat(totalAmount);
    }

    async purchesedProducts(cartId, arrayProducts) {
        try {
            let productsNotStock = [];
            let productsInStock = [];

            for (const item of arrayProducts) {
                let amountProducts = item.quantity;

                let isStock = await Product.isInStock(amountProducts, item.product.id);

                if (isStock) {
                    productsInStock.push(item);

                    await Cart.removeProductFromCart(cartId, item.product.id);

                } else {
                    productsNotStock.push({
                        id: item.product.id
                    });
                }
            }

            return {
                productsNotStock,
                productsInStock
            };

        } catch (error) {
            console.log(error.message);
        }
    }

    async createTicket(cartId) {
        try {

            const user = await User.getUser({cart: cartId});
            const cart = await Cart.getCartById(cartId);

            if (!user) {
                return "Usuario no encontrado";
            }

            if (!cart) {
                return `No se encontro el cart con el id: ${cartId}`;
            }

            const code = crypto.randomUUID();
            let created_at = "";
            let amount = 0;
            const purchaser = user.email;

            const date = new Date();

            const [day, month, year] = [
                date.getDate(),
                date.getMonth(),
                date.getFullYear(),
            ];

            created_at = `dia: ${day}, mes: ${month + 1}, año: ${year}`;

            amount = await this.calculateAmount(cart[0].products);


            const {productsNotStock, productsInStock} = await this.purchesedProducts(cartId, cart[0].products);

            await this.updateProductsStock(productsInStock);

            const newTicket = {
                code: code,
                purchase_datetime: created_at,
                amount: amount,
                purchaser: purchaser
            }

            const ticketCreated = await ticketsModel.create(newTicket);

            return {
                ticket: ticketCreated,
                notStock: productsNotStock
            };

        } catch (error) {
            console.log(error.message);
        }
    }
}

