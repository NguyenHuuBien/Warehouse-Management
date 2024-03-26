import mongoose from "mongoose";
import { UNIT } from "../config/constant.js";

const productSchema = mongoose.Schema({
    name: { type: String },
    name_search: { type: String },
    // code: { type: String },
    sku: { type: String },
    description: { type: String },
    unit: { type: String, enum: UNIT, default: "cái" }, //đơn vị tính
    price_import: { type: Number },
    price: { type: Number },
    number: { type: Number },
    position: { type: String },
    size: {
        length: { type: Number },
        width: { type: Number },
        height: { type: Number },
    },
    weight: { type: Number },
    color: { type: String },
    status: { type: Number, default: 1 },
    img: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
}, { timestamps: true, versionKey: false })

const Product = mongoose.model("Product", productSchema)
export default Product