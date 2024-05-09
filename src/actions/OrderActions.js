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
import Supplier from "../models/Supplier.js"
import { confirmOrder } from "../utils/mail.js"
import Company from "../models/Company.js"
import ProductSupplier from "../models/ProductSupplier.js"
import { _createProduct } from "./ProductActions.js"

const _validateProducts = async (products, warehouse, supplier, isCreate = true) => {
    // let totalPrice = 0
    let listProduct
    listProduct = JSON.parse(products) //string -> json -> array
    for (let product of listProduct) {
        if (product.number <= 0) throw new ParamError("Số lượng nhập phải lớn hơn 0")
        if (!product.product) throw new ParamError("Thiếu id sản phẩm!")
        const oldProductSupplier = await ProductSupplier.findOne({ _id: new mongoose.Types.ObjectId(product.product) })
        if (!oldProductSupplier) throw new ParamError("Sản phẩm này không tồn tại")
        product = await productValidate.validateAsync(product)
        // if (isCreate) await _createProduct(oldProductSupplier)
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
export const increaseProduct = async (products, warehouse) => {
    await Promise.all(products.map(async product => {
        const oldProduct = await Product.findOne({
            _id: product.product,
            warehouse: warehouse,
        })
        await Product.findOneAndUpdate({
            _id: product.product,
            warehouse: warehouse,
        }, {
            number: product.number + oldProduct.number
        })
    }))
}

export const decreaseProduct = async (products, warehouse) => {
    await Promise.all(products.map(async product => {
        const oldProduct = await Product.findOne({
            _id: new mongoose.Types.ObjectId(product.product),
            warehouse: new mongoose.Types.ObjectId(warehouse),
        })
        if (product.number > oldProduct.number) throw new ParamError("Số lượng mua hiện tại đã vượt quá số lượng trong kho!")

        await Product.findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(product.product),
            warehouse: new mongoose.Types.ObjectId(warehouse),
        }, {
            number: oldProduct.number - product.number
        })
    }))
}

export const create = async ({ body, user, file }) => {
    const validate = await createOrder.validateAsync(body)

    if (!body.products) throw new ParamError("Không có sản phẩm nào!")
    const newProduct = await _validateProducts(body.products, validate.warehouse, validate.supplier)
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
    const oldSupplier = await Supplier.findById(validate.supplier)
    const oldCompany = await Company.findById(user.company)
    await confirmOrder(oldSupplier.email, oldCompany.name)

    const result = await Order.create(validate)
    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateOrder.validateAsync(body)

    if (user.roles == "supplier" && validate.order_status) {
        if (validate.order_status != 3) throw new ParamError("Bạn chỉ có quyền xác nhận đơn hàng!")
        const result = await Order.findByIdAndUpdate(id, { order_status: 3 })
        return true
    }

    const oldOrder = await Order.findById(id)
    if (!oldOrder) throw new NotFoundError("Không tìm thấy đơn nhập hàng!")
    if (oldOrder.order_status == 4 || oldOrder.order_status == 5) throw new ParamError("Đơn hàng này đã được giao thành công hoặc đã hủy!")
    // if (oldOrder.payment_status == 1) throw new ParamError("Đơn hàng đã thanh toán đấy đủ!")

    if (validate.products) {
        const newProduct = await _validateProducts(validate.products)
        validate.products = newProduct.products
    } else {
        validate.products = oldOrder.products
    }
    if (validate.order_status == 4) {
        validate.products.map(async product => {
            const oldProductSupplier = await ProductSupplier.findById(product.product)
                .select("-createdAt -updatedAt -_id")
                .lean()
            oldProductSupplier.product = product.product
            oldProductSupplier.warehouse = oldOrder.warehouse
            oldProductSupplier.number = product.number
            await _createProduct(oldProductSupplier)
        })
    }
    // await increaseProduct(validate.products, oldOrder.warehouse)

    const result = await Order.findByIdAndUpdate(id, validate)
    return true
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldOrder = await Order.findById(id)
        .select("-updatedAt -warehouse -company")
        .populate("create_by", "name")
        .populate("supplier", "name")
        .populate({
            path: "products.product",
            select: "name"
        })
    return oldOrder
}

export const list = async ({
    query: { order_status, code = "", startDate, endDate, date, create_by, product, supplier, limit = 10, page = 1, warehouse },
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
    if (supplier) conditions.supplier = new mongoose.Types.ObjectId(supplier)
    if (product) conditions["products.product"] = new mongoose.Types.ObjectId(product)
    if (order_status) conditions.order_status = order_status

    if (currentUser.warehouse) conditions.warehouse = currentUser.warehouse
    if (warehouse) conditions.warehouse = warehouse
    conditions.company = currentUser.company
    const { offset } = getPagination(page, limit)
    const result = await Order.find(conditions)
        .select("-updatedAt -warehouse -company")
        .populate("create_by", "name")
        .populate("supplier", "name")
        .populate("products.product", "name")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
    const total = await Order.countDocuments(conditions)
    return getPaginData(result, total, page)
}

export const listNoPage = async ({
    query: { order_status, code = "", startDate, endDate, create_by, product, supplier, limit = 10, page = 1, warehouse },
    user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    // const q = { code }
    // if (q) conditions = searchNameCode(q)

    // if (startDate && endDate) conditions.createdAt = { $gte: new Date(startDate), $lt: new Date(endDate) }
    // if (create_by) conditions.create_by = new mongoose.Types.ObjectId(create_by)
    // if (supplier) conditions.supplier = new mongoose.Types.ObjectId(supplier)
    // if (product) conditions["products.product"] = new mongoose.Types.ObjectId(product)
    // if (order_status) conditions.order_status = order_status
    if (currentUser.warehouse) conditions.warehouse = currentUser.warehouse
    if (warehouse) conditions.warehouse = warehouse

    // conditions.warehouse = warehouse ? new mongoose.Types.ObjectId(warehouse) : new mongoose.Types.ObjectId(currentUser.warehouse)
    conditions.company = currentUser.company
    // const { offset } = getPagination(page, limit)
    const result = await Order.find(conditions)
        .select("-updatedAt -warehouse -company")
        .populate("create_by", "name")
        .populate("supplier", "name")
        .populate("products.product", "name")
        .sort({ createdAt: -1 })
    // .skip(offset)
    // const total = await Order.countDocuments(conditions)
    // return getPaginData(result, total, page)
    return result
}