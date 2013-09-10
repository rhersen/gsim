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
				selectTextareaLine(document.getElementById('gcodeTextArea'), err.lineNo);
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


}


