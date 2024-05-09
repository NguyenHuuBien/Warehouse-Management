import Joi from "joi";

export const createUnit = Joi.object({
    name: Joi.string().max(20),
    status: Joi.number().valid(0, 1),
    company: Joi.string()
})
export const updateUnit = Joi.object({
    name: Joi.string().max(20),
    status: Joi.number().valid(0, 1),
})