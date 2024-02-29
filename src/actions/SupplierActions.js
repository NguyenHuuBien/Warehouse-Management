import bcrypt from 'bcrypt'
import { ParamError } from "../config/errors.js"
import Supplier from "../models/Supplier.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { createSupplier, updateSupplier } from "../validations/SupplierValidations.js"
import { isObjectId } from "../validations/index.js"
import { searchNameCode } from '../utils/search.js'

export const create = async ({ body, user, file }) => {
    let validate = await createSupplier.validateAsync(body)

    if (!validate.name) throw new ParamError("Thiếu tên nhà cung cấp!")
    const oldName = await Supplier.findOne({ name: validate.name })
    if (oldName) throw new ParamError("Tên nhà cung cấp này đã tồn tại!")
    validate.name_search = convertNameSearch(validate.name)

    if (!validate.company) throw new ParamError("Thiếu tên công ty")
    if (!validate.phone) throw new ParamError("Thiếu Số điện thoại nhà cung cấp!")
    const oldPhone = await Supplier.findOne({ phone: validate.phone })
    if (oldPhone) throw new ParamError("Số điện thoại này đã tồn tại!")
    if (!validate.address) throw new ParamError("Thiếu địa chỉ nhà cung cấp!")

    const oldUsername = await Supplier.findOne({ username: validate.username })
    if (oldUsername) throw new ParamError("Tên tại khoản này đã tồn tại")

    validate.password = bcrypt.hashSync(validate.password, 12)

    const countSupplier = await Supplier.countDocuments()
    validate.code = convertCode("NCC", countSupplier)

    const result = await new Supplier(validate).save()
    return result
}
export const update = async ({ body, user, params, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateSupplier.validateAsync(body)

    const oldSupplier = await Supplier.findById(id)
    if (!oldSupplier) throw new ParamError("Nhà cung cấp không tồn tại!")

    if (validate.username && validate.username != oldSupplier.username) {
        const oldUsername = await Supplier.findOne({ username: validate.username })
        if (oldUsername) throw new Error("Tên tài khoàn này đã tồn tại!")
    }

    if (validate.name && validate.name != oldSupplier.name) {
        const oldName = await Supplier.findOne({ name: validate.name })
        if (oldName) throw new Error("Tên Nhà cung cấp này đã tồn tại!")
    }
    validate.name_search = convertNameSearch(validate.name)

    if (validate.phone && validate.phone != oldSupplier.phone) {
        const oldPhone = await Supplier.findOne({ phone: validate.phone })
        if (oldPhone) throw new Error("Số điện thoại Nhà cung cấp này đã tồn tại!")
    }
    await Supplier.findByIdAndUpdate(id, validate)
    return true

}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldSupplier = await Supplier.findById(id)
        .select("-createdAt -updatedAt -name_search")
    return oldSupplier
}

export const list = async ({ query: { q, status, limit = 10, page = 1 } }) => {
    let conditions = {}

    if (q) conditions = searchNameCode(q)
    if (status) conditions.status = status

    const { offset } = getPagination(page, limit)
    const result = await Supplier.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .sort({ createdAt: -1 })
        .skip(offset)
    const total = await Supplier.countDocuments(conditions)
    return getPaginData(result, total, page)
}

