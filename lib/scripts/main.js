"use strict";

var React = require( 'react' );
var ReactDOM = require( "react-dom" );

var Calendar = require( './components/timings-picker' );

(function () {

  function onTimingsChange(timings, targetTiming, operation) {
    console.log(arguments);
  };

  function onTimingClick(start, end, targetTiming) {
    console.log(arguments);
  }

  // input: '2016-05-06T10:00:00Z'
  // output: date object
  function stringToDateObject(stringDate) {
	  var date = new Date(Date.parse(stringDate));
	  date.setHours(7,0,0,0);
	  return date;
  }

  var shiftDateTimings = [
    {
      start: "2016-10-30T07:30+01:00",
      end: "2016-10-30T16:30+01:00"
    }
	 /*{
    start: '2016-06-04T10:00:00Z',
    end: '2016-06-04T13:00:00Z'
  }, {
    start: '2016-06-05T10:00:00Z',
    end: '2016-06-05T13:00:00Z'
  }, {
    start: '2016-06-04T14:00:00Z',
    end: '2016-06-04T18:00:00Z'
  }
    {
      start: '2016-03-29T11:20:40Z',
      end: '2016-03-29T15:20:40Z'
    },
    {
      start: '2016-03-31T08:22:40Z',
      end: '2016-03-31T10:27:40Z'
    },
    {
      start: '2016-03-31T11:22:40Z',
      end: '2016-03-31T15:27:40Z'
    }*/
  ];

  var activeDays = [];

  /*activeDays = [
    {
      startDate: '2016-06-03',
      endDate: '2016-06-05'
    },
    {
	  startDate: '2016-03-27',
	  endDate: '2016-03-31'
    },
    {
	  startDate: '2016-04-05',
	  endDate: '2016-04-11'
    },
    {
	  startDate: '2016-04-14',
	  endDate: '2016-04-15'
    },
    {
	  startDate: '2016-04-17',
	  endDate: '2016-04-18'
    },
    {
	  startDate: '2016-05-05',
	  endDate: '2016-05-22'
    },

    {
	  startDate: '2016-06-15',
	  endDate: '2016-06-17'
    }
  ];*/

  var newLanguages = [];
  var lang = "en-US";
  //var defaultDisplayWeekDay = stringToDateObject('2012-05-07T07:00:00Z');
  //var defaultDisplayWeekDay = null;
  //

  var defaultDisplayWeekDay = new Date( '2017-01-09T00:00:00Z' );
  //defaultDisplayWeekDay = stringToDateObject( '2017-01-09T00:00:00Z' );

  shiftDateTimings = [];

  // bug occurs when no dates are defined and default display week is in the futur(e).

  document.getElementById('calendar').setAttribute( 'style', 'max-width: 600px; max-height: 600px;' );

  ReactDOM.render( React.createElement(Calendar, {
    startTime: "7:00", 
    endTime: "7:00", 
    activeDays: activeDays, 
    timings: shiftDateTimings, 
    weekStartDay: 1, 
	  defaultDisplayWeekDay: defaultDisplayWeekDay, 
    onTimingsChange: onTimingsChange, 
    onTimingClick: onTimingClick, 
    readOnly: false, 
    lang: lang, 
    additionalLanguages: newLanguages, 
    timingStep: 30}), document.getElementById( 'calendar' ) );

})();
