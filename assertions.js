

function forEachElementOf(list, fn) {
	for(var forEachElementOfIndex = 0; forEachElementOfIndex < list.length; forEachElementOfIndex++) {
		fn(list[forEachElementOfIndex], forEachElementOfIndex);
	}
}

function constructorNameFor(object) {
	return /function\W*(\w+)\(/.exec(object.constructor)[1];
}

function AssertionException(message) {
	this.message = message;
	this.toString = message;
}

AssertionException.print = function (object) {
	if (typeof object === "object") {
		return constructorNameFor(object) + ":" + object;
	}
	return typeof object + ":" + object;
}

AssertionException.printString = function(string, start, end) {
	return string.substring(0, start) + "[" + string.substring(start, end) + "]" + string.substring(end);
}

function assertThat(actual, predicate) {
	var result = predicate(actual);
	if (result) {
		throw result; // new AssertionException(result);
	}
}

AssertionException.stringDif = function (expected, actual) {
	var startPoint;
	for (startPoint = 0; startPoint<actual.length; startPoint++) {
		if (actual[startPoint] !== expected[startPoint]) {
			break;
		}
	}
	
	var actualEndPoint, expectedEndPoint = expected.length;
	for (actualEndPoint = actual.length; actualEndPoint>0; ) {
		actualEndPoint--;
		expectedEndPoint--;
		if (actual[actualEndPoint] !== expected[expectedEndPoint]) {
			break;
		}
	}
	
	actualEndPoint++;
	expectedEndPoint++;
	return "expected:<" + AssertionException.printString(expected, startPoint, expectedEndPoint) + "> but was:<" + AssertionException.printString(actual, startPoint, actualEndPoint) + ">";
}

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
	}
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
	}
}

function matches(regExp) {
	return function(actual, not) {
		if (not) {
			if (regExp.test(actual)) {
				return "<" + actual + "> should not have matched " + regExp; 
			}
		} else {
			if (!regExp.test(actual)) {
				return "<" + actual + "> did not match " + regExp; 
			}
		}
	}
}

function not(predicate) {
	return function (actual, not) {
		if (not) {
			return predicate(actual);
		} else {
			return predicate(actual, true);
		}
	}
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
	}
}

function isA(expected) {
	return function (actual, not) {
		if (not) {
			if (actual instanceof expected) {
				return "expected:<" + AssertionException.print(actual) + "> should not be a:<" + AssertionException.print(expected) + ">, but it is";
			}
		} else {
			if ( ! (actual instanceof expected)) {
				return "expected:<" + AssertionException.print(actual) + "> should be a:<" + AssertionException.print(expected) + ">, but it isn't";
			}
		}
	}
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
	}
}


function intersection(expected, actual) {
	var result = []
	for(var i=0; i<expected.length; i++) {
		for(var j=0; j<actual.length; j++) {
			if (expected[i] === actual[j]) {
				result.push(expected[i]);
			}
		}
	}
	return result;
}

function cloneArray(array) {
	var result = [];
	for(var i=0; i<array.length; i++){
		result.push(array[i]);
	}
	return result;
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
	}
}

function MyClass() {}
function MyChildClass() {}

myClass = new MyClass();
MyChildClass.prototype = myClass;

myChildClass = new MyChildClass();

assertThat(myChildClass, isA(myClass));
assertThat(myChildClass, not(isA(myChildClass)));
assertThat(myChildClass, not(isA(myClass)));
assertThat(1, eq(2));
assertThat(myChildClass, isA(myChildClass));


assertThat(myClass, hasConstructor("MyClass"));
assertThat(myClass, not(hasConstructor("string")));
assertThat(myClass, not(hasConstructor("MyClass")));

assertThat("", isOfType("string"));
assertThat("", not(isOfType("string")));


assertThat([1,2,3], matchesCollection([1,2,3]));
assertThat([1,3], matchesCollection([1,2,3]));


assertThat([1,2,3], isCollectionContaining(2,3));
//assertThat([1,3], isCollectionContaining(1,2));


assertThat([1,3], not(isCollectionContaining(2)));
assertThat([1,2,3], not(isCollectionContaining(2)));

assertThat("1785", not(similar(12345)));
assertThat("12345", not(similar(123445)));
assertThat("john mary", not(matches(/and/)));
assertThat("john and mary", not(matches(/and/)));

