import Tesseract from "tesseract.js"
import { promises as fs } from "fs"
import isWord from 'is-word'
const words = isWord('american-english')
import betterSqlite3 from 'better-sqlite3'
const db = betterSqlite3('meme-tags.db')
db.prepare(`CREATE TABLE IF NOT EXISTS Tags (
  path TEXT,
  tags TEXT
)`).run()

let analyzeText = (text: string) => { //how is a capitalized word getting through there?
  return text.split(/\s+/)
    .filter(item => {
      if (item.length > 1 && words.check(item.toLowerCase())) {
        return item.toLowerCase()
      }
    })
}

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
        const files = await fs.readdir(imagePath)
        return await Promise.all(files.map(file => indexSingleFile(`${imagePath}/${file}`)))
      } else if (stats.isFile()) {
        return indexSingleFile(imagePath)
      } else {
        console.error("Cannot search for that")
      }
    })
}

let indexSingleFile = async (imagePath: string) => {
  try {
    const image = await fs.readFile(imagePath)
    const { data: { text } } = await Tesseract.recognize(image, 'eng', { logger: m => console.log(m) })
    return storeTags(imagePath, analyzeText(text))
  } catch (error) {
    return console.error(error)
  }
}

let search = (tag: string) => {
  const row = db.prepare('SELECT path FROM Tags WHERE tags LIKE ?').all(` %${tag}% `) //TODO using LIKE is pretty flaky
  console.log(row)
}

let command: string = process.argv[2]
if (command === "index") {
  index(process.argv[3])
} else if (command === "search") {
  search(process.argv[3])
}
