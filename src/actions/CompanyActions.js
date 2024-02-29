import Company from "../models/Company.js"

export const create = async ({ body, user }) => {
    console.log("aaaaaaaaaaaaaaa", body);
    const result = await new Company(body).save()
    return result
}
