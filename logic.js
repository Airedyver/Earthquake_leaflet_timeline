//Grab Data
//Will need Earthquake GEO JSON data
//Earthquake data should include time of earthquake, latitude, longitude, location, magnitude of each earthquake.

var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
//Faultiline boundaries found using github, based off of instructions.
var faultURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
//Perform a Get Request to the quake and fault URL

renderMap(quakeUrl, faultURL);

function renderMap(quakeUrl, faultURL) {

  d3.json(quakeUrl, function(data) {
  	console.log(quakeUrl)
  	//store reponse into earthquakeData
  	var earthquakeData = data;
    // Once we get a response, send the data.features object to the createFeatures function
    	d3.json(faultURL, function(data) {
    		var faultData = data;
    		createFeatures(earthquakeData, faultData);
  	});
  });


  //Create Maps Light Map,Dark Map,Street Map, and an overlay layer that allows for markers

  function createMap(earthquakes, faultLines, timelineLayer) {

    // Define light map, streetmap and darkmap layers
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
      "T6YbdDixkOBWH_k9GbS8JQ");

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
      "T6YbdDixkOBWH_k9GbS8JQ");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
      "T6YbdDixkOBWH_k9GbS8JQ");

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
    	"Light Map": lightmap,
      "Street Map": streetmap,
      "Dark Map": darkmap
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 4,
      layers: [streetmap, faultLines]
    });

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Fault Lines": faultLines

    };
    
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map

    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
    var timelineControl = L.timelineSliderControl({
          formatOutput: function(date) {
          	return new Date(date).toString();
          }
     });
     timelineControl.addTo(myMap);
     timelineControl.addTimelines(timelineLayer);
     timelineLayer.addTo(myMap);

  };

  //Create markers 
  function createFeatures(earthquakeData, faultData){
  	//Circles = 
  	//Based off of latitude/longitude and magnitude 
  	//lat/lon will be used to place the circles on the map
  	//magnitude will be used as the size of the radius of the map 
  	//magnitude will also have a color scheme
  	// circle.popop  that will have location, time and magnitude information
  	function createCircles(feature, layer) {

  		return new L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], {
  			fillOpacity: 0.75,
  	        color: chooseColor(feature.properties.mag),
  	        fillColor: chooseColor(feature.properties.mag),
  	     	// Setting our circle's radius equal to the output of our markerSize function
  	     	// This will make our marker's size proportionate to its population
  	     	radius: markerSize(feature.properties.mag)
  		});
  	}

  	function onEachEarthquake(feature, layer) {
  		layer.bindPopup("<h1>" + feature.properties.place + "</h3><hr><p>"+ feature.properties.mag + " Magnitude " + new Date(feature.properties.time) + "</p>");
  	};
  	


  	function createFaults(feature, layer) {
  		L.polyline(feature.geometry.coordinates);	
  	};

  	var earthquakes = L.geoJSON(earthquakeData,{
  		onEachFeature: onEachEarthquake,
  		pointToLayer: createCircles
  	});

  	var faultLines = L.geoJSON(faultData, {
  		onEachFeature: createFaults,
  		style: {
  			weight: 2,
  			color: "purple"
  		}
  	});


      var timelineLayer = L.timeline(earthquakeData, {
          getInterval: function(feature) {
           return {
         		start: feature.properties.time,
            end: feature.properties.time + feature.properties.mag * 100000000
            	};

           },
            pointToLayer: createCircles,
            onEachFeature: onEachEarthquake
         });


  	createMap(earthquakes,faultLines,timelineLayer);
  };
}



//create function for size of circle
function markerSize(magnitude) {
 return magnitude * 10;
}
//Define colors of circle
var color = ["#0a7b83" , "#2aa876" , "#ffd265" , "#f19c65" , "#e8554e", "#800080", "#000000"];
//create a function called chooseColor that allows the program to choose the color based on magnitude

function chooseColor(magnitude){
	return magnitude > 6 ? color[6]:
         magnitude > 5 ? color[4]:
	       magnitude > 4 ? color[3]:
	       magnitude > 3 ? color[2]:
	       magnitude > 2 ? color[1]:
	       magnitude > 1 ? color[0]:
	                       color[5];
};