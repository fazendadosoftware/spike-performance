// From screen coordinates to SVG
export const screenToSVG = (svg, x, y) => { // svg is the svg DOM node
  const pt = svg.createSVGPoint()
  pt.x = x
  pt.y = y
  const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse())
  return { x: Math.floor(cursorPt.x), y: Math.floor(cursorPt.y) }
}

// From SVG coordinates to screen
export const svgToScreen = el => {
  const rect = el.getBoundingClientRect()
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
}

// Getting the view box
export const viewBox = svg => {
  const box = svg.getAttribute('viewBox')
  return {
    x: parseInt(box.split(' ')[0], 10),
    y: parseInt(box.split(' ')[1], 10),
    width: parseInt(box.split(' ')[2], 10),
    height: parseInt(box.split(' ')[3], 10)
  }
}
