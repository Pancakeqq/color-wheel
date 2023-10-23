const WIDTH = 700;
const HEIGHT = 400;

const SCALE = 1.8;
const MIDDLE_X = WIDTH / 2;
const MIDDLE_Y = HEIGHT / 2;

const LIGHTNESS = 0.5;

let ctx;

let current_point = {}
let points = []


var slider = document.getElementById("mySlider");
        
    slider.oninput = lightnessSliderChange
    const canvas = document.getElementById('canvas');
    console.log('asas')
    setContext(canvas.getContext('2d'));

    drawColorWheel();
    drawInstructions();


    const rgb_inputs = document.querySelectorAll('.rgb-input');
    for (let i = 0; i < rgb_inputs.length; i++) {
      rgb_inputs[i].addEventListener('input', (event) =>{
        const rgb = {}
        rgb.r = document.getElementById('color-r').value
        rgb.g = document.getElementById('color-g').value
        rgb.b = document.getElementById('color-b').value
        getPointFromRGB(rgb)
      });
    }

    const hls_input = document.getElementById('hex-input')
    hls_input.addEventListener('input', (event)=>{
      getPointFromHEX(event.target.value)
    })

    canvas.addEventListener('click', (event) => {
      drawPickedColor(event.offsetX, event.offsetY);
      drawMousePosition(event.offsetX, event.offsetY);
    });

    const combination_select = document.getElementById('combination-input') 

    combination_select.addEventListener('change' , (event)=>{
      redrawPoints()
    })


 function setContext(context) {
  ctx = context;
}



