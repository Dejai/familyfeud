/**********************************************************************************************************
	Author: Derrick Fyfield
	Purpose:
		This "common" script will house things that I would want to reuse throughout this local server

**********************************************************************************************************/

// customObject = Pass in a custom object with variables/values that you would want to use with the data returned from the ajax call 

/*
	This object is used to make local server AJAX calls easier; 
*/

// EXTENSION METHODS 
	// if (typeof Array.prototype.contains !== "function"){ Array.prototype.contains = function(value){ return this.includes(value); } }
	// if (typeof Object.prototype.contains !== "function"){ Object.prototype.contains = function(value) { return this[value] != undefined; } }


const Logger = { 
	log: function(content){ 
			console.log("LOGGER: " + content); 
		},
	errorHandler: function(err){
					console.log("ERROR");
					console.log(err);
				}
}

const mydoc = {

	ready: function(callback){
		document.addEventListener("DOMContentLoaded", callback);
	},

	loadContent: function(content, identifier)
	{
		element = document.getElementById(identifier);
		element.innerHTML = content;
	},

	// Show a section based on given ID
	show_section: function(section_id){
		document.getElementById(section_id).classList.remove("hidden");
	},

	// Hide a section based on given ID
	hide_section: function(section_id)
	{
		document.getElementById(section_id).classList.add("hidden");
	},

	get_query_map: function(){
		let query_string = location.search;
		let query = query_string.replace("?", "")
		var query_map = {}
		var combos = query.split("&");
		combos.forEach(function(obj)
		{
			let splits = obj.split("=");
			query_map[splits[0]] = splits[1];
		});
		return query_map;
	}
};
const myajax = { 
	
	GetContentType: function(type){
		switch(type){
			case "JSON":
			case "json":
				return "application/json";
			default:
				return "text/plain";
		}
	},

	isValidAjaxObject: function(object){
		let state = {isValid: true, message:"All set"};

		if ( !object.hasOwnProperty("method") )
		{
			state.isValid = false;
			state.message = "Missing TYPE of call (GET vs. POST)";
			return state;
		}

		if (object["method"] == "POST" && !object.hasOwnProperty("data"))
		{
			state.isValid = false;
			state.message = "Doing a POST - but with no data";
		}

		return state;
	},

	AJAX: function(object){
		let checkObject = myajax.isValidAjaxObject(object);
		if (!checkObject.isValid){
			throw new Error(checkObject.message);
		}

		// Getting/Setting the parts of the call
		let method 	= object["method"];
		let path 	= object["path"];

		let success = object.hasOwnProperty("success") ? object["success"] : function(request){console.log(request);};
		let failure = object.hasOwnProperty("failure") ? object["failure"] : function(request){console.log(request);};

		// Setting up the request object
		var xhttp = new XMLHttpRequest();
		xhttp.open(method, path, true);

		// What to do after the call is made
		xhttp.onreadystatechange = function() {
			request = this;
			if (request.readyState == 4 && request.status == 200)
			{
				success(request);
			}
			else if (request.readyState == 4 && request.status != 200)
			{
				failure(request);
			}
		};

		if(object.hasOwnProperty("cacheControl"))
		{
			xhttp.setRequestHeader('Cache-Control', object["cacheControl"]);
		}

		// Send/proces the request
		if ( object.hasOwnProperty("data_json") && object["datatype"] == "JSON" )
		{
			let data = object["data"];
			xhttp.setRequestHeader('Content-type', 'application/json');
			xhttp.send(data);
		}
		else if ( object.hasOwnProperty("data") )
		{
			let data = object["data"];
			let content_type = "application/x-www-form-urlencoded";
			if(object.hasOwnProperty("content_type"))
			{
				content_type = object["content_type"];
				data = JSON.stringify(data);
			}
			xhttp.setRequestHeader('Content-type', content_type);
			xhttp.send(data);
		}
		else
		{
			xhttp.send();
		}
	}

}