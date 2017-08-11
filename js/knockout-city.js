var cities = [
 	{
 		city: "Indianapolis",
 		state: "Indiana",
    //articleList: getNytArticles("Indianapolis")
 	},
  {
  	city: "Chicago",
  	state: "Illinois",
    //articleList: getNytArticles("Chicago")
  },
  {
  	city: "Milwaukee",
  	state: "Wisconsin",
    //articleList: getNytArticles("Milwaukee")
  },
  {
  	city: "Detroit",
  	state: "Michigan",
    //articleList: getNytArticles("Detroit")
  },
  {
  	city: "Cincinnati",
  	state: "Ohio",
    //articleList: getNytArticles("Cincinnati")
  }
];

var City = function(data) {
	this.city = ko.observable(data.city);
	this.state = ko.observable(data.state);
};

var ViewModel = function() {
	var self = this;

	this.cityList = ko.observableArray([]);

	cities.forEach(function(cityItem) {
		self.cityList.push(new City(cityItem));
	});

	this.currentCity = ko.observable(this.cityList()[0]);

	this.setCity = function(clickedCity) {
		self.currentCity(clickedCity);
	};
};

//     // function to get 5 New York Times Headlines for given city name
//     function getNytArticles(city) {
//     var articleList = [];
//     var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
//     url += '?' + $.param({
//       'q': city,
//       'sort': "newest",
//       'fl': "web_url, headline",
//       'api-key': "de208adf347547fb9eebe7a46a8f3695"
//     });
//     $.ajax({
//       url: url,
//       method: 'GET',
//     }).done(function(result) {
//        var articles = result.response.docs;
//        for (var i = 0; i < 5; i++) {
//                 var article = articles[i];
//                 articleList.push('<li class="article-link">' + '<a href="' + article.web_url + '">' + article.headline.main + '</a>' + '</li>');
//             };

//     }).fail(function(err) {
//       throw err;
//     });

//     return articleList;
// };

function filter() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}

ko.applyBindings(new ViewModel());