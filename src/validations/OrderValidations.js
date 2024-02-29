import Joi from "joi";
import { ORDER_STATUS, PAYMENT_METHOD } from "../config/constant.js";

export const createOrder = Joi.object({
    address: Joi.string().required(),
    phone: Joi.string().required(),
    products: Joi.string().required(),
    discount: Joi.number(),
    payment_method: Joi.number().valid(...Object.values(PAYMENT_METHOD)),
    order_status: Joi.number().valid(...Object.values(ORDER_STATUS)),
    create_by: Joi.string(),
    warehouse: Joi.string(),
    company: Joi.string(),
})

export const updateOrder = Joi.object({
    address: Joi.string().required(),
    phone: Joi.string().required(),
    products: Joi.string().required(),
    discount: Joi.number(),
    payment_method: Joi.number().valid(...Object.values(PAYMENT_METHOD)),
    order_status: Joi.number().valid(...Object.values(ORDER_STATUS)),
})