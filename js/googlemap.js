  var map; // declares a global map variable
  // Function is called when the page loads
  function initMap() {
    // if you want different map style, populate the following
    var styles = [];
    // construct a new map with all default API disabled and into the map id of the page
    map = new google.maps.Map(document.getElementById('map'), {
      styles: styles,
      disableDefaultUI: true
    });
    // make default marker with color red
    var defaultMarker = makeMarker("FF0000");
    // make maker with color yellow for mouse hover
    var hoverMaker = makeMarker("FFFF00");
    // this function reads search results and creates pins from Google Places. placeData contains objects with info about a single location
    // create an infoWindow
    var infoWindow = new google.maps.InfoWindow();
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
        articlesArray: getNytArticles(cityName)
      });
      // create onclick event to open infoWindow for each marker
      marker.addListener('click', function() {
        populateInfoWindow(this, infoWindow);
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
    // function to get 5 New York Times Headlines for given city name
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
            };

    }).fail(function(err) {
      throw err;
    });

    return articleList;
};

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
    // locations is an array of location strings fetched from cities object
    var locations = [];
    for (var i = 0; i < cities.length; i++) {
      locations.push(cities[i].city + ", " + cities[i].state);
    }
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