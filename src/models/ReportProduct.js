import mongoose from "mongoose";

const reportProductSchema = mongoose.Schema({
    month: { type: Number },
    year: { type: Number },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    begin_inventory_quantity: { type: Number, default: 0 },
    begin_inventory_value: { type: Number, default: 0 },

    current_period_quantity_in: { type: Number, default: 0 },
    current_period_value_in: { type: Number, default: 0 },

    current_period_quantity_out: { type: Number, default: 0 },
    current_period_value_out: { type: Number, default: 0 },

    current_period_quantity_return: { type: Number, default: 0 },
    current_period_value_return: { type: Number, default: 0 },

    end_inventory_quantity: { type: Number, default: 0 },
    end_inventory_value: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false })

const ReportProduct = mongoose.model("ReportProduct", reportProductSchema)
export default ReportProduct