"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const fs = __importStar(require("fs"));
const is_word_1 = __importDefault(require("is-word"));
const words = is_word_1.default('american-english');
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const db = better_sqlite3_1.default('meme-tags.db');
db.prepare(`CREATE TABLE IF NOT EXISTS Tags (
  path TEXT,
  tags TEXT
)`).run();
let analyzeText = (text) => {
    return text.split(/\s+/)
        .map(item => {
        if (item.length > 1 && words.check(item.toLowerCase())) {
            return item.toLowerCase();
        }
    });
};
let storeTags = (imagePath, tags) => {
    const row = db.prepare('INSERT INTO Tags (path, tags) VALUES (?, ?)').run(imagePath, tags.join(" "));
    console.log(row);
};
fs.readFile(process.argv[2], (err, image) => {
    if (err) {
        console.error(err);
        return;
    }
    tesseract_js_1.default.recognize(image, 'eng', { logger: m => console.log(m) }).then(({ data: { text } }) => {
        storeTags(process.argv[2], analyzeText(text));
    });
});
//# sourceMappingURL=index.js.map