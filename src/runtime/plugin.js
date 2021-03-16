import svgSprite from '~svg-sprite-runtime'

const SPRITES = {
<%= options.sprites.map(key => `"${key}": () => import('${relativeToBuild(options.output)}/${key}.svg')`).join(',') %>
}

export default function(context, inject) {
    inject('svgSprite', svgSprite({
        importSprite: key => SPRITES[key] ? SPRITES[key]() : Promise.resolve(""),
        defaultSprite: '<%= options.defaultSprite %>',
        spriteClassPrefix: '<%= options.spriteClassPrefix %>',
        spriteClass: '<%= options.elementClass %>',
    }))
}

