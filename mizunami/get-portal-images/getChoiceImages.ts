import puppeteer from 'puppeteer'
import * as fs from 'fs';
import { getProductsFromCsv, extractCodeFromName } from "./utils";

const browser = await puppeteer.launch({ headless: false })
const page = await browser.newPage()
await page.goto('https://www.furusato-tax.jp/city/product/21208')

// 商品一覧
// #all_product > .citygoods_goods > ul > li
// #all_product > .citygoods_goods > ul > li > a
// #all_product > .citygoods_goods > ul > li > button (data-text)

// ナビゲーション
// #all_product > .nv-pager > .nv-pager__next > a (.-disabled)

const targets = getProductsFromCsv().map(product => ({
  ...product,
  url: ''
}))

let products = []
let isLastPage = false

let currentPage = 1

do {
  // 商品一覧の要素を取得
  products = await page.$$('#all_product > .citygoods_goods > ul > li');

  // 各商品の詳細を分析
  for (const product of products) {
    // 商品リンクを取得
    const link = await product.$('a');
    const href = await link?.evaluate(el => el.getAttribute('href'));

    // お気に入りボタンのテキストを取得
    const button = await product.$('button');
    const buttonText = await button?.evaluate(el => el.getAttribute('data-text'));

    // 商品コードを取得
    const satofuruCode = extractCodeFromName(buttonText)
    if (!satofuruCode) continue

    const target = targets.find(target => target.satofuruCode === satofuruCode)
    if (!target) continue

    target.url = href || ''
  }

  // 欲しい分だけ取ってループ終わらせる
  const caught = targets.filter(target => target.url).length

  console.log({
    page: currentPage,
    caught: `${caught} / ${targets.length}`
  })

  if (caught === targets.length) {
    break
  }

  // ナビゲーションの要素を取得
  const navigation = await page.$('#all_product > .nv-pager > .nv-pager__next > a');
  const href = await navigation?.evaluate(el => el.getAttribute('href')) || '#';
  isLastPage = href === '#';

  if (!isLastPage) {
    currentPage++
    await page.goto(`https://www.furusato-tax.jp${href}`);
  }
} while (!isLastPage)

// #thumbnails li > img
for (const target of targets) {
  if (!target.url) {
    console.log(`SKIP: ${target.satofuruCode}`)
    continue
  }

  await page.goto(`https://www.furusato-tax.jp${target.url}`)
  const images = await page.$$('#thumbnails li > img')
  for (let i = 0; i < images.length; i++) {
    const src = await images[i]?.evaluate(el => el.getAttribute('src'))
    if (!src) continue

    await fs.promises.mkdir(`../../playground/mizunami/portal-images/${target.satofuruCode}`, { recursive: true })
    const response = await fetch(src)
    const buffer = await response.arrayBuffer()
    await fs.promises.writeFile(`../../playground/mizunami/portal-images/${target.satofuruCode}/choice_${target.satofuruCode}_${i + 1}.jpg`, Buffer.from(buffer))
    console.log(src)
  }
  
}

await browser.close()
