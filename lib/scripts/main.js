var React = require('react');
var Calendar = require('./components/timings-picker');

(function () {
	'use strict';
	var timings = [
	{
		start: '2015-08-06T15:40:40Z',
		end: '2015-08-06T18:40:40Z',
	},
	{
		start: '2015-08-11T09:20:40Z',
		end: '2015-08-11T18:20:40Z',
	},
	{
		start: '2015-08-07T12:48:40Z',
		end: '2015-08-07T14:48:40Z',
	},
	{
		start: '2015-08-15T12:20:40Z',
		end: '2015-08-15T18:20:40Z',
	},
	{
		start: '2013-08-15T12:20:40Z',
		end: '2013-08-15T18:20:40Z',
	},
	{
		start: '2010-08-15T12:20:40Z',
		end: '2010-08-15T18:20:40Z',
	},
	];

	function onTimingsChange(timings, targetTiming, operation) {
		console.log(arguments);
	};

	function onTimingClick(start, end, targetTiming) {
		console.log(arguments);
	}

	var newLanguages = [];
	var lang = "en-US";

	React.render(React.createElement(Calendar, {startTime: "7:00", endTime: "3:00", timings: timings, weekStartDay: 1, onTimingsChange: onTimingsChange, onTimingClick: onTimingClick, readOnly: false, 
						lang: lang, additionalLanguages: newLanguages}), document.getElementById('calendar'));
})()
