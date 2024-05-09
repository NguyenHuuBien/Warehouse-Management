//đơn chuyển đi
import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../config/errors.js"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import { convertCode } from "../utils/convert.js"
import { productValidate, updateOrder } from "../validations/OrderValidations.js"
import { isObjectId } from "../validations/index.js"
import { searchNameCode } from "../utils/search.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { createExport, updateExport } from "../validations/WarehouseExportValidations.js"
import WareHouseExport from "../models/WarehouseExport.js"
import { _createImport } from "./WarehouseImportActions.js"
import { decreaseProduct } from "./OrderActions.js"

const _validateProducts = async (products, warehouse) => {
    let totalPrice = 0
    let listProduct
    listProduct = JSON.parse(products) //string -> json -> array
    for (let product of listProduct) {
        if (!product.product) throw new ParamError("Thiếu id sản phẩm!")
        const oldProduct = await Product.findOne({ _id: new mongoose.Types.ObjectId(product.product), warehouse: warehouse })
        if (!oldProduct) throw new ParamError("Sản phẩm này không tồn tại")
        product = await productValidate.validateAsync(product)


        // if (product.number > oldProduct.number) throw new ParamError("Số lượng mua hiện tại đã vượt quá số lượng trong kho!")
        // oldProduct.number = oldProduct.number - product.number

        await Product.findByIdAndUpdate(product.product, oldProduct)
        totalPrice = totalPrice + oldProduct.price * product.number
    }
    return { totalPrice, products: listProduct }
}

export const create = async ({ body, user, file }) => {
    const validate = await createExport.validateAsync(body)
    if (!validate.warehouse) throw new ParamError("Thiếu tên kho!")

    if (!body.products) throw new ParamError("Không có sản phẩm nào!")
    let newProduct
    if (validate.products) {
        newProduct = await _validateProducts(body.products, validate.warehouse)
        validate.products = newProduct.products
    }

    const oldExport = await WareHouseExport.countDocuments()
    validate.code = convertCode("DH", oldExport)

    validate.total_price = newProduct.totalPrice
    if (validate.discount) {
        validate.total_price = newProduct.totalPrice * (1 - validate.discount / 100)
    }

    if (!validate.create_by) validate.create_by = user._id
    if (!validate.company) validate.company = user.company
    const result = await WareHouseExport.create(validate)
    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateExport.validateAsync(body)

    const oldExport = await WareHouseExport.findById(id)
    if (!oldExport) throw new NotFoundError("Không tìm thấy đơn hàng!")
    let newProduct
    if (validate.products) {
        newProduct = await _validateProducts(body.products, oldExport.warehouse)

    }

    if (newProduct) {
        validate.products = newProduct.products
        validate.total_price = newProduct.totalPrice

    }

    if (oldExport.export_status == 0 || oldExport.is_retunr == 1) throw new ParamError("Đơn hàng này đã bị hủy hoặc đã trả lại")
    if (validate.export_status == 2) await decreaseProduct(oldExport.products, oldExport.warehouse)

    const result = await WareHouseExport.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldExport = await WareHouseExport.findById(id)
        .select("-updatedAt -warehouse -company")
        .populate("create_by", "name")
        .populate("products.product", "name")
    return oldExport
}

export const list = async ({
    query: { export_status, code = "", startDate, is_return, endDate, date, create_by, product, limit = 10, page = 1, warehouse },
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
    } if (create_by) conditions.create_by = new mongoose.Types.ObjectId(create_by)
    if (product) conditions["products.product"] = new mongoose.Types.ObjectId(product)
    if (export_status) conditions.export_status = export_status

    if (currentUser.warehouse) conditions.warehouse = currentUser.warehouse
    if (warehouse) conditions.warehouse = warehouse
    conditions.company = currentUser.company
    if (is_return) conditions.is_return = is_return

    const { offset } = getPagination(page, limit)
    const result = await WareHouseExport.find(conditions)
        .select("-updatedAt -warehouse -company")
        .populate("create_by", "name")
        .populate("products.product", "name")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
    const total = await WareHouseExport.countDocuments(conditions)
    return getPaginData(result, total, page)
}

export const listNoPage = async ({
    query: { export_status, code = "", is_return, startDate, endDate, create_by, product, limit = 10, page = 1, warehouse },
    user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    // const q = { code }
    // if (q) conditions = searchNameCode(q)
    if (is_return) conditions.is_return = is_return

    // if (startDate && endDate) conditions.createdAt = { $gte: new Date(startDate), $lt: new Date(endDate) }
    // if (create_by) conditions.create_by = new mongoose.Types.ObjectId(create_by)
    // if (product) conditions["products.product"] = new mongoose.Types.ObjectId(product)
    // if (export_status) conditions.export_status = export_status

    if (currentUser.warehouse) conditions.warehouse = currentUser.warehouse
    if (warehouse) conditions.warehouse = warehouse
    conditions.company = currentUser.company

    // const { offset } = getPagination(page, limit)
    const result = await WareHouseExport.find(conditions)
        .select("-updatedAt -warehouse -company")
        .populate("create_by", "name")
        .populate("products.product", "name")
        .sort({ createdAt: -1 })
    // .skip(offset)
    // .limit(limit)
    // const total = await WareHouseExport.countDocuments(conditions)
    // return getPaginData(result, total, page)
    return result
}