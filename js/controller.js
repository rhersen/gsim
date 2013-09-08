function ThreeJsCtrl($scope) {

	$scope.gcode = "g0 x10 y10 z10\ng0 z-10\ng1 x30\n";

	$scope.Mill1 = function() {
		  scene.millGCode($scope.gcode, 20);
	}

	$scope.Mill2 = function() {
		  scene.mill2AndPaint();
	}

	$scope.Mill3 = function() {
		  scene.mill3AndPaint();
	}
    
}


