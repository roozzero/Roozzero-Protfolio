import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");

// Ensure upload directories exist
const SUBDIRS = ["media", "profiles", "assignments", "submissions", "corrected", "resources"];
for (const sub of SUBDIRS) {
  const dir = path.join(UPLOAD_ROOT, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Blocked dangerous executable extensions
const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".php", ".phtml", ".php3", ".php4", ".php5", ".phps", ".phar",
  ".sh", ".bash", ".bat", ".cmd", ".js", ".mjs", ".vbs", ".ps1", ".py", ".rb",
  ".cgi", ".pl", ".jar", ".war", ".jsp", ".jspx", ".dll", ".so", ".bin"
]);

function createStorage(subfolder: string) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(UPLOAD_ROOT, subfolder);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const randomHex = crypto.randomBytes(16).toString("hex");
      const safeName = `${randomHex}${ext}`;
      cb(null, safeName);
    }
  });
}

function fileFilter(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new Error("Executable or dangerous file types are strictly prohibited."));
  }
  cb(null, true);
}

const maxSizeBytes = parseInt(process.env.MAX_FILE_SIZE || "15728640", 10); // 15MB default

export const uploadMedia = multer({
  storage: createStorage("media"),
  limits: { fileSize: maxSizeBytes },
  fileFilter
});

export const uploadProfile = multer({
  storage: createStorage("profiles"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"].includes(ext)) {
      return cb(new Error("Only image formats (JPG, PNG, WEBP, SVG) are allowed for profiles."));
    }
    cb(null, true);
  }
});

export const uploadSubmission = multer({
  storage: createStorage("submissions"),
  limits: { fileSize: maxSizeBytes },
  fileFilter
});

export const uploadAssignmentFile = multer({
  storage: createStorage("assignments"),
  limits: { fileSize: maxSizeBytes },
  fileFilter
});

export const uploadResourceFile = multer({
  storage: createStorage("resources"),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter
});

export const uploadCorrectedFile = multer({
  storage: createStorage("corrected"),
  limits: { fileSize: maxSizeBytes },
  fileFilter
});
