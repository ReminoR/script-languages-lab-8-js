"use strict";
var request = require('sync-request');
var fs = require('fs');

var start_date = '2018-06-20T00:00:00'; //формат '2018-06-08T00:00:00'
var end_date = '2018-08-30T00:00:00';

if (!fs.existsSync('json')) {
	fs.mkdirSync('json');
	console.log('create directory "json"');
}

getJSON_Meetup(); 
getJSON_Eventbrite();
console.log('Все события сохранены в файлы .json. Для продолжения работы запустите index.js');



// https://api.meetup.com/find/upcoming_events?key=10467d721e56765f56726e64326a5331&sign=true&photo-host=public&end_date_range=2018-12-31T00:00:00&text=big%data&radius=100&lon=-122.42&lat=37.78&page=1000
function getJSON_Meetup(){
	var meetup = {
		qs: {
			key: '10467d721e56765f56726e64326a5331',
			text: 'data', //вместо пробела используется %
			start_date_range: start_date,
			end_date_range: end_date,
			radius: '50',
			lon: '-122.42',
			lat: '37.78',
			page: '1000'
		}
	};
	var meetup_request = request('GET', 'https://api.meetup.com/find/upcoming_events', meetup);
	var result = JSON.parse(meetup_request.getBody('utf8'));
	fs.writeFileSync('json/meetup.json', JSON.stringify(result.events, '', 4));
	console.log('Meetup. Загружено. ' + result.events.length + ' событий найдено.');
}



// https://www.eventbriteapi.com/v3/events/search/?location.longitude=-122.42&q=big+data&token=TD4KJTXK4VUCSJNXQ3X2&start_date.range_end=2018-12-31T00%3A00%3A00&location.latitude=37.78&location.within=100km
// venue - https://www.eventbriteapi.com/v3/venues/4805795/?token=TD4KJTXK4VUCSJNXQ3X2

function getJSON_Eventbrite(){
	var eventbrite = {
		qs: {
			token: 'TD4KJTXK4VUCSJNXQ3X2',
			q: 'data', //вместо пробела используется +
			'start_date.range_start': start_date,
			'start_date.range_end': end_date,
			'location.within': '50km',
			'location.longitude': '-122.42',
			'location.latitude': '37.78',
			page: 1
		}
	};

	//Получаем количество страниц
	var eventbrite_request = request('GET', 'https://www.eventbriteapi.com/v3/events/search/', eventbrite);
	var response = JSON.parse(eventbrite_request.getBody('utf8'));
	var page_count = response.pagination.page_count;
	var all_pages = [];

	//Удаляем старый файл, если он сущестует
	if (fs.existsSync('json/eventbrite.json')) {
		fs.unlinkSync('json/eventbrite.json');
	}

	for (var i = 1; i <= page_count; i++) {
		eventbrite.qs.page = i;
		eventbrite_request = request('GET', 'https://www.eventbriteapi.com/v3/events/search/', eventbrite);
		response = JSON.parse(eventbrite_request.getBody('utf8'));

		all_pages = all_pages.concat(response.events);
		console.log('Eventbrite. Загружена страница ' + eventbrite.qs.page + '/' + page_count + '. ' + all_pages.length + ' событий найдено.');
	}
	fs.appendFileSync('json/eventbrite.json', JSON.stringify(all_pages, '', 4));

}




