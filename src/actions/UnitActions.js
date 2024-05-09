import { NotFoundError, ParamError } from "../config/errors.js"
import Company from "../models/Company.js"
import Unit from "../models/Unit.js"
import { convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { searchNameCode } from "../utils/search.js"
import { createUnit, updateUnit } from "../validations/UnitValidations.js"
import { isObjectId } from "../validations/index.js"

export const create = async ({ body, user, file }) => {
    let validate = await createUnit.validateAsync(body)

    validate.name_search = convertNameSearch(validate.name)
    const oldName = await Unit.findOne({ name_search: validate.name_search })
    if (oldName) throw new ParamError("Tên đơn vị tính này đã tồn tại")
    validate.company = user.company

    const oldCompany = await Company.findById(validate.company)
    if (!oldCompany) throw new ParamError("Công ty không tồn tại!")
    const result = await new Unit(validate).save()
    return result
}
export const update = async ({ body, user, params, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateUnit.validateAsync(body)

    const oldUnit = await Unit.findById(id).lean()
    if (!oldUnit) throw new NotFoundError("Tên đơn vị tính này không tồn tại!")

    if (validate.name && validate.name != oldUnit.name) {
        validate.name_search = convertNameSearch(validate.name)
        const oldName = await Unit.findOne({ name_search: validate.name_search })
        if (oldName) throw new Error("Tên đơn vị tính này đã tồn tại!")
    }

    const result = await Unit.findByIdAndUpdate(id, validate)
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
    const result = await Unit.find(conditions)
        .populate("company", "name")
        .select("-createdAt -updatedAt -name_search -status")
        // .skip(offset)
        .sort({ createdAt: -1 })
        .lean()
    // const total = await Category.countDocuments(conditions)
    return result
    // return getPaginData(result, total, page)
}