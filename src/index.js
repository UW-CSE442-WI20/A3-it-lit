// define functions for handling homicide & side-annotation

// suicide & side-annotation

// other granularities

// draw SVG elements, graph titles, axes (fxn w/ dataset input)
//      mouse-over DoD?
diameter = 500;
pad = 20;
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
// hard padding @ 100 on each side, so actual svg is 300x300
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

  function getMaxValue(d) {
    var currMax = d[0].value;
    for (var i = 1; i < d.length; i++) {
      currMax = Math.max(currMax, d[i].value);
    }
    return currMax;
  }
  var maxValue = getMaxValue(nestedData);

  scale.domain([0, maxValue])
    .range([20, (diameter - 200) / nestedData.length]);
    

  // var bubble = d3.pack(nestedData)
  //   .size([diameter, diameter])
  //   .padding(2);

  // var nodes = d3.hierarchy(nestedData).sum(function(d) {
  //   return Math.round(d.Rate);
  // });
  // console.log(nodes);
  console.log(nestedData);

  var node = svg.selectAll(".node")
  .data(nestedData)
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", function(d, i) {
    var xOffset = (i+1)*50 + scale(d.value);
    var yOffset = (i+1)*50 + scale(d.value);
    // if (i === 0) {
    //   return "translate(" + xOffset + "," + yOffset + ")";
    // } else {
    //   var prevX = scale(nestedData[i-1].value) + 50;
    //   var prevY = 0;
    //   return "translate(" + xOffset + "," + yOffset + ")";
    // }
    return "translate(" + xOffset + ", " + yOffset + ")";
  });

  node.append("title")
    .text(function(d, i) {
      return d.key + ": " + d.value;
    });

  node.append("circle")
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
        return d.key;
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
        return d.value;
    })
    .attr("font-family",  "Gill Sans", "Gill Sans MT")
    .attr("font-size", function(d){
        return scale(d.value)/5;
    })
    .attr("fill", "white");

  d3.select(self.frameElement)
    .style("height", diameter + "px");



    //Add the circles
    // svg.selectAll("circles")
    //   .data(data)
    //   .enter()
    //   .append("circle")
    //   .attr("cx", function(d, i) {  // todo: fix math so don't overlay @ least
    //       return i*d.Rate + pad;
    //   })
    //   .attr("cy", function(d, i) {
    //       return diameter/2;
    //   })
    //   .attr("r", function(d, i) {
    //       // console.log(d);
    //       return scale(d.Deaths);
    //   })
    //   .attr("stroke", "black")
    //   .attr("fill", getRandomColor()) // color changing
    //   .append("text")
    //   .style("text-anchor", "middle")
    //   .attr("fill", "white")
    //   .text(function(d) {
    //     console.log("we here");
    //     return d.Race + ": " + d.Age;
    //   })
    }

function exitCircles(data) {
// svg.selectAll("circles")
//     .data(data)
//     .exit()
//     .remove();
  svg.selectAll("g").remove(); // doesn't allow transitions, but deletes properly.
}

function updateCircles(data) { // need to bind circles to datapoints; not sure how
svg.selectAll("circles")
    .data(data)
    .transition();
}

// differentiation on refresh
// sometimes clashes with the white of the texts
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