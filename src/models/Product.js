import mongoose from "mongoose";
import { UNIT } from "../config/constant.js";

const productSchema = mongoose.Schema({
    name: { type: String },
    name_search: { type: String },
    code: { type: String },
    sku: { type: String },
    description: { type: String },
    unit: { type: String, enum: UNIT, default: "cái" }, //đơn vị tính
    price_import: { type: Number },
    price: { type: Number },
    number: { type: Number },
    position: { type: String },
    status: { type: Number, default: 1 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true, versionKey: false })

const Product = mongoose.model("Product", productSchema)
export default Product