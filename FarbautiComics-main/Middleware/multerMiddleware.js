import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });
  
  export default upload;

  export const checkImageUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Image is required ' });
    }
    req.body.image = req.file.path;
    next();
};

  // Para updates: si viene imagen nueva la usa, si no conserva la existente del body
  export const checkImageUploadOptional = (req, res, next) => {
    if (req.file) {
      req.body.image = req.file.path;
    }
    next();
};

  export const checkPostImageUpload = (req, res, next) => {
    if (req.file) {
      req.body.image = req.file.path;
    }
    
    next();
};
