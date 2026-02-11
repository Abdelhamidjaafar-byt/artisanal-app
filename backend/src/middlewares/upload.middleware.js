import multer from "multer";
import path from "path";

import fs from "fs";

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Sanitize filename: remove spaces, newlines, and non-ASCII characters
        const sanitized = file.originalname
            .replace(/\s+/g, "_")
            .replace(/[\n\r]/g, "")
            .replace(/[^\x00-\x7F]/g, "");
        cb(null, `${Date.now()}-${sanitized}`);
    },
});

// Check file type
const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Error: Images Only!");
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
});

export default upload;
