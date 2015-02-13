// First, let's include required modules

var express = require('express'); // The Express framework
var async = require('async');     // Async, a library for simplifying asynchronous calls
var rest = require('restler');    // Restler, a library for simplifying REST service calls

// Initialize a router object. Please refer to Express's documentation for more info.
var router = express.Router();

// The insult object is visible to all functions. It is used to store both the
// insult and the insulter's name
var insult = { message: null, from: null };

// The list of available insults is in fact a list of some of the endpoints
// made available by the FOAAS web service.
var availableInsults = ["thanks", "fascinating", "because", "bye", "diabetes"];

/*
 * The /insult endpoint. The "/" marker is relative to the path specified at
 * row 26 in app.js.
 */
router.get('/', function(req, res, next) {
	// We will call the Svenska Dagar and FOAAS services in parallel. In order
	// to do that in an easier-to-understand fashion, we'll use the Async
	// library's parallel function, which takes two parameters: an array of
	// functions, and a callback function that will be run once the arrayed
	// functions have finished.
	async.parallel([
	    // Fetch today's name from Svenska dagar
	    function (callback) {
	    	var d = new Date();
	    	url = "http://api.dryg.net/dagar/v2/" + d.getFullYear() + "/";
	    	+ d.getMonth() + "/" + d.getDate();
	    	rest.get(url, {parser: rest.parsers.json})
	    		.on('complete', function (data) {
	    		// Cool, we have a name. Let's update our insult object with it
	    		insult.from = firstElement(firstElement(data.dagar).namnsdag);
	    		callback();
	    	});
	    },
	    // Fetch an insult from FOAAS
	    function (callback) {
	    	url = "http://foaas.herokuapp.com/" + drawInsult() + "/foo";
	    	heads = { 'Accept': 'application/json' };
	    	
	    	rest.get(url, {headers: heads}).on("complete", function (data) {
	    		// Neat, the insult is generated. Save it in our insult object.
	    		insult.message = data.message;
	    		callback();
	    	});
	    }
	],
	// This function is run when the two fetching functions above have
	// finished. This is where the response is sent to the user.
    function (err) {
		// Send an error if something went wrong
    	if (err) res.send("Nope. Error.", 500);
    	
    	if (req.headers.accept.match("application\/json")) {
    		// The user has requested a JSON response
    		res.setHeader('Content-Type', 'application/json');
    		res.send(insult);
    	} else {
    		// The user wants an HTML response
    		res.render('insult', { title: "Today's insult", insult: insult });
    	}
    });
});

/*
 * The /insult/year/month/day endpoint. The "/year/month/day" marker is
 * relative to the path specified at row 26 in app.js.
 */
router.get('/:year/:month/:day', function(req, res, next) {
	// We will call the Svenska Dagar and FOAAS services in parallel. In order
	// to do that in an easier-to-understand fashion, we'll use the Async
	// library's parallel function, which takes two parameters: an array of
	// functions, and a callback function that will be run once the arrayed
	// functions have finished.
	async.parallel([
	    // Fetch a name from Svenska dagar
	    function(callback) {
    	   url = "http://api.dryg.net/dagar/v2/" + req.params.year + "/"
    	   + req.params.month + "/" + req.params.day;
    	   rest.get(url, {parser: rest.parsers.json})
    	   	   .on('complete', function (data) {
    		   // Cool, we have a name. Let's update our insult object with it
    		   insult.from = firstElement(firstElement(data.dagar).namnsdag);
    		   callback();
    	   });
        },
	    // Fetch an insult from FOAAS
        function (callback) {
        	url = "http://foaas.herokuapp.com/" + drawInsult() + "/foo";
        	heads = { 'Accept': 'application/json' };

        	rest.get(url, {headers: heads}).on("complete", function (data) {
        		// Neat, the insult is generated. Save it in our insult object.
        		insult.message = data.message;
        		callback();
        	});
        }
    ],
	// This function is run when the two fetching functions above have
	// finished. This is where the response is sent to the user.
	function (err) {
		// Send an error if something went wrong
		if (err) res.send("Nope. Error.", 500);
		
		if (req.headers.accept.match("application\/json")) {
    		// The user has requested a JSON response
			res.setHeader('Content-Type', 'application/json');
			res.send(insult);
		} else {
    		// The user wants an HTML response
			date = req.params.year + "-" + req.params.month + "-"
				 + req.params.day;
			res.render('insult', { title: "Insult at " + date,
					insult: insult });
		}
	});
});

module.exports = router;

// Since Javascript has a somewhat weird way of dealing with arrays and
// other compound objects, such as lists, this is the easiest way of
// returning the first element in a list, an array or whatever.
function firstElement(list) {
	for (element in list) {
		return list[element];
	}
}

// Draw an insult at random from the pool of available FOAAS endpoints.
function drawInsult() {
	return availableInsults[Math.floor(Math.random() * 5)];
}