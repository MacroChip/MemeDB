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
let analyzeText = (text) => {
    text.split(/\s+/)
        .forEach(item => {
        if (item.length > 1 && words.check(item.toLowerCase())) {
            console.log(item.toLowerCase());
        }
    });
};
fs.readFile(process.argv[2], (err, image) => {
    if (err) {
        console.error(err);
        return;
    }
    tesseract_js_1.default.recognize(image, 'eng', { logger: m => console.log(m) }).then(({ data: { text } }) => {
        // console.log("Text: " + text)
        analyzeText(text);
    });
});
//# sourceMappingURL=index.js.map