import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, require: true, },
    name_search: { type: String, require: true, index: true },
    status: { type: Number, default: 1 },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true, versionKey: false });

const Category = mongoose.model('Category', categorySchema);

export default Category;