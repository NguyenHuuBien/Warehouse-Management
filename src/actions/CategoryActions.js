import { NotFoundError, ParamError } from "../config/errors.js"
import Category from "../models/Category.js"
import Company from "../models/Company.js"
import { convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { searchNameCode } from "../utils/search.js"
import { createCategory, updateCategory } from "../validations/CategoryValidations.js"
import { isObjectId } from "../validations/index.js"

export const create = async ({ body, user, file }) => {
    let validate = await createCategory.validateAsync(body)

    const oldName = await Category.findOne({ name: validate.name })
    if (oldName) throw new ParamError("Tên Loại sản phẩm này đã tồn tại")
    validate.company = user.company

    const oldCompany = await Company.findById(validate.company)
    if (!oldCompany) throw new ParamError("Công ty không tồn tại!")
    validate.name_search = convertNameSearch(validate.name)
    const result = await new Category(validate).save()
    return result
}
export const update = async ({ body, user, params, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateCategory.validateAsync(body)

    const oldCatgory = await Category.findById(id).lean()
    if (!oldCatgory) throw new NotFoundError("Tên Loại sản phẩm này không tồn tại!")

    if (validate.name && validate.name != oldCatgory.name) {
        const oldName = await Category.findOne({ name: validate.name })
        if (oldName) throw new Error("Tên Loại sản phẩm này đã tồn tại!")
    }

    const result = await Category.findByIdAndUpdate(id, validate)
    return true

}

export const list = async ({ query: { name = "", code = "", status, limit = 10, page = 1 }, user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    const q = { name, code }
    if (q) conditions = searchNameCode(q)
    conditions.status = 1
    if (status) conditions.status = status
    conditions.company = currentUser.company

    // const { offset } = getPagination(page, limit)
    const result = await Category.find(conditions)
        .populate("company", "name")
        .select("-createdAt -updatedAt -name_search -status")
        // .skip(offset)
        .sort({ createdAt: -1 })
        .lean()
    // const total = await Category.countDocuments(conditions)
    return result
    // return getPaginData(result, total, page)
}