import mongoose from "mongoose"
import { NotFoundError, ParamError } from "../config/errors.js"
import Product from "../models/Product.js"
import Warehouse from "../models/Warehouse.js"
import { convertCode, convertNameSearch } from "../utils/convert.js"
import { getPaginData, getPagination } from "../utils/paging.js"
import { searchNameCode } from "../utils/search.js"
import { createProduct, createProductSupplier, updateProduct } from "../validations/ProductValidations.js"
import { isObjectId } from "../validations/index.js"
import { uploadImage } from "../config/upload.js"
import Unit from "../models/Unit.js"
import Category from "../models/Category.js"
import ProductSupplier from "../models/ProductSupplier.js"

export const _createProduct = async (validate) => {
    if (!validate.warehouse) throw new ParamError("Thiếu tên kho!")
    const oldWarehouse = await Warehouse.findById(validate.warehouse)
    if (!oldWarehouse) throw new ParamError("Kho không tồn tại!")
    const oldProductSupllier = await ProductSupplier.findById(validate.product)
        .select("-createdAt -updatedAt")
    if (!oldProductSupllier) throw new ParamError("Sản phẩm này nhà cung cấp không bán!")
    const oldProduct = await Product.findOne({ product: validate.product, warehouse: validate.warehouse })
    validate = {
        ...validate,
        price: oldProduct ? oldProduct.price : validate.price ? validate.price : 0,
        number: oldProduct ? oldProduct.number + validate.number || 0 : validate.number ? validate.number : 0,
        position: oldProduct ? oldProduct.position : validate.position ? validate.position : 0,
        name: oldProductSupllier.name,
        name_search: oldProductSupllier.name_search,
        sku: oldProductSupllier.sku,
        desciption: oldProductSupllier.desciption ? oldProductSupllier.desciption : "",
        unit: oldProductSupllier.unit,
        price_import: oldProductSupllier.price_import,
        size: oldProductSupllier.size,
        weight: oldProductSupllier.weight,
        color: oldProductSupllier.color,
        img: oldProductSupllier.img ? oldProductSupllier.img : "",
        category: oldProductSupllier.category,
        supplier: oldProductSupllier.supplier,
    }
    if (oldProduct) {
        const result = await Product.findByIdAndUpdate(oldProduct._id, validate)
        return result
    } else {
        const result = await new Product(validate).save()
        return result
    }

}

export const createFromSupplier = async ({ body, user, file }) => {
    if (body.size) body.size = JSON.parse(body.size)
    let validate = await createProductSupplier.validateAsync(body)

    const result = await _createProduct(validate)
    return result
}

export const create = async ({ body, user, file }) => {
    if (body.size) body.size = JSON.parse(body.size)
    let validate = await createProduct.validateAsync(body)

    if (!validate.name) throw new ParamError("Thiếu tên Sản phẩm!")
    validate.name_search = convertNameSearch(validate.name)
    const oldName = await Product.findOne({ name_search: validate.name_search, warehouse: validate.warehouse })
    if (oldName) throw new ParamError("Tên Sản phẩm này đã tồn tại!")

    if (!validate.category) throw new ParamError("Thiếu Loại sản phẩm!")
    const oldCategory = await Category.findById(validate.category)
    if (!oldCategory) throw new NotFoundError("Loại sản phẩm này không tồn tại!")
    // if (!validate.supplier) throw new ParamError("Thiếu tên nhà cung cấp!")
    if (!validate.warehouse) throw new ParamError("Thiếu tên kho!")
    const oldWarehouse = await Warehouse.findById(validate.warehouse)
    if (!oldWarehouse) throw new ParamError("Kho không tồn tại!")
    if (!user._id) throw new ParamError("Thiếu thông tin người tạo!")
    validate.created_by = user._id
    if (!validate.position) throw new ParamError("Thiếu vị trí của sản phẩm")
    if (!validate.unit) throw new ParamError("Thiếu đơn vị tính")
    const olđUnit = await Unit.findById(validate.unit)
    if (!olđUnit) throw new ParamError("Đơn vị tính này không tồn tại!")

    const countProductSupplier = await ProductSupplier.countDocuments()
    const countProduct = await Product.countDocuments()
    validate.sku = convertCode("SP", (countProduct + countProductSupplier))
    // if (!validate.sku) throw new ParamError("Thiếu mã sku")
    // const oldSku = await Product.findOne({ sku: validate.sku })
    // if (oldSku) throw new ParamError("Mã sku này đã tồn tại!")

    if (file) {
        const img = await uploadImage(file, "huyenxinhgai")
        validate.img = img
    }
    const result = await new Product(validate).save()
    return result
}
export const update = async ({ body, user, params, file }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    if (body.size) body.size = JSON.parse(body.size)
    const validate = await updateProduct.validateAsync(body)

    const oldProduct = await Product.findById(id)
    if (!oldProduct) throw new ParamError("Sản phẩm không tồn tại!")


    if (validate.name && validate.name != oldProduct.name) {
        const oldName = await Warehouse.findOne({ name: validate.name })
        if (oldName) throw new Error("Tên Sản phẩm này đã tồn tại!")
        validate.name_search = convertNameSearch(validate.name)
    }

    if (validate.unit) {
        const oldUnit = await Unit.findById(validate.unit)
        if (!oldUnit) throw new ParamError("Đơn vị tính này không tồn tại!")
    }
    if (validate.category) {
        const oldCategory = await Category.findById(validate.category)
        if (!oldCategory) throw new NotFoundError("Loại sản phẩm này không tồn tại!")

    }

    if (file) {
        const img = await uploadImage(file)
        validate.img = img
    }

    await Product.findByIdAndUpdate(id, validate)
    return true

}

