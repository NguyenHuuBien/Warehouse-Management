import { NotFoundError, ParamError } from "../config/errors.js"
import Warehouse from "../models/Warehouse.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { searchNameCode } from "../utils/search.js"
import { isObjectId } from "../validations/index.js"

export const create = async ({ body, user, file }) => {

    if (!body.name) throw new ParamError("Thiếu tên Kho!")
    const oldName = await Warehouse.findOne({ name: body.name })
    if (oldName) throw new ParamError("Tên Kho này đã tồn tại!")
    body.name_search = convertNameSearch(body.name)
    if (!body.company) throw new ParamError("Thiếu tên Công ty!")
    if (!body.address) throw new ParamError("Thiếu Địa chỉ!")

    const countWarehouse = await Warehouse.countDocuments()
    body.code = convertCode("WH", countWarehouse)

    const result = await new Warehouse(body).save()
    return result
}
export const update = async ({ body, user, params, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")

    const oldWarehouse = await Warehouse.findById(id)
    if (!oldWarehouse) throw new ParamError("Kho không tồn tại!")


    if (body.name && body.name != oldWarehouse.name) {
        const oldName = await Warehouse.findOne({ name: body.name })
        if (oldName) throw new Error("Tên Kho này đã tồn tại!")
    }
    body.name_search = convertNameSearch(body.name)

    await Warehouse.findByIdAndUpdate(id, body)
    return true

}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldWarehouse = await Warehouse.findById(id)
        .select("-createdAt -updatedAt -name_search")
    return oldWarehouse
}

export const list = async ({ query: { q, status, limit = 10, page = 1, company }, user: currentUser }) => {
    let conditions = {}

    if (q) conditions = searchNameCode(q)
    if (status) conditions.status = status
    conditions.company = company ? company : currentUser.company
    if (!conditions.company) throw new ParamError("Thiếu tên công ty!")

    const { offset } = getPagination(page, limit)
    const result = await Warehouse.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .sort({ createdAt: -1 })
        .skip(offset)
    const total = await Warehouse.countDocuments(conditions)
    return getPaginData(result, total, page)
}

