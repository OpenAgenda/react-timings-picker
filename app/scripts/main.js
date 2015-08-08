var timings = [
	{
		start: '2015-08-06T15:40:40',
		end: '2015-08-06T18:40:40',
	},
	{
		start: '2015-08-11T09:20:40',
		end: '2015-08-11T18:20:40',
	},
	{
		start: '2015-08-07T12:48:40',
		end: '2015-08-07T14:48:40',
	},
	{
		start: '2015-08-15T12:20:40',
		end: '2015-08-15T18:20:40',
	},
];

React.render(React.createElement(Calendar, { startTime: "7:00", endTime: "3:00", timings: timings, weekStartDay: 1 }), document.getElementById('calendar'));