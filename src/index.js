// define functions for handling homicide & side-annotation

// suicide & side-annotation

// other granularities

// draw SVG elements, graph titles, axes (fxn w/ dataset input)
//      mouse-over DoD?
diameter = 600;
pad = 2;
var scale = d3.scaleSqrt();
var svg = d3.select("body").append("svg");
svg.attr("width", diameter).attr("height", diameter);

// var filterByIntent = function(d) {
//     return {
//         Intent: d.Intent,
//         Deaths: d.Deaths
//     };
// }
function getFilteredData(data, intent) {
  console.log(intent);
  if (intent == 1) { // double equals allows interpolation
    // both homicide and suicide (this is not right though)
    return data;
  } else if (intent == 2) {
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
    // var stratifiedData = d3.stratify(d);
    var $intentSelector = document.getElementById("intent-select"); 
    var intentData = getFilteredData(d, $intentSelector.value);
    enterCircles(intentData);

    $intentSelector.onchange = function(e) {
      console.log($intentSelector.value);
      var intent = e.target.value;
      var intentData = getFilteredData(d, intent);

      updateCircles(intentData);
      enterCircles(intentData);
      exitCircles(intentData);

    };
})


function enterCircles(data) {
  scale.domain([0, d3.max(data, function(d) { return d.Deaths; })])
      .range([0, d3.max(data, function(d) { return d.Rate; })]); // idk

  //Add the circles
  svg.selectAll("circles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d, i) {
        return i*d.Rate + pad;
    })
    .attr("cy", function(d, i) {
        return diameter/2;
    })
    .attr("r", function(d, i) {
        // console.log(d);
        return scale(d.Deaths);
    })
    .attr("fill", getRandomColor()); // color changing);
}

function exitCircles(data) {
  svg.selectAll("circles")
      .data(data)
      .exit()
      .remove();
}

function updateCircles(data) { // need to bind circles to datapoints; not sure how
  svg.selectAll("circles")
      .data(data)
      .transition();
}

// for testing purposes
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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
    // });

// initial call-back renders homicide bubbles, waits 10 seconds,
// draws next etc. until end

// set up listeners for on-click / on-drag w/ a slider