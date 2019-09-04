'use strict'

/**
 * @author marinewater
 * https://github.com/svg/svgo/pull/976
 */

const JSAPI = require('svgo/lib/svgo/jsAPI.js')

exports.type = 'full'
exports.active = true
exports.description = 'inlines svg definitions'

/**
 * plugin options
 * @typedef {{onlyUnique: boolean}} Params
 */
exports.params = {
  onlyUnique: false
}

/**
 * replaces use tag with the corresponding definitions
 * if onlyUnique = true, replaces only use tags with definitions referred to only once
 * @param {Object} document
 * @param {Params} params
 * @returns {Object}
 */
exports.fn = function (document, params) {
  const defs = document.querySelector('defs')
  const uses = document.querySelectorAll('use')

  if (!uses) {
    return document
  }

  const useCount = _countUses(uses)

  for (let i = 0; i < uses.length; i++) {
    let hrefItem = uses[i].attr('xlink:href')
    if (!hrefItem) {
      hrefItem = uses[i].attr('href')
    }
    const href = hrefItem.value

    if (params.onlyUnique === true && useCount[href] > 1) {
      continue
    }

    const x = uses[i].hasAttr('x') ? uses[i].attr('x').value : null
    const y = uses[i].hasAttr('y') ? uses[i].attr('y').value : null

    let attrValue = null
    if (x && y) {
      attrValue = 'translate(' + x + ', ' + y + ')'
    } else if (x) {
      attrValue = 'translate(' + x + ')'
    }

    let def = _findById(defs, href.match(idRegex)[1])
    if (!def) {
      continue
    }
    if (params.onlyUnique === true && useCount[href] === 1) {
      def = _replaceElement(def)
    }

    for (const key in uses[i].attrs) {
      if (uses[i].attrs.hasOwnProperty(key) && key !== 'x' && key !== 'y' && key !== 'xlink:href' && key !== 'href') {
        def.addAttr(uses[i].attrs[key])
      }
    }

    if (attrValue) {
      const g = new JSAPI({
        elem: 'g',
        attrs: {
          transform: {
            name: 'transform',
            value: attrValue,
            prefix: null,
            local: 'transform'
          }
        },
        content: [def]
      })
      _replaceElement(uses[i], g)
    } else {
      _replaceElement(uses[i], def)
    }
  }

  if (params.onlyUnique === false) {
    for (const element in useCount) {
      if (useCount.hasOwnProperty(element) && useCount[element] > 1) {
        const tags = document.querySelectorAll(element)
        for (let j = 0; j < tags.length; j++) {
          tags[j].removeAttr('id')
        }
      }
    }
  }

  _removeDefs(document, params)

  return document
}

/**
 * removes defs tag from the svg if possible
 * @param {Object} document
 * @param {Object} params
 * @private
 */
function _removeDefs (document, params) {
  if (params.onlyUnique === false || document.querySelector('defs').content.length === 0) {
    _replaceElement(document.querySelector('defs'))
  }
}

/**
 * counts the number of uses of definitions
 * @param {Array} elements
 * @returns {Object<string, number>}
 * @private
 */
function _countUses (elements) {
  return elements.reduce(function (result, item) {
    let hrefItem = item.attr('xlink:href')
    if (!hrefItem) {
      hrefItem = item.attr('href')
    }
    const href = hrefItem.value

    if (result.hasOwnProperty(href)) {
      result[href]++
    } else {
      result[href] = 1
    }

    return result
  }, {})
}

/**
 * replace element with another
 * if newElement is omitted, oldElement will be removed without replacement
 * @param {Object} oldElement
 * @param {Object} [newElement]
 * @returns {Object}
 * @private
 */
function _replaceElement (oldElement, newElement) {
  const elementIndex = _getElementIndex(oldElement)

  if (newElement) {
    oldElement.parentNode.spliceContent(elementIndex, 1, newElement)
  } else {
    oldElement.parentNode.spliceContent(elementIndex, 1)
  }

  return oldElement
}

/**
 * returns index of the element in the list of siblings
 * returns -1 if element could not be found
 * @param {Object} element
 * @returns {number}
 * @private
 */
function _getElementIndex (element) {
  element.addAttr({
    name: 'data-defs-index',
    value: 'true',
    prefix: '',
    local: 'data-defs-index'
  })

  const index = element.parentNode.content.findIndex(function (contentElement) {
    return contentElement.hasAttr('data-defs-index', 'true')
  })

  element.removeAttr('data-defs-index')

  return index
}

const idRegex = /^#?(\S+)/

/**
 * finds the first appearance of element with id = "id"
 * (querySelector does not seam to handle multiple id ta
 * @param {Object} element
 * @param {string} id
 * @returns {Object|null}
 * @private
 */
function _findById (element, id) {
  if (element.hasAttr('id', id)) {
    return element
  }

  if (element.content) {
    for (let i = 0; i < element.content.length; i++) {
      const result = _findById(element.content[i], id)
      if (result !== null) {
        return result
      }
    }
  }

  return null
}
