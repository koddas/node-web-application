var express = require('express');
var async = require('async');
var rest = require('restler');
var router = express.Router();
//var insult = require('../private_modules/insult');

var insult = { message: null, from: null };
var availableInsults = ["thanks", "fascinating", "because", "bye", "diabetes"];

/* GET home page. */
router.get('/', function(req, res, next) {
	async.parallel([
	    function(callback) {
	    	var d = new Date();

	    	// First, fetch today's name
	    	url = "http://api.dryg.net/dagar/v2/" + d.getFullYear() + "/"
	    	+ d.getMonth() + "/" + d.getDate();
	    	rest.get(url, {parser: rest.parsers.json}).on('complete', function (data) {
	    		// Cool, we have a name. Let's get the insult from FOaaS and return it.
	    		insult.from = firstElement(firstElement(data.dagar).namnsdag);
	    		callback();
	    	});
	    },
	    function (callback) {
	    	url = "http://foaas.herokuapp.com/" + drawInsult() + "/foo";
	    	heads = { 'Accept': 'application/json',
	    			  'User-Agent': 'Restler for node.js' };
	    	
	    	rest.get(url, {headers: heads}).on("complete", function (data) {
	    		insult.message = data.message;
	    		callback();
	    	});
	    }
	],
    function (err) {
    	if (err) res.send("Nope. Error.");
    	if (req.headers.accept.match("application\/json")) {
    		res.send(insult);
    	} else {
    		res.render('insult', { title: "Today's insult", insult: insult });
    	}
    });
});

router.get('/:year/:month/:day', function(req, res, next) {
	async.parallel([
        function(callback) {
    	   url = "http://api.dryg.net/dagar/v2/" + req.params.year + "/"
    	   + req.params.month + "/" + req.params.day;
    	   rest.get(url, {parser: rest.parsers.json}).on('complete', function (data) {
    		   // Cool, we have a name. Let's get the insult from FOaaS and return it.
    		   insult.from = firstElement(firstElement(data.dagar).namnsdag);
    		   callback();
    	   });
        },
        function (callback) {
        	url = "http://foaas.herokuapp.com/" + drawInsult() + "/foo";
        	heads = { 'Accept': 'application/json',
        			'User-Agent': 'Restler for node.js' };

        	rest.get(url, {headers: heads}).on("complete", function (data) {
        		insult.message = data.message;
        		callback();
        	});
        }
    ],
	function (err) {
		if (err) res.send("Nope. Error.");
		if (req.headers.accept.match("application\/json")) {
			res.send(insult);
		} else {
			date = req.params.year + "-" + req.params.month + "-"
				 + req.params.day;
			res.render('insult', { title: "Insult at " + date,
					insult: insult });
		}
	});
});

module.exports = router;

function firstElement(list) {
	for (element in list) {
		return list[element];
	}
}

function drawInsult() {
	return availableInsults[Math.floor(Math.random() * 5)];
}