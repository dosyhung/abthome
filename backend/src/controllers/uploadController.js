const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file định dạng hình ảnh.'));
    }
  }
});

const uploadLogo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không tìm thấy file tải lên' });
  }
  
  // Xoá ảnh cũ nếu có truyền url
  if (req.body.old_url) {
    try {
      const oldFilename = path.basename(req.body.old_url);
      const oldFilePath = path.join(uploadDir, oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    } catch (error) {
      console.error('Lỗi khi xoá ảnh cũ:', error);
    }
  }

  // Trả về URI của ảnh
  const fileUrl = `/public/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl, message: 'Upload ảnh thành công' });
};

module.exports = {
  upload,
  uploadLogo
};
