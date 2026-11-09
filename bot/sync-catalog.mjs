import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = await readFile(resolve('src/data/mockStore.ts'), 'utf8');
const marker = 'export const INITIAL_PRODUCTS: Product[] = ';
const start = source.indexOf(marker) + marker.length;
const end = source.indexOf('\n];', start) + 2;
if (start < marker.length || end < 2) throw new Error('Не удалось найти INITIAL_PRODUCTS в src/data/mockStore.ts');
const products = Function(`return (${source.slice(start, end)})`)();
await writeFile(resolve('bot/catalog.json'), `${JSON.stringify(products, null, 2)}\n`);
console.log(`Каталог бота обновлён: ${products.length} товаров.`);
