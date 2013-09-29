	function SyntaxError(message, lineNo) {
		this.name = "SyntaxError";
		this.message = message;
		this.lineNo = lineNo;
	}
	SyntaxError.prototype = new Error();
	SyntaxError.prototype.constructor = SyntaxError;


