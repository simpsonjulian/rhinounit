
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
		anObject.defaultFunction = function (aString) {
			assert.that(aString, eq("a string"));
		}
		assert.mustCall(anObject, "defaultFunction");
		anObject.defaultFunction("a string");
	},
	
	function checkCollectionContaining() {
		assert.that([1,2,3], isCollectionContaining(2,3));
	},
	
	function checkCollectionNotContaining() {
		assert.that([1,3], not(isCollectionContaining(2,4)));
	},
	
	function checkCollectionContainingInOrder() {
		assert.that([1,3,2], containsInOrder(1,3,2));
	},
	
	function checkCollectionDoesntContainInOrder() {
		assert.that([1,3,2], not(containsInOrder(1,2,3)));
	},
	
	function checkFloatComparison() {
		assert.that(1.009, eqFloat(1.0));
	},
	
	function checkNotFloatComparison() {
		assert.that(1.011, not(eqFloat(1.0)));
	},
	
	function checkFloatComparisonWithAccuracy() {
		assert.that(1.9, eqFloat(1.0, 1.0));
	}
	
);