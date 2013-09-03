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
	var millDiameter = 10;
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

    workpiece = new THREE.Mesh(
			new THREE.CubeGeometry(workpieceSideLength, workpieceSideLength, workpieceSideLength), material);
    scene.add(workpiece);

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

	function millFromTo(from, to) {
		var workpieceBSP = new ThreeBSP(workpiece);

		var mr = millDiameter / 2.0;
		var mh = 100;
		var millMesh = makeMillBodyMesh(from, to, mr, mh, millMaterial);
		if (false) {
			scene.add(millMesh);
		} else {
			var newBSP = workpieceBSP.subtract(new ThreeBSP(millMesh));
			scene.remove(workpiece);
			workpiece = newBSP.toMesh(material);
			scene.add(workpiece);
		}	
	}

	function makeMillBodyMesh(from, to, r, h, material) {
		var from2 = new THREE.Vector2(from.x, from.z);
		var to2 = new THREE.Vector2(to.x, to.z);
		var vecr = new THREE.Vector2().subVectors(to2, from2).normalize().multiplyScalar(r);
		var rightr = new THREE.Vector2(vecr.y, -vecr.x);
		var v = Math.atan2(vecr.y, vecr.x);
		var vsteps = 12;
		var vstep = Math.PI / vsteps;

		var shape = new THREE.Shape();
    shape.moveTo(from2.x + rightr.x, from2.y + rightr.y);
    shape.lineTo(to2.x + rightr.x, to2.y + rightr.y);
		// add half circle lines around to2 to [to2.x - rightr.x, to2.y - rightr.y]
		var cv = v - Math.PI / 2;
		for (var i = 1; i < vsteps; i++) {
			cv += vstep;
			shape.lineTo(to2.x + r * Math.cos(cv), to2.y + r * Math.sin(cv));
		}
		shape.lineTo(to2.x - rightr.x, to2.y - rightr.y);
//    shape.arc(to2.x - rightr.x, to2.y - rightr.y, r, v + Math.PI / 2, v - Math.PI / 2, false);
    shape.lineTo(from2.x - rightr.x, from2.y - rightr.y);
		// add half circle lines around from2 to [from2.x + rightr.x, from2.y + rightr.y]
		var cv = v + Math.PI / 2;
		for (var i = 1; i < vsteps; i++) {
			cv += vstep;
			shape.lineTo(from2.x + r * Math.cos(cv), from2.y + r * Math.sin(cv));
		}
//    shape.arc(from2.x + rightr.x, from2.y + rightr.y, r, v - Math.PI / 2, v - 3 * Math.PI / 2, false);

		var extrusionSettings = {
			extrudePath: new THREE.LineCurve(from, from.clone().add(new THREE.Vector3(0, h, 0)))
		};
		var geometry = new THREE.ExtrudeGeometry(shape, extrusionSettings);
		var mesh = new THREE.Mesh(geometry, material);
		return mesh;
	}

	// returns the geometry for volume covered by
	// the mill of radius r moving the from-to path
	function xmakeMillBodyMesh(from, to, r, h, material) {
		var from2 = new THREE.Vector2(from.x, from.z);
		var to2 = new THREE.Vector2(to.x, to.z);
		var vecr = new THREE.Vector2().subVectors(to2, from2).normalize().multiplyScalar(r);
		var v = Math.atan2(vecr.y, vecr.x)

		var shapePoints = [];
		v -= Math.PI / 2;
		shapePoints.push(new THREE.Vector2(Math.cos(v), Math.sin(v)).multiplyScalar(r).add(from2));
		// add arc points here
		v += Math.PI;
		shapePoints.push(new THREE.Vector2(Math.cos(v), Math.sin(v)).multiplyScalar(r).add(from2));
		shapePoints.push(new THREE.Vector2(Math.cos(v), Math.sin(v)).multiplyScalar(r).add(to2));
		// add arc points here
		v += Math.PI;
		shapePoints.push(new THREE.Vector2(Math.cos(v), Math.sin(v)).multiplyScalar(r).add(to2));
		shapePoints.push(shapePoints[0]);

		var shape = new THREE.Shape(shapePoints);
		var extrusionSettings = {
			extrudePath: new THREE.LineCurve(from, from.clone().add(new THREE.Vector3(0, h, 0)))
		};
		var geometry = new THREE.ExtrudeGeometry(shape, extrusionSettings);
		var mesh = new THREE.Mesh(geometry, material);
		return mesh;
	}

  return {
      init: function () {
          setup();
          paint();
      },

      mill1AndPaint: function() {
          millFromTo(new THREE.Vector3(-10, 0, 0), 
						new THREE.Vector3(0, 0, -10));
          changed = true;
      },

      mill2AndPaint: function() {
      },

      mill3AndPaint: function() {
      }
  }
})();
