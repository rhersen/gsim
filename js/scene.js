var scene = (function () {

	// set the scene size
  var WIDTH = 400;
  var HEIGHT = 600;

  var ASPECT = WIDTH / HEIGHT;

	// create a WebGL renderer
	// and a scene
  var renderer = new THREE.WebGLRenderer();
  var scene = new THREE.Scene();

	var changed = false;
	var controller;
  var cube;
	var newMesh;
  var cubeSideLength = 100;
	var millDiameter = 10;
  var material = new THREE.MeshLambertMaterial({color: 0xaaaaaa});
  var millMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});

  function createGeometry() {
    cube = new THREE.Mesh(
			new THREE.CubeGeometry(cubeSideLength, cubeSideLength, cubeSideLength), material);
//    cube.rotation.x += 0.5;
//    cube.rotation.y += 0.5;
//    cube.rotation.z += 0.0;
//    scene.add(cube);
  }

  function createCamera() {
    var VIEW_ANGLE = 45;
    var NEAR = 0.1;
    var FAR = 10000;

		// create a WebGL camera
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

		// the camera starts at 0,0,0 so pull it back
    camera.position.set(0, 100, 250);

		// and the camera
    scene.add(camera);
  }

  function createLight() {
      var pointLight = new THREE.PointLight(0xFFFFFF);
      pointLight.position.x = 100;
      pointLight.position.y = 100;
      pointLight.position.z = 130;
      scene.add(pointLight);
  }

	function createController() {
		controller = new THREE.OrbitControls(camera);
		controller.addEventListener("change", function(src, type) {changed = true;});
		scene.add(controller);
	}

  function paint() {
			requestAnimationFrame(paint);
			controller.update();
			if (changed) {
	      renderer.render(scene, camera);
				changed = false;
			}
  }

  function setup() {
      renderer.setSize(WIDTH, HEIGHT);
      var $container = $('#container');
      $container.append(renderer.domElement);
  }

	function millFromTo(from, to) {
		var cubeBSP = new ThreeBSP(cube);

		var mr = millDiameter / 2.0;
		var mh = 100;
		var millMesh = makeMillBodyMesh(from, to, mr, mh, millMaterial);
		if (false) {
			scene.add(millMesh);
		} else {
			var newBSP = cubeBSP.subtract(new ThreeBSP(millMesh));
			newMesh = newBSP.toMesh(material);
			scene.add(newMesh);
		}	
	}

	// returns the geometry for volume covered by
	// the mill of radius r moving the from-to path
	function makeMillBodyMesh(from, to, r, h, material) {
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

		var shape = new THREE.Shape( shapePoints );
		var extrusionSettings = {
			extrudePath: new THREE.LineCurve(from, from.clone().add(new THREE.Vector3(0, h, 0)))
		};
		var geometry = new THREE.ExtrudeGeometry( shape, extrusionSettings );
		var mesh = new THREE.Mesh(geometry, material);
		return mesh;
	}

	function makeCylinderBSP(mr, mh, p, material) {
		var millGeom = new THREE.CylinderGeometry(mr, mr, mh, 24);
		millGeom.applyMatrix(new THREE.Matrix4().makeTranslation(p.x, p.y, p.z));
		var millMesh = new THREE.Mesh(millGeom, material);
		return new ThreeBSP(millMesh);
	}

  function getCubeRotation() {
      return [cube.rotation.x, cube.rotation.y, cube.rotation.z];
  }

  function setCubeRotation(axis, val) {

      switch (axis) {

          case 'x':
              cube.rotation.x = val;
              break;
          case 'y':
              cube.rotation.y = val;
              break;
          case 'z':
              cube.rotation.z = val;
              break;
      }
  }

  function setCubeColor(color) {

      switch (color) {

          case 'red':
              cube.material.color.setHex(0xCC0000);
              break;
          case 'green':
              cube.material.color.setHex(0x00CC00);
              break;
          case 'blue':
              cube.material.color.setHex(0x0000CC);
              break;
      }
  }

  function setCameraPositionY(y) {

      camera.position.y = y;
  }

  function setCameraPositionZ(z) {

      camera.position.z = z;
  }

  return {

      init: function () {

          createCamera();
          createLight();
          createGeometry();
					createController();
          setup();
          paint();
      },

      getCubeRotation: function () {
          return getCubeRotation();
      },

      mill1AndPaint: function() {

          millFromTo(new THREE.Vector3(0, 0, 0), 
						new THREE.Vector3(20, 0, 50));
          changed = true;
      },

      mill2AndPaint: function() {
          scene.remove(newMesh);
          changed = true;
      },

      mill3AndPaint: function() {

          setCubeColor('blue');
          changed = true;
      }
  }
})();
