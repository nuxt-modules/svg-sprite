import fs  from 'fs-extra';
import path  from 'path';

import {
    writeSVG,
    readSVG,
    optimizeSVG,
    convertToSymbol,
    isSVGFile,
    wrap,
} from './svg';

const sprites = {};

export function generateName(name) {
    return name
        .toLowerCase()
        .replace(/\.svg$/, '')
        .replace(/[^a-z0-9-]/g, '-');
}

function registerSymbol(sprite, symbol) {
    sprites[sprite].symbols[symbol.name] = symbol;
}

async function newIcon(file, sprite, fileName) {
    const name = await generateName(fileName);
    const raw_content = await readSVG(file);
    const optimize_content = await optimizeSVG(name, raw_content)
    const symbol = await convertToSymbol(name, optimize_content);

    await registerSymbol(sprite, {
        name,
        path: file,
        content: symbol,
    })
}

async function createSprite(name, source) {
    const files = await fs.readdir(source);
    if (!sprites[name]) {
        sprites[name] = {
            name,
            symbols: {},
        };
    }
    for (let file of files) {
        const $path = path.join(source, file)
        const iconName = generateName(file);

        if (isSVGFile(file) && !sprites[name].symbols[iconName]) {
            await newIcon($path, name, iconName);
        }
    }
}

async function writeSprites(directory) {
    for (let name in sprites) {
        await writeSprite(name, directory);
    }
}

async function writeSprite(name, directory) {
    if (!sprites[name]) {
        return;
    }

    let symbols = Object.values(sprites[name].symbols)
        .map(s => s.content)
        .join('\n');

    const svg = wrap(symbols)
    
    await writeSVG(
        path.join(directory, `${name}.svg`),
        svg
    )
}

export async function addIcon(file, { input, output, defaultSprite }) {
    const arr = file.replace(input + path.sep, '').split(path.sep);
    const sprite = arr.length == 2 ? arr[0] : defaultSprite;

    if (!sprites[sprite]) {
        sprites[sprite] = {
            name: sprite,
            symbols: {},
        };
    }

    await newIcon(file, sprite, arr[arr.length - 1]);

    await writeSprite(sprite, output);
}

export async function invalidateIcon(file, { input, output, defaultSprite }) {
    const arr = file.replace(input + path.sep, '').split(path.sep);
    const sprite = arr.length == 2 ? arr[0] : defaultSprite;
    const icon = generateName(arr[arr.length - 1]);

    delete sprites[sprite].symbols[icon];
    
    const spriteFile = path.join(output, sprite + '.svg');
    if (await fs.exists(spriteFile)) {
        await fs.unlink(spriteFile);
    }

    await writeSprite(sprite, output);
}

export async function invalidateSprite(file, { input, output }) {
    const arr = file.replace(input + path.sep, '').split(path.sep);
    const sprite = arr[arr.length - 1]

    delete sprites[sprite];
    
    const spriteFile = path.join(output, sprite + '.svg');
    if (await fs.exists(spriteFile)) {
        await fs.unlink(spriteFile);
    }
}

export async function generateSprite({ input, output, defaultSprite }) {
    const files = await fs.readdir(input);
    let hasDefaultSprite = false;

    for (let file of files) {
        const source = path.join(input, file)
        if (isSVGFile(file)) {
            hasDefaultSprite = true;
        }
        const stat = await fs.lstat(source);
        if (stat.isDirectory()) {
            await createSprite(file, source);
        }
    }

    if (hasDefaultSprite) {
        await createSprite(defaultSprite, input);
    }

    await writeSprites(output);
}
