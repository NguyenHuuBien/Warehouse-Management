import Joi from "joi";

export const createOrder = Joi.object({
    discount: Joi.number(),
    // payment_status: Joi.number().valid(0, 1, 2),
    order_status: Joi.number().valid(0, 1, 2),
    products: Joi.string(),
    // paid: Joi.number().default(0),
    create_by: Joi.string(),
    warehouse: Joi.string(),
    company: Joi.string(),
    supplier: Joi.string(),
})

export const updateOrder = Joi.object({
    products: Joi.string(),
    discount: Joi.number(),
    order_status: Joi.number().valid(0, 1, 2),
})

export const productValidate = Joi.object({
    number: Joi.number().min(0).max(1000),
    price_order: Joi.number().min(0).max(1000000000),
    unit: Joi.string().valid('lit', 'cái', 'thùng', 'galon'),
    discount: Joi.number().max(100),
    product: Joi.string()
})