
/*
	PURPOSE: This simple script checks the query on a page, and determines if it is a "test" run;
				A test run is determined by the URL query having a name/value pair of "test=1"

	DEPENDENCIES: This script assumes that the common "mydoc" object has already been loaded.
	
	HOW TO USE:  In any other script loaded on the page, simply call this function; It will return a bool;
*/

// Sets a flag if this is a TEST RUN
function checkTestRun()
{
	let queryMap = mydoc.get_query_map();
	var is_test_run = (queryMap != undefined && queryMap.hasOwnProperty("test") && queryMap["test"] == "1")

	if(is_test_run)
	{
		mydoc.addTestBanner();
		// mydoc.setPassThroughParameters(".pass_through_params", "test", "1");
	}
		
	return is_test_run;
}