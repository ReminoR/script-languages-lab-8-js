"use strict";
var fs = require('fs');
var express = require('express');
var app = express();
var meetup_json = JSON.parse(fs.readFileSync('json/meetup.json', 'utf8')); //string
var eventbrite_json = JSON.parse(fs.readFileSync('json/eventbrite.json', 'utf8')); //string

// meetup 		name, 		local_date, 	local_time, 	description, 		link, 	venue (optional)
// eventbrite 	name.text, 	start.local, 	start.local 	description.html,	url		venue_id

// console.log(meetup_json.length, eventbrite_json.length);

function delete_duplicate(meetup_json, eventbrite_json) {
	var count = 0;
	for (var i = 0; i < meetup_json.length; i++) {
		for (var j = 0; j < eventbrite_json.length; j++) {
			if ( meetup_json[i].name == eventbrite_json[j].name.text && 
				Date.parse(meetup_json[i].local_date + 'T' + meetup_json[i].local_time) == Date.parse(eventbrite_json[j].start.local) ) {
				eventbrite_json.splice(j, 1);
			count++;
			}
		}
	}
	console.log('Удалено дубликатов: ' + count);
}
delete_duplicate(meetup_json, eventbrite_json)


var merged_array = [];

function merge_array(meetup_json, eventbrite_json) {
	for (var i = 0; i < meetup_json.length; i++) {
		if (meetup_json[i].local_date && meetup_json[i].local_time) {
			var item = [{
				'name': meetup_json[i].name,
				'date': meetup_json[i].local_date + 'T' + meetup_json[i].local_time + ':00',
				'description': meetup_json[i].description,
				'link': meetup_json[i].link
			}]
			merged_array = merged_array.concat(item);
		}
	}
	for (var i = 0; i < eventbrite_json.length; i++) {
		var item = {
			'name': eventbrite_json[i].name.text,
			'date': eventbrite_json[i].start.local,
			'description': eventbrite_json[i].description.html,
			'link': eventbrite_json[i].url
		}
		merged_array = merged_array.concat(item);
	}
}
merge_array(meetup_json, eventbrite_json);

function html() {
	fs.writeFileSync('out.html', 
		'<!DOCTYPE html>' + 
		'<html lang="en">' + 
		'<head><meta charset="UTF-8"><title>Meetups</title>'+
		'<link rel="stylesheet" href="/public/css/main.css">' + 
		'</head>' + 
		'<body>' +
		'<div class="wrap">');

	var end_date = Date.parse('2018-06-30'); 
	var interval = 60 * 30 * 1000;
	var today = Date.parse(new Date());

	for (var time = today; time < end_date; time += interval) {
		for (var i = 0; i < merged_array.length; i++) {
			if ( (Date.parse(merged_array[i].date) - (3600 * 7 * 1000)) >= time &&
				 (Date.parse(merged_array[i].date) - (3600 * 7 * 1000)) <= (time + interval) ) {

				fs.appendFileSync('out.html',
					'<h2 class="title"><a href='+ merged_array[i].link + ' target=blank>' + merged_array[i].name + '</a></h2><br>' + 
					'<div class="date_time"><strong>Date: </strong> ' + merged_array[i].date + '</div><br>' +
					'<div class="desc"><strong>Description:</strong> ' + merged_array[i].description + '</div><br><br>'
				)

			}
		}
	}
	fs.appendFileSync('out.html', '</body></html>');
	console.log('html файл создан. Добавлено событий: ' + merged_array.length);
}
html();

app.use('/public', express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/out.html");
});

app.listen(3000); // http://127.0.0.1:3000/
console.log('Сервер запущен: http://127.0.0.1:3000/');


// Заметки
// можно написать общую функцию
// надо брать конечную дату из параметров запроса
// Сделать запрос venue для EventBrite
// сделать один файл index.js
// Разбить вывод в html по датам
// метод concat() в getJSON
// Рефакторинг