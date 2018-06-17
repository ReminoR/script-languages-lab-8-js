"use strict";
var fs = require('fs');
var express = require('express');
var app = express();

var meetup_json = JSON.parse(fs.readFileSync('json/meetup.json', 'utf8')); //string
var eventbrite_json = JSON.parse(fs.readFileSync('json/eventbrite.json', 'utf8')); //string

delete_duplicate(meetup_json, eventbrite_json)
var merged_array = merge_array(meetup_json, eventbrite_json);

merged_array.sort(function(event1, event2) {
	return Date.parse(event1.date_time) - Date.parse(event2.date_time);
});

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

function merge_array(meetup_json, eventbrite_json) {
	var merged_array = [];

	for (var i = 0; i < meetup_json.length; i++) {
		if (meetup_json[i].local_date && meetup_json[i].local_time) {
			var item = {
				'name': meetup_json[i].name,
				'date_time': meetup_json[i].local_date + 'T' + meetup_json[i].local_time + ':00',
				'description': meetup_json[i].description,
				'link': meetup_json[i].link
			}
			merged_array = merged_array.concat(item);
		}
	}

	for (var i = 0; i < eventbrite_json.length; i++) {
		var item = {
			'name': eventbrite_json[i].name.text,
			'date_time': eventbrite_json[i].start.local,
			'description': eventbrite_json[i].description.html,
			'link': eventbrite_json[i].url
		}
		merged_array = merged_array.concat(item);
	}
	return merged_array;
}

function html() {
	//Добавляем новое поле "дата"
	for (var i = 0; i < merged_array.length; i++) {
		merged_array[i].date = new Date(Date.parse(merged_array[i].date_time)).toLocaleString("en-US", {year: 'numeric', month: 'long', day: 'numeric'});
	}
	var currentDate = merged_array[0].date;

	fs.writeFileSync('out.html', 
		'<!DOCTYPE html>' + 
		'<html lang="en">' + 
		'<head><meta charset="UTF-8"><title>Meetups</title>' +
		'<link rel="stylesheet" href="/public/css/main.css">' + 
		'<link rel="shortcut icon" href="/public/img/favicon.ico">' +
		'</head>' + 
		'<body>' +
		'<div class="wrap"><h1>Все встречи в Сан Франциско</h1><h2>' + currentDate + '</h2>');


	for (var i = 0; i < merged_array.length; i++) {
		if (merged_array[i].date == currentDate) {
			fs.appendFileSync('out.html',
				'<h3 class="title"><a href=' + merged_array[i].link + ' target=blank>' + merged_array[i].name + '</a></h2><br>' + 
				'<div class="date_time"><strong>Date: </strong> ' + merged_array[i].date_time + '</div><br>' +
				'<div class="desc"><strong>Description:</strong> ' + merged_array[i].description + '</div><br><br>'
			)
		} else {
			currentDate = merged_array[i].date;
			fs.appendFileSync('out.html', '<h2>' + currentDate + '</h2>');
		}
		
	}

	fs.appendFileSync('out.html', '</body></html>');
	console.log('html файл создан. Добавлено событий: ' + merged_array.length);
}
html();

//Настройки для сервера
app.use('/public', express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/out.html");
});

app.listen(3000); // http://127.0.0.1:3000/
console.log('Локальный сервер запущен: http://127.0.0.1:3000/');