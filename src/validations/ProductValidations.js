import Joi from "joi";

export const createProduct = Joi.object({
    name: Joi.string().max(30),
    code: Joi.string(),
    sku: Joi.string().max(10).message("Sku không hợp lệ!"),
    description: Joi.string().max(100),
    unit: Joi.string().valid('lit', 'cái', 'thùng', 'galon'),
    price_import: Joi.number().max(1000000000),
    price: Joi.number().max(1000000000),
    number: Joi.number().max(1000),
    position: Joi.string(),
    supplier: Joi.string(),
    warehouse: Joi.string(),
    company: Joi.string(),
    category: Joi.string(),
})
export const updateProduct = Joi.object({
    name: Joi.string().max(30),
    description: Joi.string().max(100),
    unit: Joi.string().valid('lit', 'cái', 'thùng', 'galon'),
    price: Joi.number().max(1000000000),
    position: Joi.string(),
    supplier: Joi.string(),
})