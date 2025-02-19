import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

interface Product {
    satofuruCode: string;
    name: string;
    maker: string;
    price: number;
    choiceId: string;
}

export function getProductsFromCsv(): Product[] {
    const csvContent = fs.readFileSync('./source.csv', 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
    });

    const products = records.map((record: any) => ({
        satofuruCode: record['さとふるコード'],
        name: record['返礼品名'],
        maker: record['事業者名'],
        price: parseInt(record['寄附金額']),
        choiceId: record['チョイスお礼の品ID']
    }));

    return products;
}

export function extractCodeFromName(name: any): string | null {
  if (typeof name !== 'string') {
    return null;
  }
  const match = name.match(/【(\d+)】/);
  return match ? match[1] : null;
}
