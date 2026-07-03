// middleware/upload.js
import multer from 'multer';

// Keep the file in memory as a buffer rather than writing it to disk
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Optional limit: 5MB max file size
  }
});

export default upload;