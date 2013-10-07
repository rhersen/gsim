function GCodeInterpreter(millingMachine) {
  var STATES = {STOPPED: "stopped", RUNNING: "running", PAUSED: "paused"};
  var state = STATES.STOPPED;
  var gCode;
  var tools;
  var ti = 1;
  var validPartStarts = "mgotxyzijkf";
  var partValueParser =   [intParser, intParser, stringParser, intParser, floatParser, floatParser, floatParser, floatParser, floatParser, floatParser, floatParser];
  var prevPos = {x:0, y:0, z:0};
  var partVal = {};
  
  function trim1 (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }
  
  function floatParser(s) { return parseFloat(s); }
  function intParser(s) { return parseInt(s); }
  function stringParser(s) { return s; }
  
  // parse and execute g code line by line
  // supports g0, g1 and m6
  function runAll(machine) {
    machine.reset();
    var lines = gCode.split('\n');
    for (var i in lines) {
      delete partVal.m;
      var line = trim1(lines[i]);
      if (line.length > 0) {
        var parts = line.split(' ');
        for (var j in parts) {
          var part = parts[j];
          var partStart = part.charAt(0);
          var partRest = part.substr(1);
          var partStartIndex = validPartStarts.indexOf(partStart);
          if (partStartIndex == -1) {
            throw new SyntaxError("invalid g-code", i);
          }
          partVal[partStart] = partValueParser[partStartIndex](partRest);
        }
        if (partVal.m == 6) {
            if (partVal.t == undefined) {
                throw new SyntaxError("missing t value for m6", i);
            }
            ti = partVal.t;
        }
        if (partVal.g == 0 || partVal.g == 1) {
          if (partVal.x == undefined || partVal.y == undefined || partVal.z == undefined) {
            throw new SyntaxError("missing x, y or z", i);
          }
          if (partVal.g == 1) {
            machine.millFromTo(prevPos, partVal, ti);
          }
          prevPos.x = partVal.x; 
          prevPos.y = partVal.y; 
          prevPos.z = partVal.z;
        }
      }
    }
  }

  function validate(gCode) {
    
  }
  
  return {
    setGCode: function(newGCode) {
      validate(newGCode);
      state = STATES.STOPPED;
      gCode = newGCode;
    },
    
    setTools: function(newTools) {
      tools = newTools;
    },
    
    run: function() {
      state = STATES.RUNNING;
      runAll(millingMachine);
    },
    
    pause: function() {
      throw "GCodeInterpreter.step() not implemented yet"
      state = STATES.PAUSED;
    },
    
    step: function() {
      throw "GCodeInterpreter.step() not implemented yet"
    },
    
    stop: function() {
      throw "GCodeInterpreter.step() not implemented yet"
      state = STATES.STOPPED;
    }
  }
}