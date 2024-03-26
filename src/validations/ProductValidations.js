import Joi from "joi";

export const createProduct = Joi.object({
    name: Joi.string().max(30),
    code: Joi.string(),
    sku: Joi.string().max(10).message("Sku không hợp lệ!"),
    description: Joi.string().allow(),
    unit: Joi.string().valid('lit', 'cái', 'thùng', 'galon'),
    price_import: Joi.number().max(1000000000),
    price: Joi.number().max(1000000000),
    number: Joi.number().max(1000).allow(),
    position: Joi.string(),
    size: Joi.object({
        length: Joi.number().allow(),
        width: Joi.number().allow(),
        height: Joi.number().allow()
    }),
    weight: Joi.number().allow(),
    color: Joi.string().allow(),
    supplier: Joi.string(),
    warehouse: Joi.string(),
    category: Joi.string(),
})
export const updateProduct = Joi.object({
    name: Joi.string().max(30),
    description: Joi.string(),
    unit: Joi.string().valid('lit', 'cái', 'thùng', 'galon'),
    price: Joi.number().max(1000000000),
    price_import: Joi.number().max(1000000000),
    position: Joi.string(),
    supplier: Joi.string(),
    size: Joi.object({
        length: Joi.number(),
        width: Joi.number(),
        height: Joi.number()
    }),
    weight: Joi.number(),
    color: Joi.string(),
    warehouse: Joi.string(),

})