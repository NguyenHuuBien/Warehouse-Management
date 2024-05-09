import Joi from "joi";
import { PAYMENT_STATUS } from "../config/constant.js";

export const createBill = Joi.object({
    order: Joi.string(),
    paid: Joi.number(),
    payment_status: Joi.number().valid(...Object.values(PAYMENT_STATUS))
})

export const updateBill = Joi.object({
    paid: Joi.number(),
    payment_status: Joi.number().valid(...Object.values(PAYMENT_STATUS))

})