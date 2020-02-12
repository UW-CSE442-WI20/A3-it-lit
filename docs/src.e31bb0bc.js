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
diameter = 500;
pad = 5;
var ages = ["All", "Under 15", "15 - 34", "35 - 64", "65+"];
var colors = ["#A6ACAF", "#52BE80", "#E67E22", "#5DADE2", "#E74C3C", "#2471A3"];
var scale = d3.scaleSqrt();
var svg = d3.select("body").append("svg");
svg.attr("width", diameter).attr("height", diameter).attr("border", 0);
var pack = d3.pack().size([diameter - 50, diameter]).padding(pad);

function getFilteredData(data, intent, ageGroup) {
  if (intent == 1 && ageGroup == 0) {
    // double equals allows interpolation
    // both homicide and suicide
    return data;
  } else if (intent == 1) {
    return data.filter(function (d) {
      return d.Age === ages[ageGroup];
    });
  } else if (intent == 2 && ageGroup == 0) {
    // homicide
    return data.filter(function (d) {
      return d.Intent === "Homicide";
    });
  } else if (intent == 2) {
    return data.filter(function (d) {
      return d.Intent === "Homicide" && d.Age === ages[ageGroup];
    });
  } else if (intent == 3 && ageGroup == 0) {
    // suicide
    return data.filter(function (d) {
      return d.Intent === "Suicide";
    });
  } else {
    return data.filter(function (d) {
      return d.Intent === "Suicide" && d.Age === ages[ageGroup];
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
  var intent = $intentSelector.value;
  var ageGroup = 0;
  var intentData = getFilteredData(d, $intentSelector.value, ageGroup);
  enterCircles(intentData);
  var sliderAge = d3.sliderBottom().min(0) // bind based on 0-4 on the call, filter
  .max(4).width(300).ticks(4).step(1).default(0).on('onchange', function (val) {
    d3.select('p#value-age').text(ages[val]);
    ageGroup = val;
    var ageData = getFilteredData(d, intent, ageGroup);
    updateCircles(ageData);
  });
  var gAge = d3.select('div#slider-age').append('svg').attr('width', 500).attr('height', 100).append('g').attr('transform', 'translate(30,30)');
  gAge.call(sliderAge);
  d3.select('p#value-age').text(ages[sliderAge.value()]);

  $intentSelector.onchange = function (e) {
    intent = e.target.value;
    var intentData = getFilteredData(d, intent, ageGroup);
    updateCircles(intentData);
  };
}); // hard cap @ 6 circles, so hard math was performed on rendering
// hard padding @ 50 on each side, so actual svg is 500x500

function enterCircles(data) {
  var nestedData = d3.nest().key(function (d) {
    return d.Race;
  }).rollup(function (d) {
    return d3.sum(d, function (d) {
      return d.Rate; // deaths per 100k
    });
  }).entries(data);
  var root = d3.hierarchy({
    children: nestedData
  }).sum(function (d) {
    return d.value;
  });
  var maxValue = getMaxValue(nestedData);
  scale.domain([0, maxValue]).range([20, diameter / nestedData.length]);
  var node = svg.selectAll(".node").data(pack(root).leaves()).enter().append("g").attr("class", "node").attr("transform", function (d, i) {
    return "translate(" + d.x + ", " + d.y + ")";
  });
  node.append("title").text(function (d, i) {
    return d.key + ": " + d.value;
  });
  node.append("circle").transition().duration(1000).attr("r", function (d, i) {
    return scale(d.value);
  }).attr("stroke", "black").style("fill", function (d, i) {
    return colors[i];
  });
  node.append("text").attr("dy", ".2em").style("text-anchor", "middle").text(function (d) {
    return d.data.key;
  }).attr("font-family", "sans-serif").attr("font-size", function (d) {
    return scale(d.value) / 5;
  }).attr("fill", "white");
  node.append("text").attr("dy", "1.3em").attr("class", "subtitle").style("text-anchor", "middle").text(function (d) {
    return d.value.toFixed(2);
  }).attr("font-family", "Gill Sans", "Gill Sans MT").attr("font-size", function (d) {
    return scale(d.value) / 5;
  }).attr("fill", "white");
  d3.select(self.frameElement).style("height", diameter + "px");
}

function updateCircles(data) {
  var nestedData = d3.nest().key(function (d) {
    return d.Race;
  }).rollup(function (d) {
    return d3.sum(d, function (d) {
      return d.Rate; // deaths per 100k to 2 decimals
    });
  }).entries(data);
  var root = d3.hierarchy({
    children: nestedData
  }).sum(function (d) {
    return d.value;
  });
  var maxValue = getMaxValue(nestedData);
  scale.domain([0, maxValue]).range([20, diameter / nestedData.length]);
  var node = svg.selectAll(".node").data(pack(root).leaves()).transition().duration(2000).attr("transform", function (d, i) {
    return "translate(" + d.x + ", " + d.y + ")";
  }).call(function (node) {
    node.select("circle").attr("r", function (d, i) {
      return scale(d.value);
    });
    node.select("text").attr("dy", ".2em").style("text-anchor", "middle").text(function (d) {
      return d.data.key;
    }).attr("font-family", "sans-serif").attr("font-size", function (d) {
      return scale(d.value) / 5;
    }).attr("fill", "white");
    node.select(".subtitle").attr("dy", "1.3em").style("text-anchor", "middle").text(function (d) {
      return d.value.toFixed(2);
    }).attr("font-family", "Gill Sans", "Gill Sans MT").attr("font-size", function (d) {
      return scale(d.value) / 5;
    }).attr("fill", "white");
    d3.select(self.frameElement).style("height", diameter + "px");
  });
}

function getMaxValue(d) {
  var currMax = d[0].value;

  for (var i = 1; i < d.length; i++) {
    currMax = Math.max(currMax, d[i].value);
  }

  return currMax;
}
},{"./fullData.csv":"fullData.csv"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "49563" + '/');

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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map