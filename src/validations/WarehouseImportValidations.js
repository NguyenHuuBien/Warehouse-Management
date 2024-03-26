import Joi from "joi";
import { IMPORT_STATUS } from "../config/constant.js";

export const createValidation = Joi.object({
    // old_export: Joi.string(),
    products: Joi.string(),
    warehouse: Joi.string(),
    reason: Joi.string()
})
export const updateValidation = Joi.object({
    import_status: Joi.number().valid(...Object.values(IMPORT_STATUS)),
})