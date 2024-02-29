import { IMPORT_STATUS, PAYMENT_STATUS } from "../config/constant.js"
import { NotFoundError, ParamError } from "../config/errors.js"
import Product from "../models/Product.js"
import WarehouseImport from "../models/WarehouseImport.js"
import { convertCode } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { searchNameCode } from "../utils/search.js"
import { createWarehouseImport, productValidate, updateWarehouseImport } from "../validations/WarehouseImportValidations.js"
import { isObjectId } from "../validations/index.js"

const _validateProducts = async (products) => {
    let totalPrice = 0
    let listProduct
    listProduct = JSON.parse(products) //string -> json -> array
    for (let product of listProduct) {
        if (!product.product) throw new ParamError("Thiếu id sản phẩm!")
        const oldProduct = await Product.findById(product.product)
        if (!oldProduct) throw new ParamError("Sản phẩm này không tồn tại")
        product = await productValidate.validateAsync(product)
        totalPrice = totalPrice + product.price_import * product.number
    }
    return { totalPrice, products: listProduct }
}

const _convertstatus = (totalPrice, paid) => {
    let payment_status
    let import_status
    let debt = totalPrice - paid
    if (debt <= 0) {
        debt = 0
        payment_status = PAYMENT_STATUS.PAID
        import_status = IMPORT_STATUS.DONE
    } else if (debt == paid) {
        payment_status = PAYMENT_STATUS.NOT_PAY
    } else {
        payment_status = PAYMENT_STATUS.PAY_PART
    }

    return { debt, payment_status, import_status }
}

export const create = async ({ body, user, file }) => {
    const validate = await createWarehouseImport.validateAsync(body)

    if (!body.products) throw new ParamError("Không có sản phẩm nào!")
    const newProduct = await _validateProducts(body.products)
    validate.products = newProduct.products

    const oldImport = await WarehouseImport.countDocuments()
    validate.code = convertCode("NH", oldImport)

    validate.total_price = newProduct.totalPrice
    if (validate.discount) {
        validate.total_price = newProduct.totalPrice * (1 - validate.discount / 100)
    }

    const { debt, payment_status, import_status } = _convertstatus(validate.total_price, validate.paid);
    validate.debt = debt;
    validate.payment_status = payment_status;
    validate.import_status = import_status;

    if (!validate.create_by) validate.create_by = user._id
    if (!validate.supplier) throw new ParamError("Thiếu nhà cung cấp!")
    if (!validate.warehouse) throw new ParamError("Thiếu tên kho!")
    if (!validate.company) validate.company = user.company
    const result = await WarehouseImport.create(validate)
    return result
}

export const update = async ({ body, user, params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const validate = await updateWarehouseImport.validateAsync(body)

    const oldWarehouseImport = await WarehouseImport.findById(id)
    if (!oldWarehouseImport) throw new NotFoundError("Không tìm thấy đơn nhập hàng!")
    if (validate.add_pay < 0 || validate.add_pay > oldWarehouseImport.total_price) throw new ParamError("Số tiền trả thêm không hợp lệ!")

    const { debt, payment_status, import_status } = _convertstatus(oldWarehouseImport.total_price, (oldWarehouseImport.paid + validate.add_pay))
    validate.debt = debt;
    validate.payment_status = payment_status;
    validate.import_status = import_status;

    const result = await WarehouseImport.findByIdAndUpdate(id, validate)
    return result
}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldWarehouseImport = await WarehouseImport.findById(id)
        .select("-createdAt -updatedAt -warehouse -company")
    return oldWarehouseImport
}

export const list = async ({ query: { q, status, limit = 10, page = 1, warehouse }, user: currentUser }) => {
    let conditions = {}

    if (q) conditions = searchNameCode(q)
    if (status) conditions.import_status = status
    conditions.warehouse = warehouse ? warehouse : currentUser.warehouse
    if (!conditions.warehouse) throw new ParamError("Thiếu tên Kho!")

    const { offset } = getPagination(page, limit)
    const result = await WarehouseImport.find(conditions)
        .select("-createdAt -updatedAt -warehouse -company")
        .sort({ createdAt: -1 })
        .skip(offset)
    const total = await WarehouseImport.countDocuments(conditions)
    return getPaginData(result, total, page)
}