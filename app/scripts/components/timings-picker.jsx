'use strict';

var React = require('react');
require("date-format-lite");

var utils = require('../utils/utils');
var propTypes = require("../utils/propTypes");
var i18n = require('../../locales/locales.json');

var Header = require('./header/header');
var Scheduler = require('./scheduler/scheduler');
var Recurrencer = require('./scheduler/recurrencer');

var Stats = require( './stats/stats' );

var TimingsPicker = React.createClass({

  propTypes: {
    startTime: propTypes.time,
    endTime: propTypes.time,
    weekDayStart: React.PropTypes.number,
    readOnly: React.PropTypes.bool,
    onTimingClick: React.PropTypes.func,
    onTimingsChange: React.PropTypes.func,
    timings: React.PropTypes.array,
    additionalLanguages: propTypes.additionalLanguages,
    lang: propTypes.locale,
    dateFormat: React.PropTypes.string,
    timeFormat: React.PropTypes.string,
	defaultDisplayWeekDay: propTypes.date
  },

  getDefaultProps: function () {
    return {
      timingStep: 10,
      startTime: "7:00",
      endTime: "3:00",
      weekStartDay: 1,
      readOnly: false,
      onTimingClick: function () { },
      onTimingsChange: function () { },
      timings: [],
      additionalLanguages: [],
      lang: navigator.language,
      dateFormat: "DD-MM-YYYY",
      timeFormat: "h:mm",
	  defaultDisplayWeekDay: null
    }
  },

  isOverlap: function (t1, t2) {
    return t1.start < t2.end && t1.end > t2.start
  },

  canCreateTiming: function (targetTiming, overlapChecking, timings) {

    overlapChecking = overlapChecking == undefined ? true : overlapChecking;
    timings = timings || this.state.timings;

    if (targetTiming.start.getTime() === targetTiming.end.getTime()) return false;

    if (utils.minutesDifference(targetTiming.start, targetTiming.end, true) > this.state.allMinutes) return false;

    var timings = this.state.timings;

    if (overlapChecking) {

      for (var i = 0, len = timings.length; i < len; i++) {

        if (this.isOverlap(timings[i], targetTiming)) return false;

      }

    }

    return true;

  },

  addTiming: function ( targetTiming ) {

    if ( !this.canCreateTiming( targetTiming ) ) return;

    var timings = this.state.timings,

    lastId = this.state.lastTimingId;

    targetTiming[this.state.timingsIdProperty] = lastId++;

    timings.push( targetTiming );

    this.setState({
      timings: timings,
      lastTimingId: lastId
    });

    this.props.onTimingsChange.call( this, this.state.timings, targetTiming, "Add timing" );


  },

  addTimings: function( targetTimings, overlapCheking ) {
    var timings = this.state.timings,

      lastId = this.state.lastTimingId,

      addedTimings = [],

      idName = this.state.timingsIdProperty;

    for ( var i = 0, len = targetTimings.length; i < len; i++ ) {


      if ( !this.canCreateTiming( targetTimings[i], overlapCheking ) ) return;


      targetTimings[i][idName] = lastId++;

      timings.push(targetTimings[i]);

      addedTimings.push(targetTimings[i]);

    }

    this.setState({ timings: timings, lastTimingId: lastId });

    if ( addedTimings.length > 0 ) {

      this.props.onTimingsChange.call( this, this.state.timings, addedTimings, "Add timings" );

    }

  },

  clearTimings: function() {

    this.setState( {
      timings: []
    } );

    this.props.onTimingsChange.call( this, [], null, 'Cleared timings' );

  },

  removeTiming: function (targetTiming, event) {

    event.stopPropagation();

    var timings = this.state.timings;

    for ( var i = 0; i < timings.length; i++ ) {

      if (timings[i][this.state.timingsIdProperty] == targetTiming[this.state.timingsIdProperty]) {

        timings.splice(i, 1/*on element to remove*/);
        break;
      }

    }

    this.setState({
      timings: timings
    });

    this.props.onTimingsChange.call( this, timings, targetTiming, 'Remove timing' );

  },

  changeTiming: function (targetTiming) {
    var timings = this.state.timings;

    for (var i = 0; i < timings.length; i++) {
      if (timings[i][this.state.timingsIdProperty] == targetTiming[this.state.timingsIdProperty]) {
        timings[i].start = targetTiming.start;
        timings[i].end = targetTiming.end;
      }
    }

    this.setState({
      timings: timings
    });

    this.props.onTimingsChange.call(this, timings, targetTiming, "Change timing");
  },
  getStartDay: function (sortedArray, prop) {
  var today = utils.setTime(new Date(), 0, 0, 0, 0);

  for (var i = 0; i < sortedArray.length; i++) {
    var d = new Date(sortedArray[i][prop]);
    if (d > today) {
      return d;
    }
  }
  return new Date(sortedArray[sortedArray.length - 1][prop]);
  },

  getTimingsStartDate: function () {
    var sortedTimings = this.props.timings.sort(function (t1, t2) {
      return t1.start > t2.start ? 1 :
          t1.start < t2.start ? -1 : 0;
      }),
    startDay;

    startDay = this.getStartDay(sortedTimings, 'start');
    return startDay;
  },

  getActiveDaysStartDate: function () {
    var sortedActiveDays = this.props.activeDays.sort(function (t1, t2) {
      return t1.startDate > t2.startDate ? 1 :
      t1.startDate < t2.startDate ? -1 : 0;
    }),
    startDay;

    startDay = this.getStartDay(sortedActiveDays, 'startDate');
    return startDay;
  },

  getDateArrayFromActiveDays: function( days ) {

    var startDate = new Date( days.startDate ),
        endDate = new Date( days.endDate ),
        result = [],
        date;

    startDate.setHours( startDate.getHours() + startDate.getTimezoneOffset() / 60 );
    endDate.setHours( endDate.getHours() + endDate.getTimezoneOffset() / 60 );

    for ( date = startDate; date <= endDate; date.setDate(date.getDate() + 1 ) ) {

      result.push( new Date( date ) );

    }

    return result;
  },

  componentWillMount: function () {
	var weekStart = this.state.weekStart,
		weekEnd = this.state.weekEnd,
	    activeDays = this.state.activeDays,
	    defaultWeekStartDay = this.props.defaultDisplayWeekDay,
		timings = this.state.timings.filter(function (t) {
		  return t.start >= weekStart && t.end <= weekEnd;
		});

	if (!timings.length && !activeDays.length && defaultWeekStartDay) {
	   this.setState({weekStart: defaultWeekStartDay})
	}
  },

  getInitialState: function () {

    var timingStep = this.props.timingStep,

    startTime = utils.parseTime( this.props.startTime ),

    endTime = utils.parseTime( this.props.endTime ),

  activeStartDay = this.hasActiveDays() ? this.getActiveDaysStartDate() : new Date(),

    startDate = activeStartDay,

    timings = [],

    activeDays = [],

    timingsIdProperty = "_rc_id",

    _rc_id = 0;

    endTime = endTime <= startTime ? utils.addDays(endTime, 1 /*one day*/) : endTime;

    if ( this.props.timings.length > 0 ) {

      startDate = this.getTimingsStartDate();

      timings = this.props.timings.map( function ( t ) {

        var result = {
          start: utils.setSecondsToZero( new Date(t.start) ),
          end: utils.setSecondsToZero( new Date(t.end) ),
          originalTiming: t,
        };

        result[timingsIdProperty] = _rc_id++;

        return result;

      });

    }

    if ( this.hasActiveDays() ) {

      var result = [],
          len = this.props.activeDays.length,
          i = 0,
          days;

      for( i; i<len; i++ ) {

        days = this.getDateArrayFromActiveDays( this.props.activeDays[i] );

        result = result.concat(days);

      }

      activeDays = result.sort( function(t1, t2) {

        return t1 > t2 ? 1 : t1 < t2 ? -1 : 0;

      } );
    }

    while ( startDate.getDay() != this.props.weekStartDay ) {

      startDate = utils.addDays( startDate, -1 );

    }

    var weekStart = utils.setTime( startDate, startTime.getHours(), startTime.getMinutes() ),

    weekEnd = utils.setTime(utils.addDays(weekStart, 7), endTime.getHours(), endTime.getMinutes()),

    isDayActive;

    if( activeDays && activeDays.length && activeDays[activeDays.length - 1] > weekEnd ) {

    isDayActive = utils.isDayActive(activeDays, weekEnd);

      if (!isDayActive) {
        weekEnd = this.getNextActiveDay(activeDays, weekEnd);
      }

    }

    var readOnly = this.props.readOnly.toString() === 'true';

    var addLanguages = Array.isArray(this.props.additionalLanguages) ? this.props.additionalLanguages : [this.props.additionalLanguages];
    var languages = utils.keyValueCollectionToObject(addLanguages);

    for (var l in i18n) {
      if (languages[l] === undefined) {
        languages[l] = i18n[l]
      }
    }
    var currentLanguage = languages[this.props.lang] ? languages[this.props.lang] :
                languages["en-US"] ? languages["en-US"] : i18n["en-US"];

    var weekStartDay = this.props.weekStartDay;

    return {
      endTime: endTime,
      startTime: startTime,
      weekStart: weekStart,
    weekStartDay: weekStartDay,
      weekEnd: weekEnd,
      allMinutes: utils.minutesDifference(startTime, endTime, true),
      timings: timings,
      activeDays: activeDays,
      timingsIdProperty: timingsIdProperty,
      lastTimingId: _rc_id,
      readOnly: readOnly,
      languages: languages,
      currentLanguage: currentLanguage,
      isRecurrenceAdded: null,
    isInactiveDayOverlap: false,
      overlaps: [],
    isDatePickerActive: true
    };

  },

  getNextActiveDay: function(activeDays, day) {
    var isDayActive = false,
    activeDay = day;

    while ( !isDayActive ) {
    activeDay = utils.addDays(activeDay, 1);
    isDayActive = utils.isDayActive(activeDays, activeDay);
    }
    return activeDay;
  },

  hasActiveDays: function() {

    return this.props.activeDays && this.props.activeDays.length > 0;

  },

  shouldComponentUpdate: function (nextProps, nextState) {

    if ( nextState.isRecurrenceAdded !== this.state.isRecurrenceAdded ) return true;

    return true;
  },

  updateWeekStartAndEnd: function( weekStart ) {
    var weekEnd = utils.addDays( weekStart, 7 ),
    isDayActive;

  if( this.hasActiveDays()) {
    if( this.state.activeDays[this.state.activeDays.length - 1] > weekEnd ) {
      isDayActive = utils.isDayActive(this.state.activeDays, weekEnd);
      if (!isDayActive) {
        weekEnd = this.getNextActiveDay(this.state.activeDays, weekEnd);
      }
      this.setState({ isDatePickerActive: true });
    } else {
      this.setState({ isDatePickerActive: false });
    }
  }
    this.setState({
      weekStart: weekStart,
      weekEnd: weekEnd
    });

  },

  goAnotherWeek: function ( next ) {

    this.updateWeekStartAndEnd( utils.addDays( this.state.weekStart, next ? 7 : -7 ) );

  },

  goAnotherMonth: function (month) {

    var newWeekStart = this.state.weekStart;
    var daysInMonth = utils.daysInMonth(newWeekStart.getYear(), month);
    newWeekStart.setDate(newWeekStart.getDate() > daysInMonth ? daysInMonth : newWeekStart.getDate());
    newWeekStart.setMonth(month);

    while (newWeekStart.getDay() != this.props.weekStartDay) {
      newWeekStart = utils.addDays(newWeekStart, -1);
    }

    this.updateWeekStartAndEnd( newWeekStart );

  },

  goAnotherYear: function( year ) {

    var newWeekStart = this.state.weekStart;

    newWeekStart.setFullYear( year );

    while ( newWeekStart.getDay() !== this.props.weekStartDay ) {

      newWeekStart = utils.addDays( newWeekStart, -1 );

    }

    this.updateWeekStartAndEnd( newWeekStart );

  },

  getInactiveDaysOverlaps: function(days) {
    var result = [],
      activeDays = this.state.activeDays,
      daysLen = days.length,
      getUniqueDays,
      activeDaysLen = activeDays.length,
      i,
      j;

    getUniqueDays = function(days) {
      var i = 0,
        j = 0,
        len = days.length,
        dublicateIndexArray = [];

      for(i; i<len; i++) {
        if(days[i] === days[i+1]) {
          days[i] = null;
          dublicateIndexArray.push(i);
        }
      }
      if(dublicateIndexArray) {
        for(j = dublicateIndexArray.length - 1; j>=0; j--) {
          days.splice(dublicateIndexArray[j], 1);
        }
      }

      return days;
    };
    if(activeDaysLen && daysLen) {
      days = getUniqueDays(days);

      for(i = days.length - 1; i>=0; i--) {
        for(j = activeDaysLen - 1; j>=0; j--) {
          if(days[i] === activeDays[j].toDateString()) {
            days.splice(i, 1);
          }
        }
      }
      result = days;
    }
    return result;
  },
  createRecurrence: function (startDate, endDate) {
    var days = [],
    isInactiveDayOverlap = false,
    isOverlap = false,
    overlaps =[];

    var weekStart = this.state.weekStart,
    weekEnd = this.state.weekEnd;
    var recurrenceStart = utils.addDays(utils.setTime(startDate, this.state.startTime.getHours(), this.state.startTime.getMinutes()), 7),
    recurrenceEnd = utils.setTime(endDate, this.state.endTime.getHours(), this.state.endTime.getMinutes());

    if ( recurrenceEnd < utils.setTime(endDate, this.state.startTime.getHours(), this.state.startTime.getMinutes()) ) {

    recurrenceEnd = utils.addDays(recurrenceEnd, 1);

    }

    var currentWeekTimings = utils.createTwoDimensionalArray( 7 ); /*7 days*/
    this.refs.scheduler.props.timings.forEach(function (t) {

    currentWeekTimings[t.start.getDay()].push(t);

    });

    var timingsToReccurence = [];
    for (var start = recurrenceStart; start < recurrenceEnd; start = utils.addDays(start, 1)) {

    var currentDayTimings = currentWeekTimings[start.getDay()];
    for (var l = 0; l < currentDayTimings.length; l++) {
      var daysDiff = Math.ceil(utils.minutesDifference(currentDayTimings[l].start, start, true) / 1440); /*1440 - minutes in day*/
      timingsToReccurence.push({ start: utils.addDays(currentDayTimings[l].start, daysDiff), end: utils.addDays(currentDayTimings[l].end, daysDiff) });
      days.push(start.toDateString());
    }

    }

    overlaps = this.getInactiveDaysOverlaps(days);
    if(overlaps.length){
      isInactiveDayOverlap = true;
      isOverlap = true;
    } else {
      var selectedPeriodTimings = utils.createTwoDimensionalArray(7);
      /*7 days*/
      this.state.timings.filter(function (t) {

        return !(t.start >= weekStart && t.end <= weekEnd) && (t.start >= recurrenceStart && t.end <= recurrenceEnd);

      }).forEach(function (t) {

        selectedPeriodTimings[t.start.getDay()].push(t);

      });

      var format = this.props.timeFormat + " " + this.props.dateFormat;
      for (var j = 0; j < timingsToReccurence.length; j++) {

        var t = timingsToReccurence[j], timingsToCheck = selectedPeriodTimings[t.start.getDay()];
        for (var k = 0; k < timingsToCheck.length; k++) {
          if (this.isOverlap(t, timingsToCheck[k])) {

            overlaps.push("" + this.state.currentLanguage.from + " " + timingsToCheck[k].start.format(format) +
              " " + this.state.currentLanguage.to + " " + timingsToCheck[k].end.format(format));
            isOverlap = true;

          }
        }
      }
    }

    if (isOverlap) {

      this.setState({ isRecurrenceAdded: false, overlaps: overlaps, isInactiveDayOverlap: isInactiveDayOverlap });

    }
    else {

      this.addTimings( timingsToReccurence, isOverlap );
      this.setState({ isRecurrenceAdded: true });
      setTimeout((function () { this.setState({ isRecurrenceAdded: null }) }).bind(this), 3000);

    }
  },

  render: function () {
    var weekStart = this.state.weekStart,
    weekStartDay = this.state.weekStartDay,
    weekEnd = this.state.weekEnd;

    var timings = this.state.timings.filter(function (t) {
      return t.start >= weekStart && t.end <= weekEnd;
    });

    var activeDays = this.state.activeDays;

    var timingsModifications = this.state.readOnly === true ? undefined : {
      addTiming: this.addTiming,
      removeTiming: this.removeTiming,
      changeTiming: this.changeTiming
    };

    var lang = this.state.currentLanguage;
    var bottompart;

    if (!this.state.readOnly) {

      var messageCloseFunction = (function () { this.setState({ isRecurrenceAdded: undefined }) }).bind(this);
      var messageCloseIcon = <div className="rc-message-close rc-icon rc-icon-close" onClick={messageCloseFunction}></div>
      if (this.state.isRecurrenceAdded === true) {
        bottompart = <div className="rc-success">
          {lang.recurrenceAddedSuccessfully}
          {messageCloseIcon}
        </div>
      }
      else if (this.state.isRecurrenceAdded === false) {
        bottompart =
        <div className="rc-error">
          {this.state.isInactiveDayOverlap ? lang.inactiveDaysPreventRecurring : lang.timingsPreventRecurring}:
          <ul>
            {this.state.overlaps.map(function(value, i){
              return <li key={i}>{value}</li>
            })}
          </ul>
          {messageCloseIcon}
        </div>;
      }
      else {
        bottompart = <Recurrencer
          createRecurrence={this.createRecurrence}
          startDate={weekStart}
          endDate={weekEnd}
      weekStartDay={weekStartDay}
          strings={lang}
      activeDays={activeDays}
          dateFormat={this.props.dateFormat}
      isDatePickerActive={this.state.isDatePickerActive} />;
      }
    }

    return (
      <div className="rc-calendar rc-noselect">
        <div className="rc-calendar-body">
          <Stats
            timings={this.state.timings}
            onClear={this.clearTimings}
            strings={lang} />
          <Header
            startDate={weekStart}
            goAnotherWeek={this.goAnotherWeek}
            goAnotherMonth={this.goAnotherMonth}
            goAnotherYear={this.goAnotherYear}
            months={lang.months}
            weekdays={lang.weekdays} />
          <Scheduler ref="scheduler"
            strings={lang}
            startDate={weekStart}
            startTime={this.state.startTime}
            endTime={this.state.endTime}
            timeStep={this.props.timeStep}
            allMinutes={this.state.allMinutes}
            timings={timings}
            timingStep={this.props.timingStep}
            defaultTimigDuration={this.props.defaultTimigDuration}
            weekdays={lang.weekdays}
            timingsModifications={timingsModifications}
            readOnly={this.state.readOnly}
            activeDays={activeDays}
            onTimingClick={this.props.onTimingClick}
            timingsIdProperty={this.state.timingsIdProperty}
            startTimeLabel={lang.startTime}
            endTimeLabel={lang.endTime} />
        </div>
        <div className="rc-reccurencer">
          {bottompart}
        </div>
      </div>
      );
  }
});

module.exports = TimingsPicker;