import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../config/errors.js"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import { convertCode } from "../utils/convert.js"
import { createOrder, updateOrder } from "../validations/OrderValidations.js"
import { productValidate } from "../validations/WarehouseImportValidations.js"
import { isObjectId } from "../validations/index.js"
import { searchNameCode } from "../utils/search.js"
import { getPaginData, getPagination } from "../utils/paging.js"

const _validateProducts = async (products, warehouse) => {
    let totalPrice = 0
    let listProduct
    listProduct = JSON.parse(products) //string -> json -> array
    for (let product of listProduct) {
        if (!product.product) throw new ParamError("Thiếu id sản phẩm!")
        const oldProduct = await Product.findOne({ _id: new mongoose.Types.ObjectId(product.product), warehouse: warehouse })
        if (!oldProduct) throw new ParamError("Sản phẩm này không tồn tại")
        product = await productValidate.validateAsync(product)
        totalPrice = totalPrice + oldProduct.price * product.number
    }
    return { totalPrice, products: listProduct }
}

export const create = async ({ body, user, file }) => {
    const validate = await createOrder.validateAsync(body)
    if (!validate.warehouse) throw new ParamError("Thiếu tên kho!")

    if (!body.products) throw new ParamError("Không có sản phẩm nào!")
    const newProduct = await _validateProducts(body.products, validate.warehouse)
    validate.products = newProduct.products

    const oldOrder = await Order.countDocuments()
    validate.code = convertCode("DH", oldOrder)

    validate.total_price = newProduct.totalPrice
    if (validate.discount) {
        validate.total_price = newProduct.totalPrice * (1 - validate.discount / 100)
    }

    if (!validate.create_by) validate.create_by = user._id
    if (!validate.company) validate.company = user.company
    const result = await Order.create(validate)
    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateOrder.validateAsync(body)

    const oldOrder = await Order.findById(id)
    if (!oldOrder) throw new NotFoundError("Không tìm thấy đơn hàng!")

    const newProduct = await _validateProducts(body.products, oldOrder.warehouse)
    validate.products = newProduct.products
    validate.total_price = newProduct.totalPrice

    const result = await Order.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldOrder = await Order.findById(id)
        .select("-createdAt -updatedAt -warehouse -company")
    return oldOrder
}

export const list = async ({ query: { q, status, limit = 10, page = 1, warehouse }, user: currentUser }) => {
    let conditions = {}

    if (q) conditions = searchNameCode(q)
    if (status) conditions.import_status = status
    if (currentUser.warehouse) conditions.warehouse = currentUser.warehouse
    if (warehouse) conditions.warehouse = warehouse
    conditions.company = currentUser.company

    const { offset } = getPagination(page, limit)
    const result = await Order.find(conditions)
        .select("-createdAt -updatedAt -warehouse -company")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
    const total = await Order.countDocuments(conditions)
    return getPaginData(result, total, page)
}