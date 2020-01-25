"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const fs_1 = require("fs");
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
        .filter(item => {
        if (item.length > 1 && words.check(item.toLowerCase())) {
            return item.toLowerCase();
        }
    });
};
let storeTags = (imagePath, tags) => {
    return new Promise((res, rej) => {
        console.log("tags " + JSON.stringify(tags));
        let joinedTags = " " + tags.join(" ") + " ";
        console.log("joined tags " + JSON.stringify(joinedTags));
        const row = db.prepare('INSERT INTO Tags (path, tags) VALUES (?, ?)').run(imagePath, joinedTags);
        console.log(row);
        res();
    });
};
let index = (imagePath) => {
    fs_1.promises.stat(imagePath)
        .then(stats => {
        if (stats.isDirectory()) {
            return fs_1.promises.readdir(imagePath)
                .then(files => Promise.all(files.map(file => indexSingleFile(`${imagePath}/${file}`))));
        }
        else if (stats.isFile()) {
            return indexSingleFile(imagePath);
        }
        else {
            console.error("Cannot search for that");
        }
    });
};
let indexSingleFile = (imagePath) => {
    return fs_1.promises.readFile(imagePath)
        .then(image => {
        return tesseract_js_1.default.recognize(image, 'eng', { logger: m => console.log(m) }).then(({ data: { text } }) => {
            return storeTags(imagePath, analyzeText(text));
        });
    })
        .catch(error => console.error(error));
};
let search = (tag) => {
    const row = db.prepare('SELECT path FROM Tags WHERE tags LIKE ?').all(` %${tag}% `); //TODO using LIKE is pretty flaky
    console.log(row);
};
let command = process.argv[2];
if (command === "index") {
    index(process.argv[3]);
}
else if (command === "search") {
    search(process.argv[3]);
}
//# sourceMappingURL=index.js.map