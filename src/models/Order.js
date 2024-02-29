import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_METHOD } from "../config/constant.js";

const orderSchema = mongoose.Schema({
    address: { type: String },
    phone: { type: String },
    code: { type: String },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        number: { type: Number },
    }],
    discount: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    payment_method: { type: Number, enum: PAYMENT_METHOD, default: 1 },
    order_status: { type: Number, enum: ORDER_STATUS, default: 1 },
    create_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true, versionKey: false })

const Order = mongoose.model("Order", orderSchema)
export default Order