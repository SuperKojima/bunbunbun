import * as fs from 'node:fs/promises';
import * as path from 'path';

export async function copyImages() {
  try {
    // originalディレクトリのパス
    const originalDir = path.join(__dirname, 'original');
    // s1ディレクトリのパス
    const s1Dir = path.join(__dirname, 's1');

    // s1ディレクトリが存在しない場合は作成
    await fs.mkdir(s1Dir, { recursive: true });

    // originalディレクトリ内のすべてのフォルダを取得
    const folders = await fs.readdir(originalDir);

    for (const folder of folders) {
      const folderPath = path.join(originalDir, folder);
      const stats = await fs.stat(folderPath);

      if (stats.isDirectory()) {
        // s1ディレクトリ内に対応するフォルダを作成
        const s1FolderPath = path.join(s1Dir, folder);
        await fs.mkdir(s1FolderPath, { recursive: true });

        // フォルダ内の画像ファイルを取得
        const files = await fs.readdir(folderPath);

        for (const file of files) {
          if (file.endsWith('.jpg')) {
            const sourcePath = path.join(folderPath, file);
            const destPath = path.join(s1FolderPath, file);

            // 画像ファイルをコピー
            await fs.copyFile(sourcePath, destPath);
          }
        }
      }
    }

    console.log('画像のコピーが完了しました。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

export async function removeImagesWithHighNumbers() {
  try {
    const s1Dir = path.join(__dirname, 's1');
    const folders = await fs.readdir(s1Dir);

    for (const folder of folders) {
      const folderPath = path.join(s1Dir, folder);
      const stats = await fs.stat(folderPath);

      if (stats.isDirectory()) {
        const files = await fs.readdir(folderPath);

        for (const file of files) {
          if (file.endsWith('.jpg')) {
            // ファイル名から末尾の数字を抽出
            const match = file.match(/-(\d+)\.jpg$/);
            if (match) {
              const number = parseInt(match[1]);
              if (number >= 9) {
                // 9以上の番号を持つファイルを削除
                const filePath = path.join(folderPath, file);
                await fs.unlink(filePath);
                console.log(`削除: ${file}`);
              }
            }
          }
        }
      }
    }

    console.log('9以上の番号を持つ画像の削除が完了しました。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

export async function renameImages() {
  try {
    const s1Dir = path.join(__dirname, 's1');
    const folders = await fs.readdir(s1Dir);

    for (const folder of folders) {
      const folderPath = path.join(s1Dir, folder);
      const stats = await fs.stat(folderPath);

      if (stats.isDirectory()) {
        const files = await fs.readdir(folderPath);
        // 番号順にソートして逆順に処理
        const sortedFiles = files
          .filter(file => file.endsWith('.jpg'))
          .sort((a, b) => {
            const numA = parseInt(a.match(/-(\d+)\.jpg$/)?.[1] || '0');
            const numB = parseInt(b.match(/-(\d+)\.jpg$/)?.[1] || '0');
            return numB - numA;
          });

        // まず全てのファイルに一時的な名前を付ける
        for (const file of sortedFiles) {
          const match = file.match(/^(.+)-(\d+)\.jpg$/);
          if (match) {
            const oldPath = path.join(folderPath, file);
            const tempName = `temp_${file}`;
            const tempPath = path.join(folderPath, tempName);
            await fs.rename(oldPath, tempPath);
          }
        }

        // 一時ファイルを最終的な名前にリネーム
        const tempFiles = await fs.readdir(folderPath);
        const sortedTempFiles = tempFiles
          .filter(file => file.startsWith('temp_'))
          .sort((a, b) => {
            const numA = parseInt(a.match(/-(\d+)\.jpg$/)?.[1] || '0');
            const numB = parseInt(b.match(/-(\d+)\.jpg$/)?.[1] || '0');
            return numB - numA;
          });

        for (const tempFile of sortedTempFiles) {
          const match = tempFile.match(/^temp_(.+)-(\d+)\.jpg$/);
          if (match) {
            const baseName = match[1];
            const number = parseInt(match[2]);
            const oldPath = path.join(folderPath, tempFile);
            let newName;

            if (number === 1) {
              // XXXXNNN-1 → XXXXNNN
              newName = `${baseName}.jpg`;
            } else {
              // XXXXNNN-n → XXXXNNN-(n-1)
              newName = `${baseName}-${number - 1}.jpg`;
            }

            const newPath = path.join(folderPath, newName);
            await fs.rename(oldPath, newPath);
            console.log(`リネーム: ${tempFile.replace('temp_', '')} → ${newName}`);
          }
        }
      }
    }

    console.log('画像のリネームが完了しました。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}


