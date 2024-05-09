import mongoose from "mongoose"
import WareHouseExport from "../models/WarehouseExport.js"
import WarehouseImport from "../models/WarehouseImport.js"
import { createValidation, updateValidation } from "../validations/WarehouseImportValidations.js"
import { NotFoundError, ParamError } from "../config/errors.js"
import { convertCode } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { isObjectId } from "../validations/index.js"
import { searchNameCode } from "../utils/search.js"
import { increaseProduct } from "./OrderActions.js"
import Product from "../models/Product.js"
import { productValidate } from "../validations/OrderValidations.js"

//đơn trả hàng
export const _createImport = async (oldExport) => {
    const totalImports = await WarehouseImport.countDocuments()
    let code = convertCode("TH", totalImports)
    const result = await WarehouseImport.create({
        code: code,
        old_export: new mongoose.Types.ObjectId(oldExport._id),
        warehouse: oldExport.warehouse,
        products: oldExport.products,
        company: oldExport.company
    }).save()
    return result
}
const _validateProducts = async (products, warehouse) => {
    // let totalPrice = 0
    let listProduct
    listProduct = JSON.parse(products) //string -> json -> array
    for (let product of listProduct) {
        if (product.number <= 0) throw new ParamError("Số lượng nhập phải lớn hơn 0")
        if (!product.product) throw new ParamError("Thiếu id sản phẩm!")
        const oldProduct = await Product.findOne({ _id: new mongoose.Types.ObjectId(product.product), warehouse: warehouse })
        if (!oldProduct) throw new ParamError("Sản phẩm này không tồn tại")
        product = await productValidate.validateAsync(product)

        // oldProduct.number = oldProduct.number + product.number
        // await Product.findByIdAndUpdate(oldProduct._id, oldProduct)
        // totalPrice = totalPrice + product.price_order * product.number
    }
    return { products: listProduct }
}

export const create = async ({ body, user, file }) => {
    const validate = await createValidation.validateAsync(body)
    // const oldExport = await WareHouseExport.findById(validate.old_export)
    // if (!oldExport) throw new ParamError("Không tìm thấy đơn xuất hàng!")
    validate.warehouse = validate.warehouse ? validate.warehouse : user.warehouse
    if (!validate.warehouse) throw new ParamError("Thiếu Kho!")
    if (validate.products) {
        const newProduct = await _validateProducts(validate.products, validate.warehouse)
        validate.products = newProduct.products
    }

    validate.company = user.company
    const totalImports = await WarehouseImport.countDocuments()
    validate.code = convertCode("TH", totalImports)
    if (!validate.old_export) throw new ParamError("Thiếu đơn Thông tin đơn xuất đi!")
    const oldExport = await WareHouseExport.findById(validate.old_export)
    if (!oldExport) throw new ParamError("Đơn xuất hàng này không tồn tại!")
    if (oldExport.export_status != 2) throw new ParamError("Đơn xuất hàng này chưa được giao đi hoặc bị hủy!")

    const oldImport = await WarehouseImport.findOne({ old_export: validate.old_export })
    if (oldImport) throw new ParamError("Phiếu xuất hàng này đã có Phiếu trả hàng!")
    const result = await WarehouseImport.create(validate)
    await WareHouseExport.findByIdAndUpdate(validate.old_export, { is_return: 1 })
    return result
}

export const update = async ({ params, user, body }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateValidation.validateAsync(body)

    const oldImport = await WarehouseImport.findById(id)
    if (!oldImport) throw new NotFoundError("Đơn hàng không tồn tại!")

    //thiếu nhận hàng thành công thì cộng số lượng vào kho
    if (oldImport.import_status == 2) throw new ParamError("Đơn hàng này đã được trả thành công!")
    if (validate.import_status == 2) {
        await increaseProduct(oldImport.products, oldImport.warehouse)
        validate.update_by = user._id
    }

    await WarehouseImport.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params, user }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")

    const oldImport = await WarehouseImport.findById(id)
        .select("-updatedAt -warehouse")
        .populate({
            path: "old_export",
            populate: [
                { path: "products.product", select: "name" },
                { path: "create_by", select: "name" },
                { path: "warehouse", select: "name" }
            ]
        })
        .populate("products.product", "name")
        .populate("warehouse", "name")
        .populate("update_by", "name")
        .lean()
    return oldImport
}

export const list = async ({
    query: { import_status, code = "", startDate, endDate, date, update_by, product, limit = 10, page = 1, warehouse },
    user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    const q = { code }
    if (q) conditions = searchNameCode(q)

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }    
    if (update_by) conditions.update_by = new mongoose.Types.ObjectId(update_by)
    if (product) conditions["products.product"] = new mongoose.Types.ObjectId(product)
    if (import_status) conditions.import_status = import_status

    if (currentUser.warehouse) conditions.warehouse = currentUser.warehouse
    if (warehouse) conditions.warehouse = warehouse
    conditions.company = currentUser.company


    const { offset } = getPagination(page, limit)
    const result = await WarehouseImport.find(conditions)
        .select("-updatedAt -warehouse")
        .populate({
            path: "old_export",
            populate: [
                { path: "products.product", select: "name" },
                { path: "create_by", select: "name" },
                { path: "warehouse", select: "name" }
            ]
        })
        .populate("products.product", "name")
        .populate("warehouse", "name")
        .populate("update_by", "name")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
    const total = await WarehouseImport.countDocuments(conditions)
    return getPaginData(result, total, page)
}

export const listNoPage = async ({
    query: { import_status, code = "", startDate, endDate, update_by, product, limit = 10, page = 1, warehouse },
    user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    // const q = { code }
    // if (q) conditions = searchNameCode(q)

    // if (startDate && endDate) conditions.createdAt = { $gte: new Date(startDate), $lt: new Date(endDate) }
    // if (update_by) conditions.update_by = new mongoose.Types.ObjectId(update_by)
    // if (product) conditions["products.product"] = new mongoose.Types.ObjectId(product)
    // if (import_status) conditions.import_status = import_status

    if (currentUser.warehouse) conditions.warehouse = currentUser.warehouse
    if (warehouse) conditions.warehouse = warehouse
    conditions.company = currentUser.company


    // const { offset } = getPagination(page, limit)
    const result = await WarehouseImport.find(conditions)
        .select("-updatedAt -warehouse")
        .populate({
            path: "old_export",
            populate: [
                { path: "products.product", select: "name" },
                { path: "create_by", select: "name" },
                { path: "warehouse", select: "name" }
            ]
        })
        .populate("products.product", "name")
        .populate("warehouse", "name")
        .populate("update_by", "name")
        .sort({ createdAt: -1 })
    // .skip(offset)
    // const total = await WarehouseImport.countDocuments(conditions)
    // return getPaginData(result, total, page)
    return result
}