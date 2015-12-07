"use strict";

var React = require('react');
var ReactDOM = require("react-dom");

var Calendar = require('./components/timings-picker');

(function () {
  
  //var timings = [{
  //  start: '2015-08-06T15:40:40Z',
  //  end: '2015-08-06T18:40:40Z',
  //},{
  //  start: '2015-08-11T09:20:40Z',
  //  end: '2015-08-11T18:20:40Z',
  //},{
  //  start: '2015-08-07T12:48:40Z',
  //  end: '2015-08-07T14:48:40Z',
  //},{
  //  start: '2015-08-15T12:20:40Z',
  //  end: '2015-08-15T18:20:40Z',
  //},{
  //  start: '2013-08-15T12:20:40Z',
  //  end: '2013-08-15T18:20:40Z',
  //},{
  //  start: '2010-08-15T12:20:40Z',
  //  end: '2010-08-15T18:20:40Z',
  //}];

  /*timings = [ {
    start: '2015-08-15T10:20:40Z',
    end: '2015-08-15T11:20:40Z'
  }, {
    start: '2015-08-15T12:20:40Z',
    end: '2015-08-15T14:20:40Z'
  } ];

  timings = [ {
    start: '2015-08-15T12:20:40Z',
    end: '2015-08-15T14:20:40Z'
  } ]; */

  var timings = [];

  for (var i = 0; i < 5; i++) {
    for (var k = 1; k < 13; k++) {
      var month = k > 9 ? k.toString() : "0" + k.toString();
      for (var j = 1; j < 28; j++) {
        var date = j > 9 ? j.toString() : "0" + j.toString();
        timings.push({
          start: '201' + i.toString() + '-' + month + '-' + date + 'T12:20:40Z',
          end: '201' + i.toString() + '-' + month + '-' + date + 'T18:20:40Z'
        });
        timings.push({
          start: '201' + i.toString() + '-' + month + '-' + date + 'T09:20:40Z',
          end: '201' + i.toString() + '-' + month + '-' + date + 'T12:00:40Z'
        });
      }
    }
  }

  function onTimingsChange(timings, targetTiming, operation) {
    console.log(arguments);
  };

  function onTimingClick(start, end, targetTiming) {
    console.log(arguments);
  }

  var newLanguages = [];
  var lang = "en-US";

  document.getElementById('calendar').setAttribute( 'style', 'max-width: 600px; max-height: 600px;')

  var t = [{
    start: '2015-03-29T12:20:40Z',
    end: '2015-03-29T15:20:40Z'
  }]

  ReactDOM.render( React.createElement(Calendar, {
    startTime: "7:00", 
    endTime: "7:00", 
    timings: t, 
    weekStartDay: 6, 
    onTimingsChange: onTimingsChange, 
    onTimingClick: onTimingClick, 
    readOnly: false, 
    lang: lang, 
    additionalLanguages: newLanguages, 
    timingStep: 30}), document.getElementById('calendar') );
})();
