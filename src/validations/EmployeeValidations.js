import Joi from "joi";

export const _phoneValidation = Joi.string()
    .pattern(/((09|03|07|08|05)+([0-9]{8})\b)/, "phone")
    .min(6)
    .max(15)
    .messages({ 'string.pattern.name': 'Số điện thoại không hợp lệ!' });

export const signupValidation = Joi.object({
    name: Joi.string(),
})

export const createValidation = Joi.object({
    username: Joi.string(),
    password: Joi.string().max(8),
    name: Joi.string(),
    status: Joi.number().valid(0, 1),
    email: Joi.string(),
    phone: _phoneValidation,
    identify_number: Joi.string().length(12),
    sex: Joi.string().valid('male', 'female'),
    roles: Joi.string(),
    address: Joi.string(),
    company: Joi.string(),
    warehouse: Joi.string()
})

export const loginValidation = Joi.object({
    username: Joi.string(),
    password: Joi.string().max(8),
})

export const updateValidations = Joi.object({
    username: Joi.string(),
    password: Joi.string().max(8),
    name: Joi.string(),
    status: Joi.number().valid(0, 1),
    phone: _phoneValidation,
    identify_number: Joi.string().length(12),
    sex: Joi.string().valid('male', 'female'),
    roles: Joi.string(),
    address: Joi.string(),
    company: Joi.string()
})