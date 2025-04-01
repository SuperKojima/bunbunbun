import { copyImages, removeImagesWithHighNumbers, renameImages } from './utils';

// スクリプトの実行
async function main() {
  await copyImages();
  await removeImagesWithHighNumbers();
  await renameImages();
}

await main();
