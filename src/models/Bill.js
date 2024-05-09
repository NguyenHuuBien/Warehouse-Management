import mongoose from "mongoose";
import { PAYMENT_STATUS } from "../config/constant.js";

//total_price, payment status, debt, paid
const billSchema = mongoose.Schema({
    code: { type: String },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    create_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    total_price: { type: Number, default: 0 },
    paid: { type: Number, default: 0 }, //đã thanh toán
    debt: { type: Number, default: 0 }, // còn nợ
    payment_status: { type: Number, enum: PAYMENT_STATUS, default: 0 },
}, { timestamps: true, versionKey: false })

const Bill = mongoose.model("Bill", billSchema)
export default Bill