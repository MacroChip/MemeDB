import Tesseract from "tesseract.js"
import { promises as fs } from "fs"
import path from "path"
import isWord from 'is-word'
import { join } from 'path';
const words = isWord('american-english')
import betterSqlite3 from 'better-sqlite3'
let db;

let prepFiles = async () => {
  const DATA_DIR = join(process.env.APPDATA || process.env.HOME, '.memedb');
  await fs.stat(DATA_DIR).catch(e => {
    console.log(`First run; making data directory at ${DATA_DIR}`);
    return fs.mkdir(DATA_DIR);
  });
  db = betterSqlite3(join(DATA_DIR, 'meme-tags.db'))
  db.prepare(`CREATE TABLE IF NOT EXISTS Tags (
    path TEXT,
    tags TEXT
  )`)
    .run()
}

let processTags = (tags: string) =>
  tags.split(/\s+/)
    .filter(item => item.length > 1)
    .map(item => item.toLowerCase())
    .filter(item => words.check(item))

let storeTags = (imagePath: string, tags: string[]) => {
  return new Promise((res, rej) => {
    console.log("tags " + JSON.stringify(tags))
    let joinedTags = " " + tags.join(" ") + " "
    console.log("joined tags " + JSON.stringify(joinedTags))
    const row = db.prepare('INSERT INTO Tags (path, tags) VALUES (?, ?)').run(imagePath, joinedTags)
    console.log(row)
    res()
  })
}

let index = (imagePath: string) => {
  fs.stat(imagePath)
    .then(async stats => {
      if (stats.isDirectory()) {
        return indexDirectory(imagePath)
      } else if (stats.isFile()) {
        return indexSingleFile(imagePath)
      } else {
        console.error(`Cannot index ${imagePath}`)
      }
    })
}

let indexDirectory = async (imagePath: string) => {
  const files = await fs.readdir(imagePath)
  return await Promise.all(
    files
      .map(file => path.join(imagePath, file))
      .map(joinedPath => index(joinedPath))
  )
}

let indexSingleFile = async (imagePath: string) => {
  try {
    const image = await fs.readFile(imagePath)
    const { data: { text } } = await Tesseract.recognize(image, 'eng', { logger: m => console.log(m) })
    return storeTags(imagePath, processTags(text))
  } catch (error) {
    return console.error(error)
  }
}

let search = (tag: string) => {
  const row = db.prepare('SELECT path FROM Tags WHERE tags LIKE ?').all(` %${tag}% `) //TODO using LIKE is pretty flaky
  console.log(`Search results for "${tag}":`)
  row.forEach((item: { path: string }) => {
    console.log(`file://${item.path}`)
  })
}

(async () => {
  await prepFiles();
  let command = process.argv[2];
  let parameter = process.argv[3];
  if (!command || !parameter) {
    console.log(`Invalid usage. Usage is "index ABSOLUTE-PATH" or "search KEYWORD"`);
    return;
  }
  if (command === "index") {
    index(parameter);
  } else if (command === "search") {
    search(parameter);
  } else {
    console.log(`Unrecognized command ${process.argv[2]}. Options are index and search.`);
  }
})()
