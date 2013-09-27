function ThreeJsCtrl($scope) {
	$scope.millDiameter = 10;
	$scope.gcode = "g0 x0 y0 z10\ng1 z-110\nx30\ny30\nx0\ny0";
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
}


