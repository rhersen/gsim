function ThreeJsCtrl($scope, gcodeinterpreter, scene) {
    $scope.workpiece = {width: 300, height: 100, depth: 200};
	$scope.tools = [{diameter: 10}, {diameter: 20}];
	$scope.gcode = "g0 x0 y0 z10\nm6 t2\ng1 z-10\nx30\ny30\nx0\ny0\nm6 t1\ng1 z-110\nx30\ny30\nx0\ny0";
	$scope.errorMessage = "";
	$scope.unit = "mm";
	
	$scope.setWorkpieceSize = function() {
	  console.log("setWorkpieceSize");
	  scene.setWorkpieceSize($scope.workpiece);
	}
	
	$scope.addTool = function() {
		$scope.tools.push({diameter: ""});
		$scope.$apply();
		$( "#tools" ).find( "input" ).focus();
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

	$scope.run = function() {
		try {
			$scope.errorMessage = "";
			gcodeinterpreter.setGCode($scope.gcode);
			gcodeinterpreter.setTools($scope.tools)
			gcodeinterpreter.run();
		} catch(err) {
			if (err instanceof SyntaxError) {
				$scope.errorMessage = err.message;
				selectTextareaLine(document.getElementById('gcodeTextArea'), err.lineNo);
			} else {
				$scope.errorMessage = err;
			}
		}
	}
	
    $scope.step = function() {
      if (gcodeinterpreter.isStopped()) {
        gcodeinterpreter.setGCode($scope.gcode);
        gcodeinterpreter.setTools($scope.tools)
      }
      gcodeinterpreter.step();
      selectTextareaLine(document.getElementById('gcodeTextArea'), gcodeinterpreter.getCurrentLine());
    }
    
    $scope.stop = function() {
      gcodeinterpreter.stop();
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


}


