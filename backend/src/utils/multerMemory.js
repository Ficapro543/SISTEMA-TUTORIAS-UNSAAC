const multer = require('multer');

// Configure multer to store files in memory as Buffers
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept only PDF
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos PDF'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
