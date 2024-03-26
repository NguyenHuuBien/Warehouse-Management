import mongoose from "mongoose"
import WareHouseExport from "../models/WarehouseExport.js"
import WarehouseImport from "../models/WarehouseImport.js"
import { createValidation, updateValidation } from "../validations/WarehouseImportValidations.js"
import { NotFoundError, ParamError } from "../config/errors.js"
import { convertCode } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { isObjectId } from "../validations/index.js"
import { searchNameCode } from "../utils/search.js"
import { _validateProducts } from "./OrderActions.js"

//đơn trả hàng
export const _createImport = async (export_id, warehouse, product) => {
    const totalImports = await WarehouseImport.countDocuments()
    let code = convertCode("TH", totalImports)
    const result = await WarehouseImport.create({ code: code, old_export: new mongoose.Types.ObjectId(export_id), warehouse: warehouse, products: product })
    return result
}

export const create = async ({ body, user, file }) => {
    const validate = await createValidation.validateAsync(body)
    // const oldExport = await WareHouseExport.findById(validate.old_export)
    // if (!oldExport) throw new ParamError("Không tìm thấy đơn xuất hàng!")
    validate.warehouse = validate.warehouse ? validate.warehouse : user.warehouse
    if (!validate.warehouse) throw new ParamError("Thiếu Kho!")

    const newProduct = await _validateProducts(validate.products, validate.warehouse)
    validate.products = newProduct.products
    const result = await WarehouseImport.create(validate)
    return result
}

export const update = async ({ params, user, body }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateValidation.validateAsync(body)

    const oldImport = await WarehouseImport.findById(id)
    if (!oldImport) throw new NotFoundError("Đơn hàng không tồn tại!")

    await WarehouseImport.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params, user }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")

    const oldImport = await WarehouseImport.findById(id)
        .select("old_export import_status")
        .populate("old_export", "-company -warehouse -createdAt -updatedAt -create_by")
        .lean()
    return oldImport
}

export const list = async ({ query: { code = "", status, page = 1, limit = 10, warehouse }, user: currentUser }) => {
    let conditions = {}
    const q = { code }
    if (q) conditions = searchNameCode(q)

    if (status) conditions.status = status
    if (!warehouse) throw new ParamError("Thiếu tên Kho!")
    conditions.warehouse = warehouse

    const { offset } = getPagination(page, limit)
    const result = await WarehouseImport.find(conditions)
        .select("-createdAt -updatedAt -warehouse")
        .populate("old_export", "-company -warehouse -createdAt -updatedAt -create_by")
        .sort({ createdAt: -1 })
        .skip(offset)
    const total = await WarehouseImport.countDocuments(conditions)
    return getPaginData(result, total, page)
}