import Joi from "joi";

export const createCategory = Joi.object({
    name: Joi.string().max(20),
    status: Joi.number().valid(0, 1),
    company: Joi.string()
})
export const updateCategory = Joi.object({
    name: Joi.string().max(20),
    status: Joi.number().valid(0, 1),
})