import mongoose from "mongoose";
import { IMPORT_STATUS, PAYMENT_STATUS } from "../config/constant.js";

const warehouseImportSchema = mongoose.Schema({
    code: { type: String },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        number: { type: Number },
        price_import: { type: Number },
        unit: { type: String },
    }],
    discount: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    paid: { type: Number, default: 0 }, //đã thanh toán
    debt: { type: Number, default: 0 }, // còn nợ
    payment_status: { type: Number, enum: PAYMENT_STATUS, default: 0 },
    import_status: { type: Number, enum: IMPORT_STATUS, default: 1 },
    create_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true, versionKey: false })

const WarehouseImport = mongoose.model("WarehouseImport", warehouseImportSchema)
export default WarehouseImport