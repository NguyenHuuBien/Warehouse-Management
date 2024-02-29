import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
    name: { type: String, require: true, },
    name_search: { type: String, require: true, index: true },
    username: { type: String },
    password: { type: String },
    phone: { type: String },
    code: { type: String, require: true, },
    status: { type: Number, default: 1, },
    email: { type: String, },
    address: { type: String, },
    tax_code: { type: String, },
    roles: { type: String, default: 'supplier' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true, versionKey: false });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;