function ThreeJsCtrl($scope) {

	$scope.millDiameter = 10;
	$scope.gcode = "g0 x10 y10 z10\ng0 z-10\ng1 x30\n";
	$scope.errorMessage = "";

	$scope.Mill1 = function() {
		try {
			$scope.errorMessage = "";
			var d = parseFloat($scope.millDiameter);
			if (isNaN(d)) {
				throw "invalid mill diameter";
			}
		 	scene.millGCode($scope.gcode, d);
		} catch(err) {
			if (err instanceof SyntaxError) {
  			$scope.errorMessage = err.message;
				scene.selectGCodeLine(err.lineNo);
			} else {
  			$scope.errorMessage = err;
			}
  	}

	}

	$scope.Mill2 = function() {
		  scene.mill2AndPaint();
	}

	$scope.Mill3 = function() {
		  scene.mill3AndPaint();
	}

}


