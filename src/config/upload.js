import multer from 'multer'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv"
dotenv.config()
// import * from "../uploads"

const imgconfig = multer.diskStorage({
    // destination: (req, file, callback) => {
    //     callback(null, 'src/uploads');
    // },
    // filename: (req, file, callback) => {
    //     callback(null, `image-${Date.now()}.${file.originalname}`);
    // },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image")) {
            return callback(new Error("Chỉ cho phép hình ảnh!"), false);
        }
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('File không hợp lệ!'), false);
        }
        if (file.size > 1024 * 1024 * 2) {
            return callback(new Error('Kích thước file không được vượt quá 2MB!'), false);
        }
        callback(null, true);
    }
});

export const upload = multer({
    storage: imgconfig,
})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export const uploadImage = async (file, fileName) => {
    try {
        let newFileName = fileName ? fileName : file.originalname.replace(/\s/g, '_');

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ public_id: newFileName }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });

            if (file instanceof Buffer) {
                uploadStream.end(file); //nếu dữ liệu file là các byte thì uploadStream lên luôn
            } else {
                fs.createReadStream(file.path).pipe(uploadStream); // còn không thì đọc file theo đường dẫn rồi mới upload
            }
        });

        return uploadResult.url;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Upload File lỗi!!!');
    }
};

