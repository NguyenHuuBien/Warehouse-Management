import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../config/errors.js"
import Bill from "../models/Bill.js"
import Order from "../models/Order.js"
import { convertCode } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { searchNameCode } from "../utils/search.js"
import { createBill, updateBill } from "../validations/BillValidations.js"
import { isObjectId } from "../validations/index.js"
import ProductSupplier from "../models/ProductSupplier.js"
import Product from "../models/Product.js"

const countProduct = async (order) => {
    let totalPrice = 0
    const products = order.products
    await Promise.all(products.map(async product => {
        const productSupplier = await ProductSupplier.findById(product.product)
        if (!productSupplier) throw new ParamError("Sản phẩm không tồn tại!")
        totalPrice += productSupplier.price_import * product.number
    }))
    return totalPrice * (1 - parseFloat(order.discount) / 100)
}

const convertPaymentStatus = (totalPrice, paid) => {
    let debt = 0
    let payment_status = 0
    if (paid < 0) throw new ParamError("Số tiền trả không hợp lê!")
    if (paid > 0 && paid < totalPrice) {
        debt = totalPrice - paid
        payment_status = 1
    } else {
        paid = totalPrice
        payment_status = 2
    }
    return { totalPrice, paid, payment_status, debt }
}

export const create = async ({ user, body }) => {
    const validate = await createBill.validateAsync(body)
    if (!validate.order) throw new ParamError("Thiếu đơn hàng!")
    const oldOrder = await Order.findById(validate.order)
    if (!oldOrder) throw new NotFoundError("Đơn hàng không tồn tại!")
    if (oldOrder.order_status == 1) throw new ParamError("Nhà cung cấp chưa xác nhận đơn hàng!")
    const oldBill = await Bill.findOne({ order: validate.order })
    if (oldBill) throw new ParamError("Đơn hàng này đã có hóa đơn!")

    validate.total_price = await countProduct(oldOrder)
    const { totalPrice, paid, payment_status, debt } = convertPaymentStatus(validate.total_price, validate.paid ? parseFloat(validate.paid) : 0);
    validate.total_price = totalPrice;
    validate.paid = paid;
    // validate.payment_status = payment_status;
    validate.debt = debt;
    validate.create_by = user._id
    validate.warehouse = oldOrder.warehouse
    const countBill = await Bill.countDocuments()
    validate.code = convertCode("HD", countBill)
    await Order.findByIdAndUpdate(validate.order, { have_bill: 1 })

    const result = await Bill.create(validate)
    return result
}

export const update = async ({ params, body, user }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateBill.validateAsync(body)

    const oldBill = await Bill.findById(id)
    if (oldBill.paid == oldBill.total_price) throw new ParamError("Đơn hàng đã được thanh toán đầy đủ!")
    const { paid, payment_status, debt } = convertPaymentStatus(oldBill.total_price, validate.paid ? parseFloat(validate.paid) : 0);
    validate.paid = paid;
    // validate.payment_status = payment_status;
    validate.debt = debt;

    await Bill.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")

    const oldBill = await Bill.findById(id)
        .select("-updatedAt")
        .populate({
            path: "order",
            populate: [
                { path: "products.product", select: "name" },
                { path: "create_by", select: "name" },
                { path: "supplier", select: "name" },
                { path: "warehouse", select: "name" }
            ]
        })
        .populate("create_by", "name")
        .populate("warehouse", "name")
    return oldBill
}

export const list = async ({ query: { code, supplier, payment_status, limit = 10, page = 1, warehouse }, user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    const q = { code }
    if (q) conditions = searchNameCode(q)

    if (payment_status) conditions.payment_status = payment_status
    // if (currentUser.warehouse) conditions.warehouse = new mongoose.Types.ObjectId(currentUser.warehouse)
    if (warehouse) conditions.warehouse = new mongoose.Types.ObjectId(warehouse)
    // if (!conditions.warehouse) throw new ParamError("Thiếu kho!")

    const { offset } = getPagination(page, limit)
    let result = await Bill.find(conditions)
        .select("-updatedAt")
        .populate({
            path: "order",
            populate: [
                { path: "products.product", select: "name" },
                { path: "create_by", select: "name" },
                { path: "supplier", select: "name" },
                { path: "warehouse", select: "name" }
            ]
        })
        .populate("create_by", "name")
        .populate("warehouse", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)

    if (supplier) {
        result = result.filter(data => {
            if (data.order && data.order.supplier && data.order.supplier._id) {
                let supplierId = data.order.supplier._id;
                return supplier.toString() === supplierId.toString();
            }
        })
    }
    const total = result.length
    return getPaginData(result, total, page)
}
export const listNoPage = async ({ query: { code, payment_status, limit = 10, page = 1, warehouse }, user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    // const q = { code }
    // if (q) conditions = searchNameCode(q)

    // if (payment_status) conditions.payment_status = payment_status
    if (currentUser.warehouse) conditions.warehouse = new mongoose.Types.ObjectId(currentUser.warehouse)
    if (warehouse) conditions.warehouse = new mongoose.Types.ObjectId(warehouse)
    // if (!conditions.warehouse) throw new ParamError("Thiếu kho!")
    // conditions.company = currentUser.company

    // const { offset } = getPagination(page, limit)
    const result = await Bill.find(conditions)
        .select("-updatedAt")
        .populate({
            path: "order",
            populate: [
                { path: "products.product", select: "name" },
                { path: "create_by", select: "name" },
                { path: "supplier", select: "name" },
                { path: "warehouse", select: "name" }
            ]
        })
        .populate("create_by", "name")
        .populate("warehouse", "name")
        .sort({ createdAt: -1 })
    // .limit(limit)
    // .skip(offset)
    // const total = await Bill.countDocuments(conditions)
    // return getPaginData(result, total, page)
    return result
}
