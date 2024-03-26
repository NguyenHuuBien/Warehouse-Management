import mongoose from "mongoose";
import { IMPORT_STATUS } from "../config/constant.js";

const warehouseImportSchema = mongoose.Schema({
    code: { type: String },
    old_export: { type: mongoose.Schema.Types.ObjectId, ref: "WareHouseExport" },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        number: { type: Number },
    }],
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "WareHouse" },
    reason: { type: String },
    import_status: { type: Number, enum: IMPORT_STATUS, default: 1 }
}, { timestamps: true, versionKey: false })

const WarehouseImport = mongoose.model("WarehouseImport", warehouseImportSchema)
export default WarehouseImport