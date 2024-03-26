import Joi from "joi";
import { EXPORT_STATUS, PAYMENT_METHOD } from "../config/constant.js";

export const createExport = Joi.object({
    address: Joi.string().required(),
    phone: Joi.string().required(),
    products: Joi.string().required(),
    discount: Joi.number(),
    payment_method: Joi.number().valid(...Object.values(PAYMENT_METHOD)),
    export_status: Joi.number().valid(...Object.values(EXPORT_STATUS)),
    create_by: Joi.string(),
    warehouse: Joi.string(),
    company: Joi.string(),
})

export const updateExport = Joi.object({
    address: Joi.string().required(),
    phone: Joi.string().required(),
    products: Joi.string().required(),
    discount: Joi.number(),
    payment_method: Joi.number().valid(...Object.values(PAYMENT_METHOD)),
    export_status: Joi.number().valid(...Object.values(EXPORT_STATUS)),
})