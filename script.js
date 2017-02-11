var NYTData = {};
var currentData = {};
var queries = 0;

$(document).ready(initialize);

function initialize(){
  var year_dropdndata = {};
  for(year = 1852 ; year < 2017 ; year++){
    year_dropdndata[year] = year;
  }
  var $years_dropdn = $('#years_dropdn');
  for(var val in year_dropdndata) {
      $('<option />', {value: val, text: year_dropdndata[val]}).appendTo($years_dropdn);
  }
  $('#headline_panel_intro').css("display", "none");
  $('#data_section').css("display", "none");
  $(".get_data_button").click(getdata);
  $('#datatype_dropdn').change(function(){
    $('#heading_section').empty();
    plotData();
  });
}

function getdata(){
  if(!queries){
    console.log($('#headline_panel_intro'));
    $('#data_section').css("display", "inline-block");
    $('#main_area_intro').hide();
    queries = 1;
  }
  $('#heading_section').empty();
  $('#headline_panel_intro').css("display", "block");
  $('#data').empty();
  var year = $('#years_dropdn').val();
  var month = $('#month_dropdn').val();
  if(!NYTData[year]){
    fetchAPI(year, month);
  }
  else if(!NYTData[year][month]){
    fetchAPI(year, month);
  }
  else{
    currentData = NYTData[year][month];
    plotData();
  }
}

function fetchAPI(year,month){
  var url = "https://api.nytimes.com/svc/archive/v1/" + year + "/" + month + ".json";
  url += '?' + $.param({
    'api-key': "2310ba05bce344d98f720ae433ff8e5b"
  });
  $.ajax({
    url: url,
    method: 'GET',
  }).done(function(result) {
    console.log("data downloaded");
    if(NYTData[year]){
      NYTData[year][month] = result;
      currentData = NYTData[year][month];
    }
    else {
      NYTData[year] = {};
      NYTData[year][month] = result;
      currentData = NYTData[year][month];
    }
    console.log(NYTData);
    plotData();
  }).fail(function(err) {
    throw err;
  });
}

function plotData(){
  var param = $('#datatype_dropdn').val();
  var param_metric = {};
  var article_array = currentData.response.docs;
  for (i = 0 ; i < article_array.length ; i++){
    if(param_metric[article_array[i][param]]){
      param_metric[article_array[i][param]] += 1;
    }
    else {
      param_metric[article_array[i][param]] = 1
    }
  }
  $('#data').empty();
  $('#heading_section').empty();
  $('#headline_panel_intro').css("display", "block");
  for(var val in param_metric){
    var $p = $('<p/>');
    $p.html(val + " (" + param_metric[val] + " articles)");
    $p.click(showHeadings);
    $p.appendTo('#data');
  }
}

function findheading(param){
  switch (param){
    case 'print_page':
      return "Print Page";
      break;
    case 'document_type':
      return 'Document Type';
      break;
    case 'news_desk':
      return 'News Desk';
      break;
    case 'section_name':
      return 'Section Name';
      break;
    case 'subsection_name':
      return 'Subsection Name';
      break;
    case 'type_of_material':
      return 'Type of Material'
      break;
    default:
      return 'Something is not right';
  }
}

function showHeadings(){
  window.scrollTo(0, 0);
  $('#headline_panel_intro').hide();
  var param = $('#datatype_dropdn').val();
  $('#heading_section').empty();
  var $h2 = $('<h2 />');
  $h2.html(findheading(param) + ": "+ this.innerHTML.split("(")[0]);
  $h2.appendTo('#heading_section');
  var article_array = currentData.response.docs;
  for (i = 0 ; i < article_array.length ; i++){
    if(article_array[i][param] == this.innerHTML.split(" (")[0]){
      var $p = $('<p/>');
      var $a = $('<a/>');
      $p.html(article_array[i].headline.main);
      $p.appendTo('#heading_section');
      $a.attr("href",article_array[i].web_url);
      $a.attr("target", "_blank");
      $a.html(article_array[i].web_url);
      $a.appendTo('#heading_section');
    }
    //FOR NULL CONDITION
    else if(this.innerHTML.split(" (")[0] == 'null' && article_array[i][param] == null){
        var $p = $('<p/>');
        var $a = $('<a/>');
        $p.html(article_array[i].headline.main);
        $p.appendTo('#heading_section');
        $a.attr("href",article_array[i].web_url);
        $a.attr("target", "_blank");
        $a.html(article_array[i].web_url);
        $a.appendTo('#heading_section');
    }
  }
}
