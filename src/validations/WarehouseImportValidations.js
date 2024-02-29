import Joi from "joi";

export const createWarehouseImport = Joi.object({
    discount: Joi.number(),
    payment_status: Joi.number().valid(0, 1, 2),
    import_status: Joi.number().valid(0, 1, 2),
    products: Joi.string(),
    paid: Joi.number(),
    create_by: Joi.string(),
    warehouse: Joi.string(),
    company: Joi.string(),
    supplier: Joi.string(),
})

export const updateWarehouseImport = Joi.object({
    add_pay: Joi.number(),
})

export const productValidate = Joi.object({
    number: Joi.number().min(0).max(1000),
    price_import: Joi.number().min(0).max(1000000000),
    unit: Joi.string().valid('lit', 'cái', 'thùng', 'galon'),
    discount: Joi.number().max(100),
    product: Joi.string()
})