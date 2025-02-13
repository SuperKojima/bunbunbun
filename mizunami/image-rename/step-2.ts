import { readdirSync, renameSync, existsSync, mkdirSync } from "fs";
import { join, basename } from "path";

// パスの設定と確認
const imageDir = join(import.meta.dir, '../../playground/mizunami-images');
console.log('作業ディレクトリ:', imageDir);
console.log('ディレクトリは存在しますか？:', existsSync(imageDir));

// サブディレクトリを含む全てのjpgファイルを取得
function getAllJpgFiles(dir: string): string[] {
  console.log('スキャン中のディレクトリ:', dir);
  
  if (!existsSync(dir)) {
    console.error('エラー: ディレクトリが存在しません:', dir);
    return [];
  }

  let results: string[] = [];
  try {
    const items = readdirSync(dir, { withFileTypes: true });
    console.log('見つかったアイテム数:', items.length);

    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        console.log('サブディレクトリを検索:', item.name);
        results = results.concat(getAllJpgFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.jpg')) {
        console.log('JPGファイルを発見:', item.name);
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error('ディレクトリの読み取り中にエラーが発生:', error);
  }

  return results;
}

// ファイル名から接頭辞を取得する関数
function getPrefix(fileName: string): string | null {
  const match = fileName.match(/^([^_]+)_/);
  return match ? match[1] : null;
}

// メイン処理
console.log('\n=== 処理開始 ===');
const jpgFiles = getAllJpgFiles(imageDir);
console.log('\n見つかったJPGファイル:', jpgFiles.length);

if (jpgFiles.length > 0) {
  console.log('\n=== フォルダ分け処理開始 ===');
  jpgFiles.forEach((oldPath, index) => {
    const fileName = basename(oldPath);
    const prefix = getPrefix(fileName);
    
    console.log(`\n処理中 [${index + 1}/${jpgFiles.length}]:`);
    console.log('ファイル名:', fileName);
    
    if (!prefix) {
      console.log('スキップ: 接頭辞が見つかりません');
      return;
    }

    // 接頭辞のフォルダを作成
    const prefixDir = join(imageDir, prefix);
    if (!existsSync(prefixDir)) {
      try {
        mkdirSync(prefixDir);
        console.log('フォルダを作成:', prefixDir);
      } catch (error) {
        console.error('フォルダ作成失敗:', error);
        return;
      }
    }

    // ファイルを移動
    const newPath = join(prefixDir, fileName);
    console.log('移動先:', newPath);

    if (oldPath === newPath) {
      console.log('スキップ: 同じパスです');
      return;
    }

    try {
      renameSync(oldPath, newPath);
      console.log('移動成功');
    } catch (error) {
      console.error('移動失敗:', error);
    }
  });
}

console.log('\n=== 処理完了 ===');
