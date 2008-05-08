importClass(java.io.File);
importClass(Packages.org.apache.tools.ant.util.FileUtils);
importClass(java.io.FileReader);

var options;
var fileset;
var ds;
var srcFiles;
var jsfile;
var testfailed = false;

function loadFile(file) {
    var reader = new FileReader(file);
    return (new String(FileUtils.readFully(reader))).toString(); 
}

function runTest(file) {

	function failingTestMessage(testName, e) {
		if (options.verbose) {
			self.log("Failed: " + testName + ", " + e, 0);
			if (options.stackTrace && e.stackTrace) {
				self.log(e.stackTrace);
			}
			self.log("");
		}
	}
	
	function erroringTestMessage(testName, e) {
		if (options.verbose) {
			self.log("Error: " + testName + ", Reason: " + e, 0);
			
			if (e.rhinoException) {
				var stackTrace = getStackTraceFromRhinoException(e.rhinoException);
				var traceString = extractScriptStackTraceFromFullStackTrace(stackTrace, /runTest/);
				self.log("The line number of the error within the file being tested is probably -> " + traceString.match(/:([0-9]+)/)[1] + " <-");
				self.log(traceString);
			}
			self.log("");
		}
	}

	var test = {};
	
	eval(loadFile(file));
	
	var testCount = 0;
	var failingTests = 0;
	var erroringTests = 0;
	
	for (var testName in test) {
		var assert = new Assert();
		
		if (testName === "setUp" || testName === "tearDown") {
			continue;
		}
		
		testCount++;
		try {
		    if (test.setUp) {
				test.setUp();
			}
			test[testName]();
			assert.test();
		} catch (e) {
			if (e.constructor === AssertionException) {
				failingTests++;
				failingTestMessage(testName, e);
			} else {
				erroringTests++;
				erroringTestMessage(testName, e);
			}
			testfailed = true;
		}
		if (test.tearDown) {
			test.tearDown();
		}
	}

    self.log("Tests run: " + testCount + ", Failures: " + failingTests + ", Errors: " + erroringTests);
	self.log("");
	
}
				
eval("options = " + attributes.get("options") + ";");
eval(loadFile("src/rhinoUnitUtil.js"));

var filesets = elements.get("fileset");
for (var j = 0; j < filesets.size(); j++) {

	fileset = filesets.get(j);

	fileset = elements.get("fileset").get(0);
	ds = fileset.getDirectoryScanner(project);
	srcFiles = ds.getIncludedFiles();

	forEachElementOf(srcFiles, function (srcFile) {
		self.log("Testsuite: " + srcFile);
		jsfile = new File(fileset.getDir(project), srcFile);

		runTest(jsfile);
	});
}

if (testfailed) {
	self.fail("RhinoUnit failed.");
}

