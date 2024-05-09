import Joi from "joi";

export const createProduct = Joi.object({
    name: Joi.string().max(30),
    // code: Joi.string(),
    sku: Joi.string().max(10).message("Sku không hợp lệ!"),
    description: Joi.string().allow(),
    unit: Joi.string(),
    price_import: Joi.number().max(1000000000),
    // price: Joi.number().max(1000000000),
    // number: Joi.number().min(0).allow(),
    // position: Joi.string().allow(),
    size: Joi.object({
        length: Joi.number().allow(),
        width: Joi.number().allow(),
        height: Joi.number().allow()
    }),
    weight: Joi.number().allow(),
    color: Joi.string().allow(""),
    supplier: Joi.string(),
    // warehouse: Joi.string(),
    // category: Joi.string(),
    status: Joi.number().valid(0, 1).default(1)
})
export const updateProduct = Joi.object({
    name: Joi.string().max(30),
    description: Joi.string().allow(),
    unit: Joi.string(),
    // price: Joi.number().max(1000000000),
    price_import: Joi.number().max(1000000000),
    // position: Joi.string().allow(),
    // number: Joi.number().allow().min(0),
    // category: Joi.string(),
    // supplier: Joi.string(),
    size: Joi.object({
        length: Joi.number().allow(),
        width: Joi.number().allow(),
        height: Joi.number().allow()
    }),
    weight: Joi.number().allow(),
    color: Joi.string().allow(""),
    // warehouse: Joi.string(),
    status: Joi.number()
})