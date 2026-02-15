import multer from "multer";

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed"));
    }
  },
});
