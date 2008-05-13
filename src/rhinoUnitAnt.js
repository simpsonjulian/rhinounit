/*
Copyright (c) 2008, Tiest Vilee
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * The names of its contributors may not be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

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

var ignoredGlobalVars = attributes.get("ignoredglobalvars") ? attributes.get("ignoredglobalvars").split(" ") : [];
function ignoreGlobalVariableName(name) {
	var foundVariable = false;
	forEachElementOf(ignoredGlobalVars, function (ignoredGlobalVar) {
		if (ignoredGlobalVar == name) {
			foundVariable = true;
		}
	});
	return foundVariable;
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

		var globalVars = {};
		var varName;
		for (varName in this) {
			globalVars[varName] = true;
		}
		
		runTest(jsfile);
		
		for (varName in this) {
			if (! globalVars[varName]) {
				if (ignoreGlobalVariableName(varName)) {
					delete this[varName];
				} else {
					self.log("Warning: " + srcFile + ", Reason: Polluted global namespace with '" + varName + "'", 0);
					testfailed = true;
				}
			}
		}

	});
}

if (testfailed) {
	self.fail("RhinoUnit failed.");
}

