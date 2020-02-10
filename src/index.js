

console.log('hello world');

// define functions for handling homicide & side-annotation

// suicide & side-annotation

// other granularities

// draw SVG elements, graph titles, axes (fxn w/ dataset input)
//      mouse-over DoD?
h = 500;
w = 1000;
padding = 5;
var scale = d3.scaleSqrt();
var svg = d3.select("body").append("svg");
svg.attr("width", w).attr("height", h);

// var filterByIntent = function(d) {
//     return {
//         Intent: d.Intent,
//         Deaths: d.Deaths
//     };
// }
function getFilteredData(data, intent) {
  if (intent === 1) {
    // both homicide and suicide (this is not right though)
    return data;
  } else if (intent === 2) {
    // homicide
    return data.filter(function(d) { return d.Intent === "Homicide"});
  } else {
    // suicide
    return data.filter(function(d) { return d.Intent === "Suicide"});
  }
}


// read in CSV data
const csvFile = require("./fullData.csv");
d3.csv(csvFile, function(d) {
        d.Deaths = +d.Deaths;
        d.Population = +d.Population;
        d.Rate = parseFloat(d.Rate);
        return d;
}).then(function(d) {
    var $intentSelector = document.getElementById("intent-select");
    var intentData = getFilteredData(d, $intentSelector.value);
    enterCircles(intentData);

    $intentSelector.onchange = function(e) {
      var intent = e.target.value;
      var intentData = getFilteredData(d, intent);

      updateCircles(intentData);
      enterCircles(intentData);
      exitCircles(intentData);

    };
})


function enterCircles(data) {
  scale.domain([0, d3.max(data, function(d) { return d.Deaths; })])
      .range([0, d3.max(data, function(d) { return d.Rate})]); // idk
  // Add the circles
  svg.selectAll("circles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d, i) {
        return i*d.Rate + padding;
    })
    .attr("cy", function(d, i) {
        return h/2;
    })
    .attr("r", function(d, i) {
        return scale(d.Deaths);
    })
    .attr("fill", "magenta"); // color changing);
}

function exitCircles(data) {
  svg.selectAll("circles")
      .data(data)
      .exit()
      .remove();
}

function updateCircles(data) {
  svg.selectAll("circles")
      .data(data)
      .transition();
}

// d3.csv(csvFile, function(d) {
//         d.Deaths = +d.Deaths;
//         d.Population = +d.Population;
//         d.Rate = parseFloat(d.Rate);
//         return d;
// }).then(function(d) {
//     scale.domain([0, d3.max(d, function(d) { return d.Deaths; })])
//         .range([0, d3.max(d, function(d) { return d.Rate})]); // idk
//     // couple on intent & deaths draw relative sizes
//     svg.selectAll("circles")
//     .data(d)
//     .enter()
//     .append("circle")
//     .attr("cx", function(d, i) {
//         return i*d.Rate + padding;
//     })
//     .attr("cy", function(d, i) {
//         return h/2;
//     })
//     .attr("r", function(d, i) {
//         return scale(d.Deaths);
//     })
//     .attr("fill", "magenta"); // color changing
// })

// initial call-back renders homicide bubbles, waits 10 seconds,
// draws next etc. until end

// set up listeners for on-click / on-drag w/ a slider
