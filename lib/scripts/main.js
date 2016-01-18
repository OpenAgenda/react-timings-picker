"use strict";

var React = require('react');
var ReactDOM = require("react-dom");

var Calendar = require('./components/timings-picker');

(function () {

  function onTimingsChange(timings, targetTiming, operation) {
    console.log(arguments);
  };

  function onTimingClick(start, end, targetTiming) {
    console.log(arguments);
  }

  var shiftDateTimings = [
    {
    start: '2015-03-29T11:20:40Z',
    end: '2015-03-29T15:20:40Z'
    },
    {
      start: '2015-03-31T08:22:40Z',
      end: '2015-03-31T10:27:40Z'
    },
    {
      start: '2015-03-31T11:22:40Z',
      end: '2015-03-31T15:27:40Z'
    }
  ];

  var activeDays = [
    {
      startDate: '2015-03-27',
      endDate: '2015-03-31'
    },
    {
      startDate: '2015-04-05',
      endDate: '2015-04-11'
    },
    {
	  startDate: '2015-04-17',
	  endDate: '2015-04-18'
    },
    {
	  startDate: '2015-05-05',
	  endDate: '2015-05-22'
    },

    {
	  startDate: '2015-06-15',
	  endDate: '2015-06-17'
    }

  ];

  var newLanguages = [];
  var lang = "en-US";

  document.getElementById('calendar').setAttribute('style', 'max-width: 600px; max-height: 600px;');

  ReactDOM.render( React.createElement(Calendar, {
    startTime: "7:00", 
    endTime: "7:00", 
    activeDays: activeDays, 
    timings: shiftDateTimings, 
    weekStartDay: 6, 
    onTimingsChange: onTimingsChange, 
    onTimingClick: onTimingClick, 
    readOnly: false, 
    lang: lang, 
    additionalLanguages: newLanguages, 
    timingStep: 30}), document.getElementById( 'calendar' ) );

})();