export const get = async ({ params }) => {
    const { id } = params
    if (!id) throw new NotFoundError("Thiếu id!")
    if (!isObjectId(id)) throw new ParamError("Sai id!")
    const oldProduct = await Product.findById(id)
        .select("-createdAt -updatedAt -name_search")
        .populate("supplier", "name")
        // .populate("created_by", "name")
        .populate("warehouse", "name")
        .populate("product", "name")
        .populate("unit", "name")
        .populate("category", "name")
    return oldProduct
}

export const list = async ({ query: { supplier, sku = "", name = "", category, status, limit = 10, page = 1, warehouse }, user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    const q = { sku, name }
    if (q) conditions = searchNameCode(q)

    if (category) conditions.category = new mongoose.Types.ObjectId(category)
    if (supplier) conditions.supplier = new mongoose.Types.ObjectId(supplier)
    if (currentUser.roles != "admin") conditions.status = 1
    if (status) conditions.status = status
    if (currentUser.warehouse) conditions.warehouse = new mongoose.Types.ObjectId(currentUser.warehouse)
    if (warehouse) conditions.warehouse = new mongoose.Types.ObjectId(warehouse)
    const { offset } = getPagination(page, limit)
    const result = await Product.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .populate("warehouse", "name")
        // .populate("created_by", "name")
        .populate("category", "name")
        .populate("product", "name")
        .populate("unit", "name")
        .populate("supplier", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
    const total = await Product.countDocuments(conditions)
    return getPaginData(result, total, page)
}

export const listNoPage = async ({ query: { supplier, sku = "", name = "", category, status, limit = 10, page = 1, warehouse }, user: currentUser }) => {
    //tìm kiếm theo tên và mã
    let conditions = {}
    // const q = { sku, name }
    // if (q) conditions = searchNameCode(q)

    // if (category) conditions.category = new mongoose.Types.ObjectId(category)
    // if (supplier) conditions.supplier = new mongoose.Types.ObjectId(supplier)
    // conditions.status = 1
    // if (status) conditions.status = status
    if (currentUser.warehouse) conditions.warehouse = new mongoose.Types.ObjectId(currentUser.warehouse)
    if (warehouse) conditions.warehouse = new mongoose.Types.ObjectId(warehouse)
    // conditions.company = currentUser.company
    // console.log("condition", conditions);
    // const { offset } = getPagination(page, limit)
    const result = await Product.find(conditions)
        .select("-createdAt -updatedAt -name_search")
        .populate("warehouse", "name")
        // .populate("created_by", "name")
        .populate("category", "name")
        .populate("unit", "name")
        .populate("product", "name")
        .populate("supplier", "name")
        .sort({ createdAt: -1 })
    // .limit(limit)
    // .skip(offset)
    // const total = await Product.countDocuments(conditions)
    // return getPaginData(result, total, page)
    return result
}

