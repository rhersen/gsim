var scene = (function () {


	// create a WebGL renderer
	// and a scene
  var renderer = new THREE.WebGLRenderer({antialias: true});
  var scene = new THREE.Scene();

	var changed = false;
	var controller;
  var workpiece;
	var newMesh;
  var workpieceWidth = 300, workpieceHeight = 100, workpieceDepth = 200;
	var top;
  var material = new THREE.MeshLambertMaterial({color: 0xaaaaaa});
  var millMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});

  function setup() {
		var el = document.getElementById("draw3d");
		var leftEl = document.getElementById("left");

  var WIDTH = el.clientWidth - leftEl.clientWidth - 10;
  var HEIGHT = 400;

  var ASPECT = WIDTH / HEIGHT;
   var VIEW_ANGLE = 45;
    var NEAR = 0.1;
    var FAR = 10000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, 200, 250);
    scene.add(camera);

    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 100;
    pointLight.position.y = 100;
    pointLight.position.z = 130;
    scene.add(pointLight);

		var workpiecegeometry = new THREE.CubeGeometry(workpieceWidth, workpieceHeight, workpieceDepth);
    initialWorkpiece = new THREE.Mesh(workpiecegeometry, material);
		workpiecegeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -workpieceHeight / 2, 0));	// set top of wp at 0
		initialWorkpiece.geometry.computeBoundingBox();
		top = 0.0;
		workpiece = initialWorkpiece;
    scene.add(workpiece);

		controller = new THREE.OrbitControls(camera, document.getElementById("draw3d"));
		controller.addEventListener("change", function(src, type) {changed = true;});
		scene.add(controller);

    renderer.setSize(WIDTH, HEIGHT);
		document.getElementById("draw3d").appendChild(renderer.domElement);
  }

	function reset() {
		scene.remove(workpiece);
		workpiece = initialWorkpiece;
		scene.add(workpiece);
	}

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
		console.log("from=", from);
		console.log("to=", to);
		var workpieceBSP = new ThreeBSP(workpiece);

		var mr = millDiameter / 2.0;
		var millMesh = makeMillBodyMesh(from, to, mr, top, millMaterial);
		if (false) {
			scene.remove(workpiece);
			scene.add(millMesh);
		} else {
			var newBSP = workpieceBSP.subtract(new ThreeBSP(millMesh));
			scene.remove(workpiece);
			workpiece = newBSP.toMesh(material);
			scene.add(workpiece);
		}
		changed = true;
	}

	// returns a mesh for the volume covered by a 
	// mill of radius r moving between from and to
	function makeMillBodyMesh(from, to, r, top, material) {
		ymin = Math.min(from.y, to.y);
		if (top > ymin) {
			var h = top - ymin;
			var dy = ymin + h / 2.0;
			if (from.x == to.x && from.z == to.z) {
				var geometry = new THREE.CylinderGeometry(r, r, h, 12);
				geometry.applyMatrix(new THREE.Matrix4().makeTranslation(from.x, dy, from.z));	
				var mesh = new THREE.Mesh(geometry, material);
				return mesh;
			} else {
				if (from.y != to.y) {
					throw "ERROR: tool path changes in all axes - only change in x/z or y is supported, not both";
				}
				var lidPath = getMillBodyLidPath(from, to, r);
				var geometry = lidPath.makeGeometry();
				var extrusionSettings = {
					amount: h, 
					bevelEnabled: false
				};
				geometry = new THREE.ExtrudeGeometry(lidPath, extrusionSettings);
				geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
				geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, top, 0));	

				var mesh = new THREE.Mesh(geometry, material);
				return mesh;
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
		var cv = v + Math.PI / 2;
		for (var i = 1; i < vsteps; i++) {
			cv += vstep;
			shape.lineTo(from2.x + r * Math.cos(cv), from2.y + r * Math.sin(cv));
		}
	  shape.moveTo(from2.x + rightr.x, from2.y + rightr.y);
		return shape;
	}

	function trim1 (str) {
		  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	function executeGCode(gcode, millDiameter) {
		reset();
		// parse and execute g code line by line
		var validStarts = "gxyzijkf";
		var pos = {x:0, y:0, z:0};
		var gv = {};
		var lines = gcode.split('\n');
		for (var i in lines) {
			var line = trim1(lines[i]);
			if (line.length > 0) {
				var parts = line.split(' ');
				for (var j in parts) {
					var part = parts[j];
					var partStart = part.charAt(0);
					var partRest = part.substr(1);
					if (validStarts.indexOf(partStart) == -1) {
						throw new SyntaxError("invalid g-code", i);
					}
					gv[partStart] = (partStart == 'g' ? parseInt(partRest) : parseFloat(partRest));
				}
				if (gv.g == 0 || gv.g == 1) {
					if (gv.x == undefined || gv.y == undefined || gv.z == undefined) {
						throw new SyntaxError("missing x, y or z", i);
					}
					if (gv.g == 1) {
						millFromTo(new THREE.Vector3(pos.x, pos.z, pos.y), new THREE.Vector3(gv.x, gv.z, gv.y),	millDiameter);
					}
					pos.x = gv.x; pos.y = gv.y; pos.z = gv.z;
				}
			}
		}
	}

	function selectTextareaLine(tarea,lineNum) {
		  var lines = tarea.value.split("\n");

		  // calculate start/end
		  var startPos = 0, endPos = tarea.value.length;
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
      init: function () {
          setup();
          paint();
      },

			// mills the cgode using the specified mill
			millGCode: function(gcode, millDiameter) {
				executeGCode(gcode, millDiameter);
			},

			selectGCodeLine: function(lineNo) {
				selectTextareaLine(document.getElementById('gcodeTextArea'), lineNo);
			},

      mill1AndPaint: function() {
      },

      mill2AndPaint: function() {
				var r1 = 25.0, r2 = 35.0;
				var n = 12;
				var vv = 0.0;
				var vvstep = (2.0 * Math.PI) / n;
				for (var i = 0; i < n; i++) {
					millFromTo(
						new THREE.Vector3(Math.cos(vv) * r1, -100, Math.sin(vv) * r1), 
						new THREE.Vector3(Math.cos(vv) * r2, -100, Math.sin(vv) * r2),
						10);
					vv += vvstep;
				}
      },

      mill3AndPaint: function() {
        millFromTo(new THREE.Vector3(0, -1, 0), new THREE.Vector3(10, -1, 10), 10);
//        millFromTo(new THREE.Vector3(10, -100, 10), new THREE.Vector3(10, -100, 10), 10);
//        millFromTo(new THREE.Vector3(-10, -100, 10), new THREE.Vector3(-10, -100, 10), 10);
//        millFromTo(new THREE.Vector3(10, -100, -10), new THREE.Vector3(10, -100, -10), 10);
//        millFromTo(new THREE.Vector3(-10, -100, -10), new THREE.Vector3(-10, -100, -10), 10);
      }
  }
})();
