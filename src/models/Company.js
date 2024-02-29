import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: { type: String, require: true, unique: true },
    code: { type: String, require: true, unique: true },
    logo: { type: String },
    phone: { type: String, require: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    address: { type: String },
    status: { type: Number, default: 1 },
}, { timestamps: true, versionKey: false });

const Company = mongoose.model('Company', companySchema);

export default Company;