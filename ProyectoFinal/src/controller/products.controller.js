import {productService, userService} from "../repository/index.repository.js";
import productErrorOptions from "../services/productError.js";
import {ERRORS} from "../enums/error.js";
import {CustomError} from "../services/customError.services.js";
import userModel from "../dao/models/users.model.js";
import {sendEmailProductRemoved} from "../config/gmail.js";
class ProductController {

    static async getProducts(req, res) {
        try {
            const { limit, page, sort, category, availability, query } = req.query;
            const products = await productService.getProducts(limit, page, sort, category, availability, query);
            if (!products) {
                CustomError.createError({
                    name: "Could not get products",
                    cause: productErrorOptions.generateGetProductsError(),
                    message: "Error searching for products",
                    errorCode: ERRORS.PRODUCT_ERROR
                });
            }
            res.send({
                status: "success",
                products: products
            });
        } catch (error) {
            req.logger.error(error.message);
            res.status(500).send({
                status: 'error',
                msg: 'Internal server error',
            });
        }
    }

    static async getProductById(req, res) {
        try {
            const productId = req.params.pid;
            const product = await productService.getProductById(productId);

            if (typeof product === "string") {
                CustomError.createError({
                    name: "Could not obtain the product",
                    cause: productErrorOptions.generateGetProductByIdError(productId),
                    message: product,
                    errorCode: ERRORS.PRODUCT_ERROR
                })
            }
            res.send({
                status: "success",
                message: product
            })
        } catch (error) {
            req.logger.error("Could not obtain the product");
        }
    }

    static async addProduct(req, res) {
        try {

            const createdProduct = await productService.addProduct(req.body);
            if (typeof createdProduct === "string") {
                CustomError.createError({
                    name: "The product could not be added",
                    cause: productErrorOptions.generateAddProductError(),
                    message: createdProduct,
                    errorCode: ERRORS.PRODUCT_ERROR
                })
            }
            res.send({
                status: "success",
                message: createdProduct
            })
        } catch (error) {
            req.logger.error("The product could not be added");
        }
    }

    static async updateProduct(req, res) {
        try {
            const pid = req.params.pid;

            let updateProduct
            if (req.user.role === "admin"){

                updateProduct = await productService.updateProduct(pid, req.body);

                if (typeof updateProduct === "string") {
                    CustomError.createError({
                        name: "Could not update the product",
                        cause: productErrorOptions.generateUpdateProductError(pid),
                        message: updateProduct,
                        errorCode: ERRORS.PRODUCT_ERROR
                    })
                }
                res.send({
                    status: "success",
                    message: `The product with the id was successfully modified: ${pid}`
                })
            }

            const product = await productService.getProductById(pid);
            if (product === undefined || product.length === 0) {
                // array does not exist or is empty
                return res.status(400).send({
                    status: 'error',
                    msg: "Product does not exist",
                });
            }

            if (product[0].owner === req.user.email){

                updateProduct = await productService.updateProduct(pid, req.body);

                if (typeof updateProduct === "string") {
                    CustomError.createError({
                        name: "Could not update the product",
                        cause: productErrorOptions.generateUpdateProductError(pid),
                        message: updateProduct,
                        errorCode: ERRORS.PRODUCT_ERROR
                    })
                }
                res.send({
                    status: "success",
                    message: `The product with the id was successfully modified: ${pid}`
                })

            }else {
                res.status(400).send({
                    status: 'error',
                    msg: "Access denied to delete",
                });
            }


        } catch (error) {
            req.logger.error("Could not update the product");
        }
    }

    static async deleteProduct(req, res) {
        let response = {};

        try {
            const pid = req.params.pid;
            const product = await productService.getProductById(pid);
            console.log(req.user.role)
            console.log(product)
            const ownerUser = await userModel.findOne({email: product[0].owner})

            let deleteProduct;

            if (req.user.role === "admin") {
                deleteProduct = await productService.deleteProduct(pid);
                console.log(deleteProduct)
                if (deleteProduct === "success") {
                    response = {
                        status: "success",
                        msg: `Deleted product with id: ${pid}`
                    };
                    if (ownerUser){
                        if (ownerUser.role === "premium") {
                            await sendEmailProductRemoved(req.user.email, product);
                        }
                    }

                }

            } else {

                if (!product || product.length === 0) {
                    response = {
                        status: 'error',
                        msg: "Product does not exist",
                    };
                } else if (product[0].owner === req.user.email) {
                    deleteProduct = await productService.deleteProduct(pid);
                    if (deleteProduct === "success") {
                        response = {
                            status: "success",
                            msg: `Deleted product with id: ${pid}`
                        };

                    }
                } else {
                    response = {
                        status: 'error',
                        msg: "Access denied to delete",
                    };
                }
            }

            if (response.msg) {
                res.status(400).send(response);
            }

        } catch (error) {

            console.log(error)
            req.logger.error("Unable to delete product");
            if (error.name === "DeleteProductError") {
                response = {
                    status: 'error',
                    msg: error.message,
                    error: error
                };
            } else {
                response = {
                    status: 'error',
                    msg: 'Internal server error'
                };
            }
            res.status(500).send(response);
        }
    }
}

export default ProductController;