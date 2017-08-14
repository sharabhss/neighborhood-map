// location data
var cities = [
  {
    city: "Indianapolis",
    state: "Indiana",
  }, {
    city: "Chicago",
    state: "Illinois",
  }, {
    city: "Milwaukee",
    state: "Wisconsin",
  }, {
    city: "Detroit",
    state: "Michigan",
  }, {
    city: "Cincinnati",
    state: "Ohio",
  }
];
// location class
var City = function(data) {
  this.city = ko.observable(data.city);
  this.state = ko.observable(data.state);
};
// knockout viewmodel to handle data
var ViewModel = function() {
  var self = this;
  this.cityList = ko.observableArray([]);
  cities.forEach(function(cityItem) {
    self.cityList.push(new City(cityItem));
  });
  this.currentCity = ko.observable([][0]);
  this.setCity = function(clickedCity) {
    self.currentCity(clickedCity);
  };
};
// viewmodel to create everything
ko.applyBindings(new ViewModel());
/*Google Map*/
var map; // declares a global map variable
// locations is an array of location strings fetched from cities object for maps
var locations = [];
for (var i = 0; i < cities.length; i++) {
  locations.push(cities[i].city + ", " + cities[i].state);
}
// Function is called when the page loads
function initMap() {
  // Google map custom styles, credit: https://snazzymaps.com/style/38/shades-of-grey
  var styles = [
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{
        "saturation": 36
      }, {
        "color": "#000000"
      }, {
        "lightness": 40
      }]
    }, {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{
        "visibility": "on"
      }, {
        "color": "#000000"
      }, {
        "lightness": 16
      }]
    }, {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 20
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }, {
        "weight": 1.2
      }]
    }, {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 20
      }]
    }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 21
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 29
      }, {
        "weight": 0.2
      }]
    }, {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 18
      }]
    }, {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 16
      }]
    }, {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 19
      }]
    }, {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }]
    }
  ];
  // construct a new map with all default API disabled and into the map id of the page
  map = new google.maps.Map(document.getElementById('map'), {
    styles: styles,
    disableDefaultUI: true
  });
  // make default marker with color red
  var defaultMarker = makeMarker("FF0000");
  // make maker with color yellow for mouse hover
  var hoverMaker = makeMarker("FFFF00");
  // create an infoWindow
  var infoWindow = new google.maps.InfoWindow();
  // this function reads search results and creates markers from Google Places. placeData contains objects with info about a single location
  function createMapMarker(placeData) {
    // following data are local variables for where to place the map marker from placeData object
    var lat = placeData.geometry.location.lat();
    var lon = placeData.geometry.location.lng();
    var name = placeData.formatted_address;
    var cityName = name.split(',')[0];
    var bounds = window.mapBounds;
    // additional data for marker
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: name,
      animation: google.maps.Animation.DROP,
      icon: defaultMarker,
      id: i,
      articlesArray: []
    });
    // create onclick event to open infoWindow for each marker
    marker.addListener('click', function() {
      //make the animation bounce once the marker is clicked and setting timeout stop from the marker bouncing on a loop
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 700);
      //get the NYT articles for the city
      var fetchArticles = getNytArticles(cityName);
      /*send the fetched articles into the marker and call the populateInfoWindow function to show the window 
      but on a .5 second delay so that there are no too many requests error from API */
      setTimeout(function() {
        marker.articlesArray = fetchArticles;
        populateInfoWindow(marker, infoWindow);
      }, 700);
    });
    // create two event listeners for mouseover (hover) and mouseout
    marker.addListener('mouseover', function() {
      this.setIcon(hoverMaker);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultMarker);
    });
    // add the marker to the map and center the map
    bounds.extend(new google.maps.LatLng(lat, lon));
    map.fitBounds(bounds);
    map.setCenter(bounds.getCenter());
  }
  // function to make markers given the color of marker wanted
  function makeMarker(markerColor) {
    var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2', new google.maps.Size(31, 50), new google.maps.Point(0, 0), new google.maps.Point(15, 50), new google.maps.Size(31, 50));
    return markerImage;
  }
  // function to populate the infoWindom for the clicked marker. Only one marker is open at one time
  function populateInfoWindow(marker, infoWindom) {
    // check if infoWindow is already open on this marker
    if (infoWindow.marker != marker) {
      // clear infoWindow
      infoWindow.setContent('');
      infoWindow.marker = marker;
      // reset the marker property if the infoWindow is closed
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });
      // create the content for infowindow and set it to it's setContent
      var contentString = '<div><h2>' + marker.title + '</h2></div>' + '<div class="nytimes-container">' + '<h4 id="nytimes-header">New York Times Headlines</h4><ul id="nytimes-articles" class="article-list">' + marker.articlesArray + '</ul></div>';
      infoWindow.setContent(contentString);
      // open infoWindow with marker is clicked
      infoWindow.open(map, marker);
    }
  }
  // function to make sure there are search results for locations and creates a marker for each location
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  }
  // function to search for location results given an array of location names from Google Places
  function pinPoster(locations) {
    // new google PlaceSevice instance. This does the searching for locations
    var service = new google.maps.places.PlacesService(map);
    // Iterates through the array of locations, creates a search object for each location
    locations.forEach(function(place) {
      // the search request object
      var request = {
        query: place
      };
      // Use Google Maps API to search for locations and run callback function on each search result
      service.textSearch(request, callback);
    });
  }
  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();
  // create a pin for each location on the map
  pinPoster(locations);
}
//Calls the initMap() function when the page loads
window.addEventListener('load', initMap);
//adjust map size depending on the window size
window.addEventListener('resize', function(e) {
  //update map bounds on page resize
  map.fitBounds(mapBounds);
});
// function to return an array of 5 New York Times Headlines for given city name
function getNytArticles(city) {
  var articleList = [];
  var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
  url += '?' + $.param({
    'q': city,
    'sort': "newest",
    'fl': "web_url, headline",
    'api-key': "de208adf347547fb9eebe7a46a8f3695"
  });
  $.ajax({
    url: url,
    method: 'GET',
  }).done(function(result) {
    var articles = result.response.docs;
    for (var i = 0; i < 5; i++) {
      var article = articles[i];
      articleList.push('<li class="article-link">' + '<a href="' + article.web_url + '">' + article.headline.main + '</a>' + '</li>');
    }
  }).fail(function(err) {
    articleList.push('<h4>Headlines could not be found at this moment</h4>');
  });
  return articleList;
}