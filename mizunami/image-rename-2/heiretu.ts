import { readdir, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

async function flattenImages() {
  const nestedDir = './nested';
  const flattenDir = './flatten';

  // flattenディレクトリが存在しない場合は作成
  if (!existsSync(flattenDir)) {
    await mkdir(flattenDir, { recursive: true });
  }

  try {
    // nestedディレクトリ内のすべてのサブディレクトリを取得
    const subdirs = await readdir(nestedDir, { withFileTypes: true });

    for (const subdir of subdirs) {
      if (subdir.isDirectory()) {
        const subdirPath = join(nestedDir, subdir.name);

        // サブディレクトリ内のファイルを取得
        const files = await readdir(subdirPath, { withFileTypes: true });

        for (const file of files) {
          if (file.isFile()) {
            const srcPath = join(subdirPath, file.name);
            const destPath = join(flattenDir, file.name);

            // ファイルをコピー
            await Bun.write(destPath, Bun.file(srcPath));
            console.log(`コピー完了: ${srcPath} → ${destPath}`);
          }
        }
      }
    }

    console.log('すべての画像ファイルのコピーが完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// スクリプトを実行
flattenImages();
