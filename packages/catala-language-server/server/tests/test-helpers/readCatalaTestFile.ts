import { readFileSync } from 'fs';
import * as path from 'path';

export const TEST_FILE_NAMES = [
  'combination_declStruct_declScope_scope',
  'scope_and_definition',
  'scope_decl',
  'struct_decl',
  'struct_decl_with_1_field',
] as const;
export type FixtureFiles = typeof TEST_FILE_NAMES[number];

export function readCatalaFile(fileName: FixtureFiles) {
  let filePath = `../fixtures/${fileName}.catala_en`;
  filePath = path.resolve(__dirname, filePath);
  const result = readFileSync(filePath, 'utf-8');
  return result;
}
