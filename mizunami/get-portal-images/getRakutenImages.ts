import puppeteer from 'puppeteer'
import * as fs from 'fs';
import { getProductsFromCsv } from "./utils";

const browser = await puppeteer.launch({ headless: false })
const page = await browser.newPage()

const targets = getProductsFromCsv()

// td[valign="top"] > div[irc="Image"] img
for (const target of targets) {
  console.log(target.satofuruCode)
  await page.goto(`https://item.rakuten.co.jp/f212083-mizunami/${target.satofuruCode}`)

  const images = await page.$$('td[valign="top"] > div[irc="Image"] img')
  console.log(`img found: ${images.length}`)

  for (let i = 0; i < images.length; i++) {
    const src = await images[i]?.evaluate(el => el.getAttribute('src'))
    if (!src) continue

    await fs.promises.mkdir(`../../playground/mizunami/portal-images/${target.satofuruCode}`, { recursive: true })
    const response = await fetch(src)
    const buffer = await response.arrayBuffer()
    await fs.promises.writeFile(`../../playground/mizunami/portal-images/${target.satofuruCode}/rakuten_${target.satofuruCode}_${i + 1}.jpg`, Buffer.from(buffer))
    console.log(src)
  }
}

await browser.close()
