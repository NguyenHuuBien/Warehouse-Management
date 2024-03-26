//đơn nhập hàng
import mongoose from "mongoose"
import { ORDER_STATUS, PAYMENT_STATUS } from "../config/constant.js"
import { NotFoundError, ParamError } from "../config/errors.js"
import Product from "../models/Product.js"
import { convertCode } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { searchNameCode } from "../utils/search.js"
import { isObjectId } from "../validations/index.js"
import { createOrder, productValidate, updateOrder } from "../validations/OrderValidations.js"
import Order from "../models/Order.js"

export const _validateProducts = async (products, warehouse) => {
    // let totalPrice = 0
    let listProduct
    listProduct = JSON.parse(products) //string -> json -> array
    for (let product of listProduct) {
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

// const _convertstatus = (totalPrice, paid) => {
//     let payment_status
//     let order_status
//     let debt = totalPrice - paid
//     if (debt <= 0) {
//         debt = 0
//         payment_status = PAYMENT_STATUS.PAID
//         order_status = ORDER_STATUS.RECEIVED
//     } else if (debt == paid) {
//         payment_status = PAYMENT_STATUS.NOT_PAY
//     } else {
//         payment_status = PAYMENT_STATUS.PAY_PART
//     }

//     return { debt, payment_status, order_status }
// }

export const create = async ({ body, user, file }) => {
    const validate = await createOrder.validateAsync(body)

    if (!body.products) throw new ParamError("Không có sản phẩm nào!")
    const newProduct = await _validateProducts(body.products, validate.warehouse)
    validate.products = newProduct.products

    const oldOrder = await Order.countDocuments()
    validate.code = convertCode("NH", oldOrder)

    // validate.total_price = newProduct.totalPrice
    // if (validate.discount) {
    //     validate.total_price = newProduct.totalPrice * (1 - validate.discount / 100)
    // }

    // const { debt, payment_status, order_status } = _convertstatus(validate.total_price, validate.paid);
    // validate.debt = debt;
    // validate.payment_status = payment_status;
    // validate.order_status = order_status;

    if (!validate.create_by) validate.create_by = user._id
    if (!validate.supplier) throw new ParamError("Thiếu nhà cung cấp!")
    if (!validate.warehouse) throw new ParamError("Thiếu tên kho!")
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
    if (!oldOrder) throw new NotFoundError("Không tìm thấy đơn nhập hàng!")
    if (oldOrder.payment_status == 1) throw new ParamError("Đơn hàng đã thanh toán đấy đủ!")

    const newProduct = await _validateProducts(validate.products, oldOrder.warehouse)
    validate.products = newProduct.products

    // if (validate.add_pay < 0 || validate.add_pay > oldOrder.total_price) throw new ParamError("Số tiền trả thêm không hợp lệ!")

    // const { debt, payment_status, order_status } = _convertstatus(oldOrder.total_price, (oldOrder.paid + validate.add_pay))
    // validate.debt = debt;
    // validate.payment_status = payment_status;
    // validate.order_status = order_status;
    // validate.paid = oldOrder.paid + validate.add_pay

    const result = await Order.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldOrder = await Order.findById(id)
        .select("-createdAt -updatedAt -warehouse -company")
        .populate("create_by", "name")
        .populate("supplier", "name")
    return oldOrder
}

export const list = async ({ query: { code = "", name = "", status, limit = 10, page = 1, warehouse }, user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    const q = { code, name }
    if (q) conditions = searchNameCode(q)

    if (status) conditions.order_status = status
    conditions.warehouse = warehouse ? warehouse : currentUser.warehouse
    if (!conditions.warehouse) throw new ParamError("Thiếu tên Kho!")

    const { offset } = getPagination(page, limit)
    const result = await Order.find(conditions)
        .select("-createdAt -updatedAt -warehouse -company")
        .populate("create_by", "name")
        .populate("supplier", "name")
        .sort({ createdAt: -1 })
        .skip(offset)
    const total = await Order.countDocuments(conditions)
    return getPaginData(result, total, page)
}