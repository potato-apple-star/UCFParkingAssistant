"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const scrape_garage = require("./scrape-ucf-garage");
const predict_garage = require("./prediction-ucf-garage");

const restService = express();

var garages = {
  "A": 0,
  "B": 1,
  "C": 2,
  "D": 3,
  "H": 4,
  "I": 5,
  "Libra": 6
}

var garage_capacity = {
  "A": "1623",
  "B": "1259",
  "C": "1852",
  "D": "1241",
  "H": "1284",
  "I": "1231",
  "Libra": "1007"
}

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());

restService.post("/garage", function(req, res) {
  scrape_garage().then(function(garageJSON){
    var intent = intents[req.body.queryResult.intent.displayName];

    if (intent)
      return intent(req, res, garageJSON);

    return res.json({});
  })
});



restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});






var intents = {
  "SpotsLeft": intentSpotsLeft,
  "SpotsTaken": intentSpotsTaken
}






var flavortextSpotsTaken = {
  0: function(garage, count,total){
    return "In "+garage +", there are "+ count+" cars parked out of "+total;
  },
  1: function(garage, count,total){
    return "There are "+count +" cars out of " + total + " in garage " + garage;
  },
  2: function(garage,count,total){
    return "Garage "+ garage +" is "+ parseInt((count/total)*100)+ "% full";
  }

}

var flavortextSpotsLeft = {
  0: function(garage, count) {
    return (count < 50) ? "Only " + count.toString() + " spots left!" : "There's " + count.toString() + " spots left!";
  },
  1: function(garage, count) {
    return "There's " + count.toString() + " parking spots";
  },
  2: function(garage, count) {
    return count.toString() + " spots";
  },
  3: function(garage, count) {
    return "Garage " + garage + " currently has " + count.toString() + " spots left";
  },
  4: function(garage, count) {
    return "There are " + count.toString() + " spots left in garage " + garage;
  }
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
var flavorCounter1 = getRandomInt(5);
var flavorCounter2 = getRandomInt(3);
function intentSpotsLeft(req, res, garageJSON){
  flavorCounter1 = getRandomInt(5);
  var garage_name = req.body.queryResult.parameters.garage;
  var responseText;


  if (garageJSON[garages[garage_name]])
    responseText = flavortextSpotsLeft[flavorCounter1](garage_name, parseInt(garageJSON[garages[garage_name]]));


  return res.json({
    "fulfillmentText": responseText,
    "payload": {
      "google": {
        "expectUserResponse": true
      }
    }
  });
}
function intentSpotsTaken(req,res,garageJSON){
  flavorCounter2 = getRandomInt(3);
  var garage_name = req.body.queryResult.parameters.garage;
  var responseText;


  if(garageJSON[garages[garage_name]])
    responseText = flavortextSpotsTaken[flavorCounter2](garage_name,garage_capacity[garage_name]-parseInt(garageJSON[garages[garage_name]]),garage_capacity[garage_name])


  return res.json({
      "fulfillmentText": responseText,
      "payload": {
        "google": {
          "expectUserResponse": true
        }
      }
    });
}
