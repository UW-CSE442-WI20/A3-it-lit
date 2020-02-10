// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"fullData.csv":[function(require,module,exports) {
module.exports = "/fullData.7007f058.csv";
},{}],"index.js":[function(require,module,exports) {
// define functions for handling homicide & side-annotation
// suicide & side-annotation
// other granularities
// draw SVG elements, graph titles, axes (fxn w/ dataset input)
//      mouse-over DoD?
diameter = 500;
pad = 20;
var scale = d3.scaleSqrt();
var svg = d3.select("body").append("svg");
svg.attr("width", diameter).attr("height", diameter); // var filterByIntent = function(d) {
//     return {
//         Intent: d.Intent,
//         Deaths: d.Deaths
//     };
// }

function getFilteredData(data, intent) {
  console.log(intent);

  if (intent == 1) {
    // double equals allows interpolation
    // both homicide and suicide
    return data;
  } else if (intent == 2) {
    // homicide
    return data.filter(function (d) {
      return d.Intent === "Homicide";
    });
  } else {
    // suicide
    return data.filter(function (d) {
      return d.Intent === "Suicide";
    });
  }
} // read in CSV data


var csvFile = require("./fullData.csv");

d3.csv(csvFile, function (d) {
  d.Deaths = +d.Deaths;
  d.Population = +d.Population;
  d.Rate = parseFloat(d.Rate);
  return d;
}).then(function (d) {
  var $intentSelector = document.getElementById("intent-select");
  var intentData = getFilteredData(d, $intentSelector.value);
  enterCircles(intentData);

  $intentSelector.onchange = function (e) {
    console.log($intentSelector.value);
    var intent = e.target.value;
    var intentData = getFilteredData(d, intent); //updateCircles(intentData);

    exitCircles(intentData);
    enterCircles(intentData);
  };
}); // hard cap @ 6 circles, so hard math was performed on rendering
// hard padding @ 100 on each side, so actual svg is 300x300

function enterCircles(data) {
  // scale.domain([0, d3.max(data, function(d) { return d.Deaths; })])
  //     .range([0, d3.max(data, function(d) { return d.Rate; })]); // idk
  var nestedData = d3.nest().key(function (d) {
    return d.Race;
  }).rollup(function (d) {
    return d3.sum(d, function (d) {
      return Math.round(d.Rate); // deaths per 100k
    });
  }).entries(data);

  function getMaxValue(d) {
    var currMax = d[0].value;

    for (var i = 1; i < d.length; i++) {
      currMax = Math.max(currMax, d[i].value);
    }

    return currMax;
  }

  var maxValue = getMaxValue(nestedData);
  scale.domain([0, maxValue]).range([20, (diameter - 200) / nestedData.length]); // var bubble = d3.pack(nestedData)
  //   .size([diameter, diameter])
  //   .padding(2);
  // var nodes = d3.hierarchy(nestedData).sum(function(d) {
  //   return Math.round(d.Rate);
  // });
  // console.log(nodes);

  console.log(nestedData);
  var node = svg.selectAll(".node").data(nestedData).enter().append("g").attr("class", "node").attr("transform", function (d, i) {
    var xOffset = (i + 1) * 50 + scale(d.value);
    var yOffset = (i + 1) * 50 + scale(d.value); // if (i === 0) {
    //   return "translate(" + xOffset + "," + yOffset + ")";
    // } else {
    //   var prevX = scale(nestedData[i-1].value) + 50;
    //   var prevY = 0;
    //   return "translate(" + xOffset + "," + yOffset + ")";
    // }

    return "translate(" + xOffset + ", " + yOffset + ")";
  });
  node.append("title").text(function (d, i) {
    return d.key + ": " + d.value;
  });
  node.append("circle").attr("r", function (d, i) {
    return scale(d.value);
  }).attr("stroke", "black").style("fill", function (d, i) {
    return getRandomColor();
  });
  node.append("text").attr("dy", ".2em").style("text-anchor", "middle").text(function (d) {
    return d.key;
  }).attr("font-family", "sans-serif").attr("font-size", function (d) {
    return scale(d.value) / 5;
  }).attr("fill", "white");
  node.append("text").attr("dy", "1.3em").style("text-anchor", "middle").text(function (d) {
    return d.value;
  }).attr("font-family", "Gill Sans", "Gill Sans MT").attr("font-size", function (d) {
    return scale(d.value) / 5;
  }).attr("fill", "white");
  d3.select(self.frameElement).style("height", diameter + "px"); //Add the circles
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

function updateCircles(data) {
  // need to bind circles to datapoints; not sure how
  svg.selectAll("circles").data(data).transition();
} // differentiation on refresh
// sometimes clashes with the white of the texts


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
} // d3.csv(csvFile, function(d) {
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
},{"./fullData.csv":"fullData.csv"}],"../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53350" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map