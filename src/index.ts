import Tesseract from "tesseract.js"
import * as fs from "fs"
import isWord from 'is-word'
const words = isWord('american-english')
import betterSqlite3 from 'better-sqlite3'
const db = betterSqlite3('meme-tags.db')
db.prepare(`CREATE TABLE IF NOT EXISTS Tags (
  path TEXT,
  tags TEXT
)`).run()

let analyzeText = (text: string) => {
  return text.split(/\s+/)
    .map(item => {
      if (item.length > 1 && words.check(item.toLowerCase())) {
        return item.toLowerCase()
      }
    })
}

let storeTags = (imagePath: string, tags: string[]) => {
  const row = db.prepare('INSERT INTO Tags (path, tags) VALUES (?, ?)').run(imagePath, tags.join(" "))
  console.log(row)
}

fs.readFile(process.argv[2], (err, image) => {
  if (err) {
    console.error(err)
    return
  }
  Tesseract.recognize(
    image,
    'eng',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    storeTags(process.argv[2], analyzeText(text))
  })
})
