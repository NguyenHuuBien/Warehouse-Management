import mongoose from "mongoose";
import { IMPORT_STATUS } from "../config/constant.js";

const warehouseImportSchema = mongoose.Schema({
    code: { type: String },
    old_export: { type: mongoose.Schema.Types.ObjectId, ref: "WareHouseExport" },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        number: { type: Number },
    }],
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    update_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    reason: { type: String },
    reason_cancel: { type: String, default: "" },
    import_status: { type: Number, enum: IMPORT_STATUS, default: 1 }
}, { timestamps: true, versionKey: false })

const WarehouseImport = mongoose.model("WarehouseImport", warehouseImportSchema)
export default WarehouseImport