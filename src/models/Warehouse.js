import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
    name: { type: String, require: true },
    name_search: { type: String },
    phone: { type: String },
    code: { type: String },
    address: { type: String },
    status: { type: Number, default: 1 },
    company: {type: mongoose.Schema.ObjectId, ref: 'Company'}
}, { timestamps: true, versionKey: false })

const Warehouse = mongoose.model("Warehouse", warehouseSchema)
export default Warehouse