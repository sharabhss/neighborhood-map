// location data
var cities = [
  {
    title: "Indianapolis",
    lat: 39.7684,
    lng: -86.1581
  }, {
    title: "Chicago",
    lat: 41.8781,
    lng: -87.6298
  }, {
    title: "Milwaukee",
    lat: 43.0389,
    lng: -87.9065
  }, {
    title: "Detroit",
    lat: 42.3314,
    lng: -83.0458
  }, {
    title: "Cincinnati",
    lat: 39.1031,
    lng: -84.5120
  }
];
// global map variable
var map;
// Where everything that goes to the page is rendered
var ViewModel = function() {
  var self = this;
  // for filterSearch, this observes what is being inputed into the search bar
  this.query = ko.observable("");
  // list of markers created will be stored here
  this.markersArray = [];
  // make default marker with color red and custom size
  var markerIcon = new google.maps.MarkerImage('https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|FF0000|40|_|%E2%80%A2', new google.maps.Size(31, 50), new google.maps.Point(0, 0), new google.maps.Point(15, 50), new google.maps.Size(31, 50));
  // make hover marker with color yellow and custom size
  var markerIconHover = new google.maps.MarkerImage('https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|FFFF00|40|_|%E2%80%A2', new google.maps.Size(31, 50), new google.maps.Point(0, 0), new google.maps.Point(15, 50), new google.maps.Size(31, 50));
  //Create infowindow and its contents through 3rd party API (NYT)
  this.populateInfoWindow = function(marker, infoWindow) {
    // check if infoWindow is already open on this marker
    if (infoWindow.marker != marker) {
      // clear infoWindow
      infoWindow.setContent('');
      infoWindow.marker = marker;
      // reset the marker property if the infoWindow is closed
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
        //change the marker color back to default
        marker.setIcon(markerIcon);
      });
      //Call NYT API for 5 headlines for marker.title city and store them in an array, which is displayed in the infoWindow
      var articleList = [];
      var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
      url += '?' + $.param({
        'q': marker.title,
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
      //setTimeout here gives the api time to load it to infoWindow and than open the window
      setTimeout(function() {
        // create the content for infowindow and set it to it's setContent
        var contentString = '<div><h2>' + marker.title + '</h2></div>' + '<div class="nytimes-container">' + '<h4 id="nytimes-header">New York Times Headlines</h4><ul id="nytimes-articles" class="article-list">' + articleList + '</ul></div>';
        infoWindow.setContent(contentString);
        // open infoWindow when marker is clicked
        infoWindow.open(map, marker);
      }, 700);
    }
  };
  //populate marker onto map when clicked either on list or marker on map
  this.openMarker = function() {
    // call function to open infoWindow when clicked
    self.populateInfoWindow(this, self.infoWindow);
    //animate marker with drop when clicked
    this.setAnimation(google.maps.Animation.DROP);
    //change marker when clicked
    this.setIcon(markerIconHover);
  };
  // start the map creation
  this.initMap = function() {
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
    //create the map by placing it inside the 'map' id div and by giving it default start points
    map = new google.maps.Map(document.getElementById('map'), {
      styles: styles,
      center: new google.maps.LatLng(41.7684, -86.1581),
      zoom: 6
    });
    // initialize new infoWindow
    this.infoWindow = new google.maps.InfoWindow();
    // create and store makers for locations inside cities array of objects
    for (var i = 0; i < cities.length; i++) {
      //get info about markers
      this.title = cities[i].title;
      this.lat = cities[i].lat;
      this.lng = cities[i].lng;
      //create google maps marker
      this.marker = new google.maps.Marker({
        map: map,
        position: {lat: this.lat, lng: this.lng},
        title: this.title,
        icon: markerIcon,
        id: i,
        animation: google.maps.Animation.DROP
      });
      //set the map of the marker to the working map
      this.marker.setMap(map);
      //store the marker in the markers array
      this.markersArray.push(this.marker);
      //On click, get the infowindow to open on
      this.marker.addListener('click', self.openMarker);
      // create two event listeners for mouseover (hover) and mouseout
      this.marker.addListener('mouseover', function() {
        this.setIcon(markerIconHover);
      });
      this.marker.addListener('mouseout', function() {
        this.setIcon(markerIcon);
      });
    }
  };
  // initialize the map on to the window
  this.initMap();
  //filter serach for cities and markers
  this.filterSearch = ko.computed(function() {
    var output = [];
    for (var i = 0; i < this.markersArray.length; i++) {
      var cityMarker = this.markersArray[i];
      if (cityMarker.title.toUpperCase().includes(this.query().toUpperCase())) {
        output.push(cityMarker);
        this.markersArray[i].setVisible(true);
      } else {
        this.markersArray[i].setVisible(false);
      }
    }
    return output;
  }, this);
};
// error message to user if the map could not be loaded
function gMapsError() {
  alert("Map could not load at this time, try again later.");
}
//Google Maps link calls this function as callback and this function applies the Knockout ViewModel
function initAll() {
  // viewmodel to create everything
  ko.applyBindings(new ViewModel());
}
