var scene = (function () {

	// set the scene size
  var WIDTH = 400;
  var HEIGHT = 600;

  var ASPECT = WIDTH / HEIGHT;

	// create a WebGL renderer
	// and a scene
  var renderer = new THREE.WebGLRenderer({antialias: true});
  var scene = new THREE.Scene();

	var changed = false;
	var controller;
  var workpiece;
	var newMesh;
  var workpieceSideLength = 100;
	var top;
  var material = new THREE.MeshLambertMaterial({color: 0xaaaaaa});
  var millMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});

  function setup() {
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

		var workpiecegeometry = new THREE.CubeGeometry(workpieceSideLength, workpieceSideLength, workpieceSideLength);
    workpiece = new THREE.Mesh(workpiecegeometry, material);
		workpiecegeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -workpieceSideLength / 2, 0));	// set top of wp at 0
    scene.add(workpiece);
		workpiece.geometry.computeBoundingBox();
		top = 0.0;

		controller = new THREE.OrbitControls(camera);
		controller.addEventListener("change", function(src, type) {changed = true;});
		scene.add(controller);

    renderer.setSize(WIDTH, HEIGHT);
    var $container = $('#container');
    $container.append(renderer.domElement);
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
		if (top > from.y) {
			var h = top - from.y;
			var dy = from.y + h / 2.0;
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

  return {
      init: function () {
          setup();
          paint();
      },

      mill1AndPaint: function() {
        millFromTo(new THREE.Vector3(-10, 0, 0), 
					new THREE.Vector3(10, 0, 0));
        changed = true;
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
