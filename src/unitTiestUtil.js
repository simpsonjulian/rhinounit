
/* Generally useful utils */
function getFunctionNameFor(theFunction) {
	return /function (.*)\(/.exec("" + theFunction)[1];
}

function getConstructorNameFor(theObject) {
	return getFunctionNameFor(theObject.constructor);
}

function inspectObject(theObject) {
	if (theObject.getClass) {
		project.log(theObject.getClass() + ":");
	} else {
		project.log(getConstructorNameFor(theObject) + ":");
	}
	for (var w in theObject) {
		project.log("-- " + w);
	}
}

function forEachElementOf(list, doThis) {
    var listLength = list.length;
    for (var i = 0; i < listLength; i++) {
        doThis(list[i], i);
    }
}

function forEachElementOfReversed(list, doThis) {
	var reversedList = [].concat(list).reverse();
    forEachElementOf(reversedList, doThis);
}

function testCases(test) {
	forEachElementOf(arguments, function (testFunction, index) {
		if (index > 0) {
			test[getFunctionNameFor(testFunction)] = testFunction;
		}
	});
}

/* Very Rhino specific way of getting the stack trace so we know where the error happened */
function getStackTraceFromRhinoException(exception) {
	var outputStream = new java.io.ByteArrayOutputStream();
	var printStream = new java.io.PrintStream(outputStream);
	exception.printStackTrace(printStream);
	return outputStream.toString();
}


function extractScriptStackTraceFromFullStackTrace(trace, ignoreAfterMatching) {
	var result = [];
	var lines = trace.split("[\n\r\f]");
	for (var i = 0; i < lines.length; i++) {
		if (/at script/.test(lines[i]) && ! /callStack/.test(lines[i])) {
			result.push(lines[i]);
			if (ignoreAfterMatching && ignoreAfterMatching.test(lines[i])) {
				break;
			}
		}
	}
	return result.join("\n");
}

/**
 * Simulates a 'real' Exception by calling a non-existant menthod.  This real EcmaException
 * is then used to extract the script call stack.
 **/
function callStack() {
	try {
		this.doesntexist();
	} catch (e) {
		var stackTrace = getStackTraceFromRhinoException(e.rhinoException);
		return extractScriptStackTraceFromFullStackTrace(stackTrace, /runTest/);
	}
}

function AssertionException(message, stackTrace) {
	this.message = message;
	this.toString = function () {
		return message;
	};
	this.stackTrace = stackTrace;
}

AssertionException.print = function (object) {
	if (typeof object === "object") {
		return constructorNameFor(object) + ":" + object;
	}
	return typeof object + ":" + object;
};

AssertionException.printString = function (string, start, end) {
	return string.substring(0, start) + "[" + string.substring(start, end) + "]" + string.substring(end);
};

AssertionException.stringDif = function (expected, actual) {
	var startPoint;
	for (startPoint = 0; startPoint < actual.length; startPoint++) {
		if (actual[startPoint] !== expected[startPoint]) {
			break;
		}
	}
	
	var actualEndPoint, expectedEndPoint = expected.length;
	for (actualEndPoint = actual.length; actualEndPoint > 0;) {
		actualEndPoint--;
		expectedEndPoint--;
		if (actual[actualEndPoint] !== expected[expectedEndPoint]) {
			break;
		}
	}
	
	actualEndPoint++;
	expectedEndPoint++;
	return "expected:<" + AssertionException.printString(expected, startPoint, expectedEndPoint) + "> but was:<" + AssertionException.printString(actual, startPoint, actualEndPoint) + ">";
};

// O(n^2)
AssertionException.intersection = function (expected, actual) {
	var result = [];
	for (var i = 0; i < expected.length; i++) {
		for (var j = 0; j < actual.length; j++) {
			if (expected[i] === actual[j]) {
				result.push(expected[i]);
			}
		}
	}
	return result;
};

AssertionException.cloneArray = function (array) {
	return [].concat(array);
};


function eq(expected) {
	return function (actual, not) {
		if (not) {
			if (actual === expected) {
				return "was expecting something different from:<" + AssertionException.print(expected) + "> but was:<" + AssertionException.print(actual) + ">"; 
			}
		} else {
			if (actual !== expected) {
				if (typeof expected === "string" && typeof actual === "string") {
					return AssertionException.stringDif(expected, actual);
				}
				return "expected:<" + AssertionException.print(expected) + "> but was:<" + AssertionException.print(actual) + ">"; 
			}
		}
	};
}

function similar(expected) {
	return function (actual, not) {
		if (not) {
			if (actual == expected) {
				return "was expecting something different from:<" + AssertionException.print(expected) + "> but was:<" + AssertionException.print(actual) + ">"; 
			}
		} else {
			if (actual != expected) {
				if (typeof expected === "string" && typeof actual === "string") {
					return AssertionException.stringDif(expected, actual);
				}
				return "expected:<" + AssertionException.print(expected) + "> but was:<" + AssertionException.print(actual) + ">"; 
			}
		}
	};
}

function matches(regExp) {
	return function (actual, not) {
		if (not) {
			if (regExp.test(actual)) {
				return "<" + actual + "> should not have matched " + regExp; 
			}
		} else {
			if (!regExp.test(actual)) {
				return "<" + actual + "> did not match " + regExp; 
			}
		}
	};
}

function isTrue(message) {
	return function (actual, not) {
		if (not) {
			if (actual) {
				return message || "Should have been falsey:<" + actual + ">";
			}
		} else {
			if (!actual) {
				return message || "Should have been truey:<" + actual + ">";
			}
		}
	};
}

function not(predicate) {
	return function (actual, not) {
		if (not) {
			return predicate(actual);
		} else {
			return predicate(actual, true);
		}
	};
}

function and() {
}

function hasConstructor(expected) {
	return function (actual, not) {
		if (not) {
			if (constructorNameFor(actual) === expected) {
				return "expected:<" + AssertionException.print(actual) + "> should not have a constructor of:<" + expected + ">, but it did";
			}
		} else {
			if (constructorNameFor(actual) !== expected) {
				return "expected:<" + AssertionException.print(actual) + "> to have a constructor of:<" + expected + "> but it was " + (typeof actual);
			}
		}
	};
}

function isA(expected) {
	return function (actual, not) {
		if (not) {
			if (actual instanceof expected) {
				return "expected:<" + AssertionException.print(actual) + "> should not be a:<" + AssertionException.print(expected) + ">, but it is";
			}
		} else {
			if (!(actual instanceof expected)) {
				return "expected:<" + AssertionException.print(actual) + "> should be a:<" + AssertionException.print(expected) + ">, but it isn't";
			}
		}
	};
}

function isOfType(expected) {
	return function (actual, not) {
		if (not) {
			if (typeof actual === expected) {
				return "expected:<" + AssertionException.print(actual) + "> to be of any type except:<" + expected + ">, but it was";
			}
		} else {
			if (typeof actual !== expected) {
				return "expected:<" + AssertionException.print(actual) + "> to be of type:<" + expected + "> but it was " + (typeof actual);
			}
		}
	};
}

function isCollectionContaining() {
	var expected = cloneArray(arguments);
	return function (list, not) {
		if (not) {
			if (intersection(expected, list).length === expected.length) {
				return "should not have found:<" + expected + "> in:<" + list + ">";
			}
		} else {
			if (intersection(expected, list).length !== expected.length) {
				return "couldn't find:<" + expected + "> in:<" + list + ">";
			}
		}
	};
}

function isNull(message) {
	return function (actual, not) {
		if (not) {
			if (actual === null) {
				return message || "Should NOT have been null:<" + AssertionException.print(actual) + ">";
			}
		} else {
			if (actual !== null) {
				return message || "Should have been null:<" + AssertionException.print(actual) + ">";
			}
		}
	};
}

/*
containsInOrder
floatEq
*/

function Assert() {

	var assert = this;

	assert.that = function (actual, predicate) {
		var result = predicate(actual);
		if (result) {
			throw new AssertionException(result, callStack());
		}
	};
	
	var assertions = [];
	
	assert.mustCall = function (onThisObject, thisMethod) {
		var originalFunction = onThisObject[thisMethod];
		onThisObject[thisMethod] = assert.functionThatMustBeCalled(thisMethod, originalFunction);
	};
	
	assert.mustNotCall = function (onThisObject, thisMethod) {
		onThisObject[thisMethod] = assert.functionThatMustNotBeCalled(thisMethod);
	};
	
	assert.functionThatMustNotBeCalled = function (thisMethod) {
		return function () {
			assert.fail("\n--> function '" + (thisMethod || "anonymous") + "' should not have been called. <--\n");
		};
	};
	
	assert.functionThatMustBeCalled = function (thisMethod, originalFunction) {
		
		var hasBeenCalled = false;
		var theFunction = function () {
			hasBeenCalled = true;
			if (originalFunction) {
				originalFunction.apply(this, arguments);
			}
		};
		
		assertions.push(function () {
			assert.that(hasBeenCalled, isTrue("\n--> function '" + (thisMethod || "anonymous") + "' was not called. <--\n"));
		});
		
		return theFunction;
	};
	
	assert.test = function () {
		forEachElementOf(assertions, function (assertion) {
			assertion();
		});
	};
	
	assert.fail = function (message) {
		assert.that(false, isTrue(message || "failed"));
	};
}

function fail(message) {
	(new Assert()).fail(message);
}

function shouldThrowException(theTest, message, checkException) {
	try {
		theTest();
		fail(message || "An exception was expected, but not thrown.");
	} catch (e) {
		if (e.constructor === AssertionException) {
			throw e;
		}
		if (checkException) {
			checkException(e);
		}
	}
}
