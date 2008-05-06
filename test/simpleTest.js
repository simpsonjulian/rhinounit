
var anObject;

testCases(test,

	function setUp() {
		anObject = {
			defaultFunction : function () {
			},
			defaultProperty : 1,
			defaultString : "john and mary"
		}
	},
	
	function defaultPropertyIs1() {
		assert.that(anObject.defaultProperty, eq(1));
	},
	
	function defaultPropertySimilarToString1() {
		assert.that(anObject.defaultProperty, similar("1"));
	},
	
	function defaultStringIsJohnAndMary() {
		assert.that(anObject.defaultString, eq("john and mary"));
	},
	
	function defaultStringMatchesAnd() {
		assert.that(anObject.defaultString, matches(/and/));
	},
	
	function checkIsNull() {
		assert.that(null, isNull());
	},
	
	function checkIsTrue() {
		assert.that(true, isTrue());
	},	
	function defaultPropertyIsNot2() {
		assert.that(anObject.defaultProperty, not(eq(2)));
	},
	
	function defaultPropertyIsNotSimilarToString2() {
		assert.that(anObject.defaultProperty, not(similar("2")));
	},
	
	function defaultStringIsNoteSomethingElse() {
		assert.that(anObject.defaultString, not(eq("something else")));
	},
	
	function defaultStringDoesntMatchElse() {
		assert.that(anObject.defaultString, not(matches(/else/)));
	},
	
	function checkIsNotNull() {
		assert.that(".", not(isNull()));
	},
	
	function checkIsNotTrue() {
		assert.that(false, not(isTrue()));
	},
	
	function checkShouldThrowException() {
		shouldThrowException(
			function () {
				throw "an error";
			},
			"Should have thrown an exception or something");
	},
	
	function defaultFunctionIsCalled() {
		assert.mustCall(anObject, "defaultFunction");
		anObject.defaultFunction();
	}
	
);