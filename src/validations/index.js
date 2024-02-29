import mongoose from 'mongoose';

export const isObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}