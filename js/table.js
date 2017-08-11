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

// function loadData() {
//     var $body = $('body');
//     var $nytHeaderElem = $('#nytimes-header');
//     var $nytElem = $('#nytimes-articles');
//     $nytElem.text("");
//     var cityStr = "Indianapolis";
//     //NYT AJAX request
//     var nytimesUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + cityStr + "&sort=newest&api-key=de208adf347547fb9eebe7a46a8f3695"
//     $.getJSON(nytimesUrl, function(data) {
//         $nytHeaderElem.text('New York Times Headlines About ' + cityStr);
//         articles = data.response.docs;
//         for (var i = 0; i < 5; i++) {
//             var article = articles[i];
//             $nytElem.append('<li class="article">' + '<a href="' + article.web_url + '">' + article.headline.main + '</a>' + '</li>');
//         };
//     }).error(function(e) {
//         $nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
//     });
//     return false;
// }

// $('#myInput').submit(loadData);