/**
 * Draws the color wheel at the center of the canvas.
 */
 function drawColorWheel() {
  if (!ctx) throw new Error('Context not found, please call setContext().');

  // A circle has 360 degrees, corresponding to all possible hue values (0 - 360)
  for (let h = 0; h <= 360; h++) {
    // The color's saturation is expressed as a percentage (0 - 100)
    for (let s = 0; s <= 100; s++) {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${h}, ${s}%, ${LIGHTNESS * 100}%)`;
      // To calculate the position of the color on the wheel we use the sine and cosine as explained on
      // https://en.wikipedia.org/wiki/Trigonometric_functions.
      // Low saturation colors are drawn close to the center of the wheel while high saturation colors are drawn further
      // away. The whole wheel is scaled to make the diameter bigger than 200 pixels (1 pixel per 1% saturation as the
      // radius).
      const posX = MIDDLE_X + Math.cos(degreeToRadian(h)) * s * SCALE;
      const posY = MIDDLE_Y - Math.sin(degreeToRadian(h)) * s * SCALE;
      // At that position we draw a little dot that gets bigger the further away from the center it lies (scales with s).
      // We draw a full circle from 0 to 360 degrees which is the same as 0 to 2π radians.
      ctx.arc(posX, posY, SCALE * s / 100 + 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  drawColorWheelBorder();
}

 function getPointFromHEX(hex){
  if(hex.length < 7){
    return;
  }
  const hsl = hexToHSL(hex);
  changeSlider(hsl.l)
  const x = MIDDLE_X + Math.cos(degreeToRadian(hsl.h)) * hsl.s * SCALE;
  const y = MIDDLE_Y - Math.sin(degreeToRadian(hsl.h)) * hsl.s * SCALE;
  drawMainPoint(x,y);
  drawPickedColor(x,y)
  drawCombination(x, y);
  drawCombinationColors(points)
  setRGBinputsToHex(hex);
  
}

 function lightnessSliderChange(event){
  const l = event.target.value
  var output = document.getElementById("sliderValue");
  output.innerHTML = l;
  drawPickedColor(current_point.x, current_point.y)
  drawCombination(current_point.x, current_point.y)
  drawCombinationColors(points)
}

function changeSlider(l) {
  var slider = document.getElementById("mySlider");
  slider.value = l
  var output = document.getElementById("sliderValue");
  output.innerHTML = slider.value;
}

 function getPointFromRGB({r, g, b}){
const hex = rgbToHex({r,g,b});
setHexInputToRGB({r, g, b});
const hsl = hexToHSL(hex);
changeSlider(hsl.l)
  const x = MIDDLE_X + Math.cos(degreeToRadian(hsl.h)) * hsl.s * SCALE;
  const y = MIDDLE_Y - Math.sin(degreeToRadian(hsl.h)) * hsl.s * SCALE;
  drawMainPoint(x,y);
  drawPickedColor(x,y)
  drawCombination(x, y);
  drawCombinationColors(points)

}

function drawCombination(x,y){
  let combination = document.getElementById('combination-input').value;
  const radius = Math.sqrt(Math.pow(x - MIDDLE_X, 2) + Math.pow(y - MIDDLE_Y, 2));
  const angle = Math.atan2(y - MIDDLE_Y, x - MIDDLE_X);

  points = [];
  if(combination === 'Monochromatic'){
    const oppositeAngle = angle;
    let x2 = MIDDLE_X + radius * Math.cos(oppositeAngle);
    let y2 = MIDDLE_Y + radius * Math.sin(oppositeAngle);
    const color = getColorForPoint(x2, y2);
    color.l += 0.15;
    points.push({x: x2, y:y2, color: color});

  }else if(combination === 'Complementary'){
    const oppositeAngle = angle + Math.PI;
    let x2 = MIDDLE_X + radius * Math.cos(oppositeAngle);
    let y2 = MIDDLE_Y + radius * Math.sin(oppositeAngle);
    points.push({x: x2, y:y2, color: getColorForPoint(x2, y2)});

  } else if(combination === 'Tetradic'){
    let newAngle = angle + Math.PI;
    let x2 = MIDDLE_X + radius * Math.cos(newAngle);
    let y2 = MIDDLE_Y + radius * Math.sin(newAngle);
    points.push({x: x2, y:y2, color: getColorForPoint(x2, y2)});
    newAngle = angle + Math.PI/2;
    x2 = MIDDLE_X + radius * Math.cos(newAngle);
    y2 = MIDDLE_Y + radius * Math.sin(newAngle);
    points.push({x: x2, y:y2, color: getColorForPoint(x2, y2)});
    newAngle = angle - Math.PI/2;
    x2 = MIDDLE_X + radius * Math.cos(newAngle);
    y2 = MIDDLE_Y + radius * Math.sin(newAngle);
    points.push({x: x2, y:y2, color: getColorForPoint(x2, y2)});

  } else if(combination === 'Triadic'){
    let newAngle = angle + (2*Math.PI)/3;
    let x2 = MIDDLE_X + radius * Math.cos(newAngle);
    let y2 = MIDDLE_Y + radius * Math.sin(newAngle);
    points.push({x: x2, y:y2, color: getColorForPoint(x2, y2)});
    newAngle = angle - (2*Math.PI)/3;
    x2 = MIDDLE_X + radius * Math.cos(newAngle);
    y2 = MIDDLE_Y + radius * Math.sin(newAngle);
    points.push({x: x2, y:y2, color: getColorForPoint(x2, y2)});
  } else if(combination === 'Analogous'){
    let newAngle = angle + Math.PI/6;
    let x2 = MIDDLE_X + radius * Math.cos(newAngle);
    let y2 = MIDDLE_Y + radius * Math.sin(newAngle);
    points.push({x: x2, y:y2, color: getColorForPoint(x2, y2)});
    newAngle = angle - Math.PI/6;
    x2 = MIDDLE_X + radius * Math.cos(newAngle);
    y2 = MIDDLE_Y + radius * Math.sin(newAngle);
    points.push({x: x2, y:y2, color: getColorForPoint(x2, y2)});
  }

  points.forEach((point)  =>{
    drawSecondaryPoint(point.x, point.y);
  })
  drawCombinationColors(points);
}

/**

 * @param {number} x The relative horizontal (x) position of the cursor on the canvas
 * @param {number} y The relative vertical (y) position of the cursor on the canvas
 */
function drawMainPoint(x, y){
  drawColorWheel();
  current_point.x = x;
  current_point.y = y;
  ctx.beginPath();
  ctx.strokeStyle = '#fffff';
  ctx.lineWidth = 5;
  ctx.arc( x , y , 8, 0, 2 * Math.PI);
  ctx.stroke();
}

function redrawPoints(){
  drawMainPoint(current_point.x, current_point.y);
  drawCombination(current_point.x, current_point.y);
}

function drawSecondaryPoint(x, y){
  ctx.beginPath();
  ctx.strokeStyle = '#fffff';
  ctx.lineWidth = 2;
  ctx.arc( x , y , 6, 0, 2 * Math.PI);
  ctx.stroke();
}

/**
 * Draws a thick invisible border around the color wheel to smooth the outer ring of colors.
 */
function drawColorWheelBorder() {
  ctx.beginPath();
  // Setting the same color as the canvas background makes the border invisible.
  ctx.strokeStyle = '#fefefe';
  ctx.lineWidth = 10;
  // We draw a full circle from 0 to 360 degrees which is the same as 0 to 2π radians.
  ctx.arc(MIDDLE_X, MIDDLE_Y, 100 * SCALE + 5, 0, 2 * Math.PI);
  ctx.stroke();
}

/**
 * Draws the instructions at the bottom of the canvas.
 */
function drawInstructions() {
  if (!ctx) throw new Error('Context not found, please call setContext().');

}

/**
 * Draws the relative position of the mouse cursor at the top right corner of the canvas.
 * @param {number} x The relative horizontal (x) position of the cursor on the canvas
 * @param {number} y The relative vertical (y) position of the cursor on the canvas
 */
function drawMousePosition(x, y) {
  if (!ctx) throw new Error('Context not found, please call setContext().');
  if(getDistanceFromCenter(x,y) >100* SCALE){
    return ;
  }
  drawMainPoint(x, y);
  drawCombination(x,y);
}

/**
 * Draws the currently selected color at the top left corner of the canvas.
 * @param {number} x The relative horizontal (x) position of the cursor on the canvas
 * @param {number} y The relative vertical (y) position of the cursor on the canvas
 */
function drawPickedColor(x, y) {
  if (!ctx) throw new Error('Context not found, please call setContext().');
  if(getDistanceFromCenter(x,y) >100* SCALE){
    return 
  }
  ctx.clearRect(10, 10, 120, 280);
  const color = getColorForPoint(x, y);
  const slider = document.getElementById("mySlider");
  color.l = slider.value/100
  ctx.fillStyle = `hsl(${color.h}, ${color.s * 100}%, ${color.l*100}%)`;
  ctx.fillRect(10, 10, 120, 60);
  ctx.fillStyle = 'black';
  ctx.font = '14px Roboto';
  const rgb = hslToRgb(color);
  ctx.fillText(`#${rgbToHex(rgb)}`, 45, 45);
  
  drawColorDetails(color);
}

function drawCombinationColors(points){
  ctx.clearRect(10, 70, 120, 280);
  for(let i = 0; i < points.length; i++ ){
    const slider = document.getElementById("mySlider");
    ctx.fillStyle = `hsl(${points[i].color.h}, ${points[i].color.s * 100}%, ${slider.value}%)`;

    ctx.fillRect(10, 70 + (i * 60), 120, 60);
    ctx.fillStyle = 'black';
    ctx.font = '14px Roboto';
    const rgb = hslToRgb(points[i].color);
    ctx.fillText(`#${rgbToHex(rgb)}`, 45, 105 + (i * 60));
  }
}

function setHexInputToRGB(rgb){
  const hls_input = document.getElementById('hex-input');
  hls_input.value = '#' + rgbToHex(rgb);
}

function setRGBinputsToHex(hex){
  const hsl = hexToHSL(hex);
  hsl.l /= 100;
  hsl.s /= 100;
  const rgb = hslToRgb(hsl);
  document.getElementById('color-r').value =Math.floor(rgb.r);
  document.getElementById('color-g').value = Math.floor(rgb.g);
  document.getElementById('color-b').value = Math.floor(rgb.b);
}
/**
 * Returns the hsl color for the current cursor position.
 * @param {number} x The relative horizontal (x) position of the cursor on the canvas
 * @param {number} y The relative vertical (y) position of the cursor on the canvas
 * @returns {{h: number, s: number, l: number}} The hsl color for the current cursor position
 */
function getColorForPoint(x, y) {
  const dist = getDistanceFromCenter(x, y);

  // If the distance from the center is greater than the 100px radius * the scale, the cursor is not in the color wheel.
  // We return white as the color.
  if (dist > 100 * SCALE) return {h: 0, s: 0, l: 1};

  // The saturation is the distance from the center divided by the scale.
  const s = dist / SCALE;
  // To find the hue base on the x value we have to reverse the following formula
  // x = MIDDLE_X + Math.cos(degreeToRadian(h)) * s * SCALE
  let h = radianToDegree(Math.acos((x - MIDDLE_X) / s / SCALE));
  // Since every x value has 2 possible colors (1 above and 1 below the vertical middle) we need to inverse the hue if
  // the point is lower than the vertical middle. 360 - h is the same as h * -1 (380° - 90° == -90° == 290°) but is
  // better for displaying the hue value.
  const slider = document.getElementById("mySlider");
  if (y > MIDDLE_Y) h = 360 - h;
  return {h, s: s / 100, l: slider.value / 100};
}

/**
 * Draws the color's details at the top left corner of the canvas, below the selected color.
 * @param {{h: number, s: number, l: number}} color The color
 */
function drawColorDetails(color) {

  const rgb = hslToRgb(color);
  const input = document.getElementById("hex-input");
  input.value=`#${rgbToHex(rgb)}`;
  const red = document.getElementById('color-r');
  red.value = Math.floor(rgb.r);
  const green = document.getElementById('color-g');
  green.value = Math.floor(rgb.g);
  const blue = document.getElementById('color-b');
  blue.value = Math.floor(rgb.b);
}

/**
 * Utility functions
 */

/**
 * Returns the distance of the given point (x, y) from the center of the canvas.
 * @param x The relative horizontal value of the point
 * @param y The relative vertical value of the point
 * @returns {number} The distance from the center in pixels
 */
function getDistanceFromCenter(x, y) {
  const offsetX = Math.abs(MIDDLE_X - x);
  const offsetY = Math.abs(MIDDLE_Y - y);
  // We use the Pythagorean theorem (a² + b² = c²) to calculate the distance.
  return Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
}

/**
 * Converts an HSL color to the RGB notation.
 * @param {{h: number, s: number, l: number}} The hsl color to convert
 * @returns {{r: number, g: number, b: number}} The rgb notation
 */
function hslToRgb({h, s, l}) {
  // This formula is documented at https://www.rapidtables.com/convert/color/hsl-to-rgb.html.
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  if (h < 60) return {r: (c + m) * 255, g: (x + m) * 255, b: m * 255};
  if (h < 120) return {r: (x + m) * 255, g: (c + m) * 255, b: m * 255};
  if (h < 180) return {r: m * 255, g: (c + m) * 255, b: (x + m) * 255};
  if (h < 240) return {r: m * 255, g: (x + m) * 255, b: (c + m) * 255};
  if (h < 300) return {r: (x + m) * 255, g: m * 255, b: (c + m) * 255};
  return {r: (c + m) * 255, g: m * 255, b: (x + m) * 255};
}

/**
 * Converts an RGB color to the hexadecimal notation.
 * @param {{r: number, g: number, b: number}} The rgb color to convert
 * @returns {string} The hexadecimal notation
 */
function rgbToHex({r, g, b}) {
  let hexR = Math.floor(r).toString(16);
  // We need to left pad numbers < 16
  if (r < 16) hexR = `0${hexR}`;
  let hexG = Math.floor(g).toString(16);
  if (g < 16) hexG = `0${hexG}`;
  let hexB = Math.floor(b).toString(16);
  if (b < 16) hexB = `0${hexB}`;
  return `${hexR}${hexG}${hexB}`.toUpperCase();
}

function hexToHSL(hex) {

  hex = hex.replace(/^#/, '');

  const bigint = parseInt(hex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const rNormalized = r / 255;
  const gNormalized = g / 255;
  const bNormalized = b / 255;

  const max = Math.max(rNormalized, gNormalized, bNormalized);
  const min = Math.min(rNormalized, gNormalized, bNormalized);

  let lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    saturation = lightness <= 0.5
      ? (max - min) / (max + min)
      : (max - min) / (2 - max - min);

    if (max === rNormalized) {
      hue = (gNormalized - bNormalized) / (max - min);
    } else if (max === gNormalized) {
      hue = 2 + (bNormalized - rNormalized) / (max - min);
    } else {
      hue = 4 + (rNormalized - gNormalized) / (max - min);
    }

    hue *= 60;
    if (hue < 0) hue += 360;
  }

  hue = Math.round(hue);
  saturation = Math.round(saturation * 100);
  lightness = Math.round(lightness * 100);

  return { h: hue, s: saturation, l: lightness };
}

/**
 * Converts an angle in degrees to an angle in radians.
 * @param {number} deg The angle in degrees
 * @returns {number} The angle in radians
 */
function degreeToRadian(deg) {
  return deg * Math.PI / 180;
}

/**
 * Converts an angle in radians to an angle in degrees.
 * @param {number} rad The angle in radians
 * @returns {number} The angle in degrees
 */
function radianToDegree(rad) {
  return rad * 180 / Math.PI;
}
