var weatherModule = function(){

  //main array
  var weatherArray = [];

  //Way to access the array to load local storage
  var initWeatherArray = function(array){
    weatherArray = array;
    renderScreen();
  };

  //weather obj
  var Weather = function(city, description, icon, temp, minTemp, maxTemp){
    this.city = city;
    this.description = description;
    this.iconUrl = "http://openweathermap.org/img/w/" + icon + ".png";
    this.temp = temp;
    this.minTemp = minTemp;
    this.maxTemp = maxTemp;
    this.dateTime = Date();
    this.id = Weather.counter++;
    this.comments = [];
  };

  Weather.counter = 0;

  //Sort helper
  function compareByCity(a, b){
    if (a.city < b.city){
      return -1;
    }
    if (a.city > b.city){
      return 1;
    }
    return 0;
  };

  //Sort helper
  function compareByDate(a, b){
    if (a.dateTime < b.dateTime){
      return -1;
    }
    if (a.dateTime > b.dateTime){
      return 1;
    }
    return 0;
  };

  //Sort the array by specific condition and render the screen
  var sort = function(condition){
    if(condition === "city"){
      weatherArray = weatherArray.sort(compareByCity);
    }else if(condition === "temp"){
      weatherArray = weatherArray.sort(function(a, b){return a.temp - b.temp});
    }else if(condition === "date"){
    weatherArray = weatherArray.sort(compareByDate);
    }
    renderScreen();
  };


  var validateInput = function($input){

    $input.parent().removeClass('has-error');
    $input.attr("placeholder", "Search for city...");

    if($input.val() === ""){
      $input.parent().addClass('has-error');
      $input.attr("placeholder", "You must enter the a city");
      return false;
    }else{
      return true;
    }
  };

  //Add weather to the array and render the screen
  var addweather = function(weatherObj){
    weatherArray.push(weatherObj);
    renderScreen();
    saveToLocalStorage();
  }

  //Add comment to a specific weather obj and render the screen
  var addComment = function(comment, id){
    for(var i = 0; i < weatherArray.length; i++){
      if(weatherArray[i].id == id){
        weatherArray[i].comments.push({comment: comment});
      }
    }
    renderScreen();
    saveToLocalStorage();
  };

  //remove Weather obj from the array and render the screen
  var removeWeather = function(id){
    for(var i = 0; i < weatherArray.length; i++){
      if(weatherArray[i].id == id){
        weatherArray.splice(i, 1)
      }
    }
    renderScreen();
    saveToLocalStorage();
  };


  var renderScreen = function(){
    $('.respons-block').empty(); //clear the screen
    $('.remove').off();
    $('.comment-btn').off();

    //update screen with handlebars
    for(var i = 0; i < weatherArray.length; i++){
      var source = $('#weather-response-template').html();
      var template = Handlebars.compile(source);
      var newHTML = template(weatherArray[i]);
      $('.respons-block').prepend(newHTML);
    };
    $('.remove').on('click', function(){
      removeWeather($(this).parent().attr("data-id"));
    });
    $('.comment-btn').on('click', function(){
      addComment($(this).closest('div').find('input').eq(0).val(), $(this).closest('.weather-frame').attr("data-id"));
    });
  };

  //get the response obj and return a weather obj
  var parseResponse = function(data){
    if(data.weather){
      var currentWeather = new Weather(data.name, data.weather[0].description, data.weather[0].icon,data.main.temp, data.main.temp_min, data.main.temp_max);
      return currentWeather;
    }
  };

  //set the the loading indicator to show while making ajax requests
    $.ajaxSetup({
        beforeSend:function(){
            // show gif here, eg:
            $(".demo").easyOverlay("start");
        },
        complete:function(){
            // hide gif here, eg:
            $(".demo").easyOverlay("stop");
        }
    });

  //send request to openweathermap
  var fetch = function (city) {
    $.ajax({
      method: "GET",
      url: 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=d703871f861842b79c60988ccf3b17ec&units=metric',
      dataType: "json",
      success: function(data) {
        var weatherObj = parseResponse(data);
        addweather(weatherObj);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
        alert("Couldn't find the city: " + city);
      }
    }); 
  };

  //Local storage
  var STORAGE_ID = 'myWeather'

  var saveToLocalStorage = function () {
    localStorage.setItem(STORAGE_ID, JSON.stringify(weatherArray));
  };

  var getFromLocalStorage = function () {
    return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
  };


  return {
    fetch: fetch,
    validateInput: validateInput,
    initWeatherArray: initWeatherArray,
    getFromLocalStorage: getFromLocalStorage,
    sort: sort
  };

};


var app = new weatherModule();

app.initWeatherArray(app.getFromLocalStorage());

//Event Handlers

//Event handler for the search button
$('.search-btn').on('click', function(){
  if(app.validateInput($('#city-input'))){
    app.fetch($('#city-input').val());
    $('#city-input').val('');
  }
});

//making ENTER trigger the search button
$("#city-input").keyup(function(event){
    if(event.keyCode == 13){
        $(".search-btn").click();
    }
});

$('.sort-by-date').on('click', function(){
  app.sort("date");
});
$('.sort-by-temp').on('click', function(){
  app.sort("temp");
});
$('.sort-by-city').on('click', function(){
  app.sort("city");
});

