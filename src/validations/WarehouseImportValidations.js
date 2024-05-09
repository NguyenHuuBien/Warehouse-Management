import Joi from "joi";
import { IMPORT_STATUS } from "../config/constant.js";

export const createValidation = Joi.object({
    old_export: Joi.string(),
    products: Joi.string(),
    warehouse: Joi.string(),
    reason: Joi.string(),
    import_status: Joi.number(),
    reason_cancel: Joi.string().allow()
})
export const updateValidation = Joi.object({
    import_status: Joi.number().valid(...Object.values(IMPORT_STATUS)),
    reason_cancel: Joi.string().allow()
})