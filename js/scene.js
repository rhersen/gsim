var scene = (function () {
  // keeps a WebGL renderer on a canvas
  var renderer;
  var scene = new THREE.Scene();

  var changed = false;
  var controller;
  var workpiece;
  var workpieceSize;
  var top;
  var material = new THREE.MeshLambertMaterial({color: 0xaaaaaa});
  var millMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
  var canvasEl;
  var camera, initialWorkpiece;

  // create the WebGL renderer on the supplied canvas and all needed support
  // also creates a workpiece to mill into
  function setup(canvas) {
    canvasEl = canvas;
    renderer = new THREE.WebGLRenderer({canvas: canvasEl, antialias: true});

    var VIEW_ANGLE = 45;
    var NEAR = 0.1;
    var FAR = 10000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, 1.0, NEAR, FAR);
    camera.position.set(0, 200, 250);
    scene.add(camera);

    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 100;
    pointLight.position.y = 100;
    pointLight.position.z = 130;
    scene.add(pointLight);

    setInitialWorkpiece({width: 300, height: 100, depth: 200});
    top = 0.0;
    workpiece = initialWorkpiece;
    scene.add(workpiece);

    controller = new THREE.OrbitControls(camera, canvasEl);
    controller.addEventListener("change", function() {changed = true;});
    scene.add(controller);

    canvasSizeChanged();
  }
  
  function setInitialWorkpiece(size) {
    workpieceSize = size;
    var workpiecegeometry = new THREE.CubeGeometry(size.width, size.height, size.depth);
    initialWorkpiece = new THREE.Mesh(workpiecegeometry, material);
    workpiecegeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -workpieceSize.height / 2, 0));  // set top of wp at 0
    initialWorkpiece.geometry.computeBoundingBox();
  }

  // restore the original workpiece
  function reset() {
    scene.remove(workpiece);
    workpiece = initialWorkpiece;
    scene.add(workpiece);
  }

  // call this when canvas size have changed
  function canvasSizeChanged() {
    var w = canvasEl.clientWidth, h = canvasEl.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    changed = true;
  }
  
  // start paintloop
  function paint() {
    requestAnimationFrame(paint);
    controller.update();
    if (changed) {
      renderer.render(scene, camera);
      changed = false;
    }
  }

  // mill along a straight line
  function millFromTo(from, to, millDiameter) {
    var workpieceBSP = new ThreeBSP(workpiece);

    var mr = millDiameter / 2.0;
    var millMesh = makeMillBodyMesh(from, to, mr, top, millMaterial);
    var newBSP = workpieceBSP.subtract(new ThreeBSP(millMesh));
    scene.remove(workpiece);
    workpiece = newBSP.toMesh(material);
    workpiece.geometry.computeVertexNormals();
    scene.add(workpiece);
    changed = true;
  }

  // returns a mesh for the volume covered by a 
  // mill of radius r moving between from and to
  function makeMillBodyMesh(from, to, r, top, material) {
    var ymin = Math.min(from.y, to.y);
    if (top > ymin) {
      var h = top - ymin;
      var dy = ymin + h / 2.0;
      if (from.x == to.x && from.z == to.z) {
        var geometry = new THREE.CylinderGeometry(r, r, h, 12);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(from.x, dy, from.z));
        return new THREE.Mesh(geometry, material);
      } else {
        if (from.y != to.y) {
          throw "ERROR: tool path changes in all axes - only change in x/z or y is supported, not both";
        }
        var lidPath = getMillBodyLidPath(from, to, r);
        lidPath.makeGeometry();
        var extrusionSettings = {
          amount: h, 
          bevelEnabled: false
        };
        geometry = new THREE.ExtrudeGeometry(lidPath, extrusionSettings);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, top, 0));

        return new THREE.Mesh(geometry, material);
      }
    }
  }

  // return 2D shape for a mill of radius r 
  // going between points from and to
  function getMillBodyLidPath(from, to, r) {
    var from2 = new THREE.Vector2(from.x, from.z);
    var to2 = new THREE.Vector2(to.x, to.z);
    var vecr = new THREE.Vector2().subVectors(to2, from2).normalize().multiplyScalar(r);
    var rightr = new THREE.Vector2(vecr.y, -vecr.x);
    var v = Math.atan2(vecr.y, vecr.x);
    var vsteps = 6;
    var vstep = Math.PI / vsteps;
    var shape = new THREE.Shape();
    shape.moveTo(from2.x + rightr.x, from2.y + rightr.y);
    shape.lineTo(to2.x + rightr.x, to2.y + rightr.y);
    // add half circle lines around to2 to [to2.x - rightr.x, to2.y - rightr.y]
    var cv = v - Math.PI / 2;
    for (var i = 0; i < vsteps; i++) {
      cv += vstep;
      shape.lineTo(to2.x + r * Math.cos(cv), to2.y + r * Math.sin(cv));
    }
    shape.lineTo(to2.x - rightr.x, to2.y - rightr.y);
    shape.lineTo(from2.x - rightr.x, from2.y - rightr.y);
    // add half circle lines around from2 to [from2.x + rightr.x, from2.y + rightr.y]
    cv = v + Math.PI / 2;
    for (var i = 1; i < vsteps; i++) {
      cv += vstep;
      shape.lineTo(from2.x + r * Math.cos(cv), from2.y + r * Math.sin(cv));
    }
    shape.moveTo(from2.x + rightr.x, from2.y + rightr.y);
    return shape;
  }

  function selectTextareaLine(tarea,lineNum) {
    var lines = tarea.value.split("\n");

    // calculate start/end
    var startPos = 0;
    for(var x = 0; x < lines.length; x++) {
      if(x == lineNum) {
          break;
      }
      startPos += (lines[x].length+1);
    }

    var endPos = lines[lineNum].length+startPos;

    // do selection
    
    // Chrome / Firefox
    if(typeof(tarea.selectionStart) != "undefined") {
      tarea.focus();
      tarea.selectionStart = startPos;
      tarea.selectionEnd = endPos;
      return true;
    }

    // IE
    if (document.selection && document.selection.createRange) {
      tarea.focus();
      tarea.select();
      var range = document.selection.createRange();
      range.collapse(true);
      range.moveEnd("character", endPos);
      range.moveStart("character", startPos);
      range.select();
      return true;
    }

    return false;
  }

  return {
    init: function (canvasEl) {
      setup(canvasEl);
      paint();
    },

    setSizes: function() {
      canvasSizeChanged();
    },
    
    setWorkpieceSize: function(size) {
      setInitialWorkpiece(size);
      reset();
      changed = true;
    },

    // mills the cgode using the specified mill
    millGCode: function(gcode, tools) {
      var gci = GCodeInterpreter({
        millFromTo: function(from, to, ti) {
          var d = parseFloat(tools[ti - 1].diameter);
          millFromTo(
            new THREE.Vector3(from.x, from.z, from.y), 
            new THREE.Vector3(to.x, to.z, to.y),  d);
        },
        
        reset: function() {
          reset();
        }
      });
      gci.setGCode(gcode);
      gci.setTools(tools);
      gci.run();
    },

    selectGCodeLine: function(lineNo) {
      selectTextareaLine(document.getElementById('gcodeTextArea'), lineNo);
    }
  }
})();
