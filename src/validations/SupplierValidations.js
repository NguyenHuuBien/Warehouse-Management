import Joi from "joi";
import { _phoneValidation } from "./EmployeeValidations.js";

export const createSupplier = Joi.object({
    name: Joi.string(),
    phone: _phoneValidation,
    status: Joi.number().valid(0, 1),
    email: Joi.string(),
    address: Joi.string(),
    company: Joi.string(),
    tax_code: Joi.string(),
    username: Joi.string(),
    password: Joi.string().max(8),
})

export const updateSupplier = Joi.object({
    name: Joi.string(),
    phone: _phoneValidation,
    status: Joi.number().valid(0, 1),
    email: Joi.string(),
    address: Joi.string(),
    company: Joi.string(),
    tax_code: Joi.string(),
    username: Joi.string(),
    password: Joi.string().max(8),
})