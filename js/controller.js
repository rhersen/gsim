function ThreeJsCtrl($scope) {
	$scope.tools = [
	    {diameter: 10},
	    {diameter: 20}];
	$scope.gcode = "g0 x0 y0 z10\nm6 t2\ng1 z-10\nx30\ny30\nx0\ny0\nm6 t1\ng1 z-110\nx30\ny30\nx0\ny0";
	$scope.errorMessage = "";
	
	$scope.addTool = function() {
		$scope.tools.push({diameter: ""});
	}

    $scope.deleteTool = function(tool) {
      var i = $scope.tools.indexOf(tool);
      $scope.tools.splice(i, 1);
      $scope.$apply();
  }

    $scope.removeLastTool = function() {
      if ($scope.tools.length > 0) {
          $scope.tools = $scope.tools.slice(0, -1);
      }
  }

	$scope.Mill1 = function() {
		try {
			$scope.errorMessage = "";
			var d = parseFloat($scope.tools[0].diameter);
			if (isNaN(d)) {
				throw "invalid mill diameter";
			}
		 	scene.millGCode($scope.gcode, $scope.tools);
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


