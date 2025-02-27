import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const COLUMNS = [
  'local_government_code',
  'old_postal_code', 
  'postal_code',
  'prefecture_name_kana',
  'city_name_kana',
  'town_name_kana',
  'prefecture_name',
  'city_name',
  'town_name',
  'has_multiple_postal_codes',
  'has_koaza_banchi',
  'has_chome',
  'has_multiple_codes_by_koaza_banchi',
  'has_updated',
  'has_reason'
];

const csvData = fs.readFileSync('god.csv');
const records = parse(csvData) as string[][];

const values = records
    .map((record) => record.map((value) => value.trim()))
    .map((record) => record.map((value, index) => index < 9 ? `'${value}'` : value))
    .map((record) => record.join(','))
    .map(record => `(${record})`)

const chunks = [];
while (values.length > 0) {
  const chunk = values.splice(0, 100);
  chunks.push(chunk);
}

const sql = chunks
    .map(chunk => `INSERT INTO postal_codes (${COLUMNS.join(', ')}) VALUES ${chunk.join(', ')};`)
    .join('\n');

fs.writeFileSync('insert.sql', sql);
