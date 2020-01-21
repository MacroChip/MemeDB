import Tesseract from "tesseract.js"
import * as fs from "fs"
import isWord from 'is-word'
const words = isWord('american-english')

let analyzeText = (text: string) => {
  text.split(/\s+/)
    .forEach(item => {
      if (item.length > 1 && words.check(item.toLowerCase())) {
        console.log(item.toLowerCase())
      }
    })
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
        // console.log("Text: " + text)
        analyzeText(text)
      })
})
