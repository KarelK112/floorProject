//TODO nastavitelná historie - input od uživatele

/* client */ 

// connect to VSB server
var socket = io.connect("http://158.196.218.88:8000/");

// connect to local server
// var socket = io.connect("http://localhost/");

socket.on("connect", function() {
    console.log("You are connected.");
})

/* slider */
var slider = document.getElementById("memoryLimitSlider");
var output = document.getElementById("memoryLimitValue");
output.innerHTML = 5;
// track memory limit - must by multiply by 2 because of data structure
var memoryLimit = (5 * 2) + 2;

slider.oninput = function() {
    memoryLimit = (this.value * 2) + 2;
    output.innerHTML = this.value;
}

/* floor plan */

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// transformation matrix
ctx.transform(1, 0, 0, -1, 10, canvas.height);
// drawing width
ctx.lineWidth = 2.5;

var roomCornersCoords = [[0, 0], [0, 700], [200, 700], [200, 720], [-5, 720], [-5, 1120], 
            [450, 1120], [450, 870], [295, 870], [295, 700], [705, 700], [705, 770], 
            [960, 770], [960, 970], [1160, 970], [1160, 620], [700, 620], [700, 0], [0, 0]];

drawFloorPlan(roomCornersCoords);            
drawTrack();

/* functions */ 

function drawTrack() {
    // multidimensional array for received data 
    var records = [[]];
    var init = true;
    // count of tracked humans
    var human = 1;

    // step event handling
    socket.on("step", function(axisX, axisY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var x = axisX * 100;
        var y = axisY * 100; 
        console.log(x, y);
        drawFloorPlan(roomCornersCoords);
    
        if (init) {
            records[0].unshift(x, y);
            init = false;
        }
        else {
        var helperArray = [];
        for (let row = 0; row < records.length; row++) {
            if (records[row].length != 0) {
                helperArray.push([records[row][0], records[row][1]]);
                drawCircleObject(records[row][0], records[row][1]);
                console.log(records[row]);
                if (records[row].length >= 4) {
                    for (let collum = 0; collum < records[row].length - 3; collum += 2) {
                        drawLine(records[row][collum], records[row][collum + 1], 
                            records[row][collum + 2], records[row][collum + 3]);
                    }
                }
            }
        }

        var distance = [];
        for (let index = 0; index < helperArray.length; index++) {
            distance.push(euclideanDistance(x, y, helperArray[index][0], helperArray[index][1]));
        }

        var indexMinimumDistance = indexOfSmallest(distance);
        if (distance[indexMinimumDistance] <= 200 && distance[indexMinimumDistance] > 0) {
            records[indexMinimumDistance].unshift(x, y);
        } else if (distance[indexMinimumDistance] > 200) {
            records[human] = new Array();
            records[human].unshift(x,y);
            human++;
        } else {
            console.log("You are on the same spot!");
        }
    }

    for (let row = 0; row < records.length; row++) {
        if (records[row].length > memoryLimit) {
            records[row].splice(memoryLimit, records[row].length);
        }
    }
        console.log(records);
        
    })
}

// Line from [x0, y0] to [x, y]
function drawLine(x0, y0, x, y) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawFloorPlan(coordinatesArray) {
    for (let index = 0; index < coordinatesArray.length - 1; index++) {
        drawLine(coordinatesArray[index][0], coordinatesArray[index][1], 
            coordinatesArray[index + 1][0], coordinatesArray[index + 1][1]);
    }
}

// Cirle with radius of 15
function drawCircleObject(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.stroke();
}

// Pythagorean theorem
function euclideanDistance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

function indexOfSmallest(array) {
    var lowest = 0;
    for (let index = 1; index < array.length; index++) {
        if (array[index] < array[lowest]) lowest = index;
    }
    return lowest;
}
