//TODO nastavitelná historie - mazání metodou na Array

/* client */ 

// connect to VSB server
var socket = io.connect("http://158.196.218.88:8000/");

// connect to local server
// var socket = io.connect("http://localhost/");

socket.on("connect", function() {
    console.log("You are connected.");
})

/* floor plan */

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const limit = 10;
// transformation matrix
ctx.transform(1, 0, 0, -1, 10, canvas.height);
// drawing width
ctx.lineWidth = 2.5;

var path = [[0, 0], [0, 700], [200, 700], [200, 720], [-5, 720], [-5, 1120], 
            [450, 1120], [450, 870], [295, 870], [295, 700], [705, 700], [705, 770], 
            [960, 770], [960, 970], [1160, 970], [1160, 620], [700, 620], [700, 0], [0, 0]];

drawTrack();

/* functions */ 

function drawTrack() {
    var records = [[]];
    var init = true;
    var human = 1;

    socket.on("step", function(axisX, axisY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var x = axisX * 100;
        var y = axisY * 100; 
        console.log(x, y);
        drawLines(path);
    
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
                    debugger;
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
        if (records[row].length > limit) {
            records[row].splice(limit, limit + 1);
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

function drawLines(coordinatesArray) {
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
    let a = x1 - x2;
    let b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

function indexOfSmallest(array) {
    var lowest = 0;
    for (let i = 1; i < array.length; i++) {
        if (array[i] < array[lowest]) lowest = i;
    }
    return lowest;
}
