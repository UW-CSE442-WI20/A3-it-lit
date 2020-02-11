// define functions for handling homicide & side-annotation

// suicide & side-annotation

diameter = 600;
pad = 20;
var scale = d3.scaleSqrt();
var svg = d3.select("body").append("svg");
svg.attr("width", diameter).attr("height", diameter);

var pack = d3.pack()
    .size([diameter-50, diameter])
    .padding(pad);

function getFilteredData(data, intent) {
  console.log(intent);
  if (intent == 1) { // double equals allows interpolation
    // both homicide and suicide
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
    var $intentSelector = document.getElementById("intent-select");
    var intentData = getFilteredData(d, $intentSelector.value);

    enterCircles(intentData);

    $intentSelector.onchange = function(e) {
      console.log($intentSelector.value);
      var intent = e.target.value;
      var intentData = getFilteredData(d, intent);


      //updateCircles(intentData);
      exitCircles(intentData);
      enterCircles(intentData);

    };
})

// hard cap @ 6 circles, so hard math was performed on rendering
// hard padding @ 50 on each side, so actual svg is 500x500
function enterCircles(data) {
  // scale.domain([0, d3.max(data, function(d) { return d.Deaths; })])
  //     .range([0, d3.max(data, function(d) { return d.Rate; })]); // idk

  var nestedData = d3.nest()
    .key(function(d) { return d.Race;})
    .rollup(function(d) {
      return d3.sum(d, function(d) {
        return Math.round(d.Rate);  // deaths per 100k
      })
    })
    .entries(data);

  var root = d3.hierarchy({children: nestedData})
    .sum(function(d) { return d.value; })

  var maxValue = getMaxValue(nestedData);

  scale.domain([0, maxValue])
    .range([20, (diameter) / nestedData.length]);

  console.log(nestedData);

  var node = svg.selectAll(".node")
  .data(pack(root).leaves())
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", function(d, i) {
    return "translate(" + d.x + ", " + d.y + ")";
  });

  node.append("title")
    .text(function(d, i) {
      return d.key + ": " + d.value;
    });

  node.append("circle")
    .transition()
    .duration(1000)
    .attr("r", function(d, i) {
        return scale(d.value);
    })
    .attr("stroke", "black")
    .style("fill", function(d,i) {
        return getRandomColor();
    });

  node.append("text")
    .attr("dy", ".2em")
    .style("text-anchor", "middle")
    .text(function(d) {
        return d.data.key;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", function(d){
        return scale(d.value)/5;
    })
    .attr("fill", "white");

  node.append("text")
    .attr("dy", "1.3em")
    .style("text-anchor", "middle")
    .text(function(d) {
        console.log(d);
        return d.value;
    })
    .attr("font-family",  "Gill Sans", "Gill Sans MT")
    .attr("font-size", function(d){
        return scale(d.value)/5;
    })
    .attr("fill", "white");

  d3.select(self.frameElement)
    .style("height", diameter + "px");

  }

function exitCircles(data) {
// svg.selectAll("circles")
//     .data(data)
//     .exit()
//     .remove();
  svg.selectAll("g")
  .remove(); // doesn't allow transitions, but deletes properly.
}

function updateCircles(data) { 
  svg.selectAll(".node")
    .data(data)
    .transition();
}

// differentiation on refresh
function getRandomColor() {
var letters = '0123456789ABCDEF';
var color = '#';
for (var i = 0; i < 6; i++) {
  color += letters[Math.floor(Math.random() * 16)];
}
return color;
}

function getMaxValue(d) {
  var currMax = d[0].value;
  for (var i = 1; i < d.length; i++) {
    currMax = Math.max(currMax, d[i].value);
  }
  return currMax;
}