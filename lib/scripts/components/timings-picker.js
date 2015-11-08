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

var TimingsPicker = React.createClass({displayName: "TimingsPicker",
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
		timeFormat: React.PropTypes.string
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
			timeFormat: "h:mm"
		}
	},
	isOverlap: function (t1, t2) {
		return t1.start < t2.end && t1.end > t2.start
	},
	canCreateTiming: function (targetTiming) {
		if (targetTiming.start.getTime() == targetTiming.end.getTime()) return false;
		if (utils.minutesDifference(targetTiming.start, targetTiming.end) > this.state.allMinutes) return false;
		var timings = this.state.timings;
		for (var i = 0; i < timings.length; i++)
			if (this.isOverlap(timings[i], targetTiming)) return false;
		return true;
	},
	getEdgeTimingsValues: function () {
		var timings = this.state.timings;
		if (timings.length > 0) {
			var earliest = new Date(timings[0].start),
				latest = new Date(timings[0].end);
			timings.forEach(function (t) {
				if (t.start < earliest) earliest = t.start;
				if (t.end > latest) latest = t.end;
			});
			return { earliestTimingStart: earliest, latestTimingEnd: latest };
		}
		return { earliestTimingStart: new Date(), latestTimingEnd: new Date() };
	},
	checkAndUpdateEdgeTimingsValues: function (newTiming) {
		var earliest = this.state.earliestTimingStart,
			latest = this.state.latestTimingEnd;

		if (newTiming.start < earliest) earliest = newTiming.start;
		if (newTiming.end > latest) latest = newTiming.end;

		this.setState({
			earliestTimingStart: earliest,
			latestTimingEnd: latest
		});
	},
	addTiming: function (targetTiming) {
		if (this.canCreateTiming(targetTiming)) {
			var timings = this.state.timings, lastId = this.state.lastTimingId;
			targetTiming[this.state.timingsIdProperty] = lastId++;
			timings.push(targetTiming);
			this.checkAndUpdateEdgeTimingsValues(targetTiming);
			this.setState({ timings: timings, lastTimingId: lastId });
			this.props.onTimingsChange.call(this, this.state.timings, targetTiming, "Add timing");
		}
	},
	addTimings: function (targetTimings) {
		var timings = this.state.timings, lastId = this.state.lastTimingId, addedTimings = [];
		for (var i = 0; i < targetTimings.length; i++) {
			if (this.canCreateTiming(targetTimings[i])) {
				targetTimings[i][this.state.timingsIdProperty] = lastId++;
				timings.push(targetTimings[i]);
				addedTimings.push(targetTimings[i]);
				this.checkAndUpdateEdgeTimingsValues(targetTimings[i]);
			}
		}
		this.setState({ timings: timings, lastTimingId: lastId });
		if (addedTimings.length > 0) {
			this.props.onTimingsChange.call(this, this.state.timings, addedTimings, "Add timings");
		}
	},
	removeTiming: function (targetTiming) {

		var timings = this.state.timings;

		for (var i = 0; i < timings.length; i++) {
			if (timings[i][this.state.timingsIdProperty] == targetTiming[this.state.timingsIdProperty]) {
				timings.splice(i, 1/*on element to remove*/);
				break;
			}
		}
		var timingsEdges = this.getEdgeTimingsValues();
		this.setState({
			timings: timings,
			earliestTimingStart: timingsEdges.earliestTimingStart,
			latestTimingEnd: timingsEdges.latestTimingEnd
		});

		this.props.onTimingsChange.call(this, timings, targetTiming, "Remove timing");
	},
	changeTiming: function (targetTiming) {
		var timings = this.state.timings;

		for (var i = 0; i < timings.length; i++) {
			if (timings[i][this.state.timingsIdProperty] == targetTiming[this.state.timingsIdProperty]) {
				timings[i].start = targetTiming.start;
				timings[i].end = targetTiming.end;
			}
		}

		var timingsEdges = this.getEdgeTimingsValues();
		this.setState({
			timings: timings,
			earliestTimingStart: timingsEdges.earliestTimingStart,
			latestTimingEnd: timingsEdges.latestTimingEnd
		});

		this.props.onTimingsChange.call(this, timings, targetTiming, "Change timing");
	},
	getDateFromTimings: function (timings) {
		var sortedTimings = timings.sort(function (t1, t2) {
			return t1.start > t2.start ? 1 :
					t1.start < t2.start ? -1 : 0;
		});
		var today = utils.setTime(new Date(), 0, 0, 0, 0);

		for (var i = 0; i < sortedTimings.length; i++) {
			var d = new Date(sortedTimings[i].start);
			if (d > today) {
				return d;
			}
		}
		return new Date(sortedTimings[sortedTimings.length - 1].start);
	},

	getInitialState: function () {

		var timingStep = this.props.timingStep;

		var startTime = utils.parseTime(this.props.startTime), endTime = utils.parseTime(this.props.endTime);

		endTime = endTime <= startTime ? utils.addDays(endTime, 1 /*one day*/) : endTime;

		var startDate = new Date(),
			earliestTimingStart = startDate,
			latestTimingEnd = startDate,
			timings = [],
			timingsIdProperty = "_rc_id",
			_rc_id = 0;

		if (this.props.timings.length > 0) {

			startDate = this.getDateFromTimings(this.props.timings);
			earliestTimingStart = new Date(this.props.timings[0].start);
			latestTimingEnd = new Date(this.props.timings[0].end);

			var setSecondsToZero = function (date) { date.setSeconds(0); date.setMilliseconds(0); return date };

			timings = this.props.timings.map(function (t) {
				var result = {
					start: setSecondsToZero(utils.roundMinutes(new Date(t.start), timingStep)),
					end: setSecondsToZero(utils.roundMinutes(new Date(t.end), timingStep)),
					originalTiming: t,
				};
				result[timingsIdProperty] = _rc_id++;
				if (earliestTimingStart > result.start) earliestTimingStart = result.start;
				if (latestTimingEnd < result.end) latestTimingEnd = result.end;
				return result;
			});
		}

		while (startDate.getDay() != this.props.weekStartDay) {
			startDate = utils.addDays(startDate, -1);
		}

		var weekStart = utils.setTime( startDate, startTime.getHours(), startTime.getMinutes() ),

		weekEnd = utils.setTime(utils.addDays(weekStart, 7), endTime.getHours(), endTime.getMinutes());

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

		return {
			endTime: endTime,
			startTime: startTime,
			weekStart: weekStart,
			weekEnd: weekEnd,
			allMinutes: utils.minutesDifference(startTime, endTime),
			timings: timings,
			timingsIdProperty: timingsIdProperty,
			lastTimingId: _rc_id,
			readOnly: readOnly,
			languages: languages, 
			currentLanguage: currentLanguage,
			isRecurrenceAdded: null,
			overlaps: [],
			earliestTimingStart: earliestTimingStart,
			latestTimingEnd: latestTimingEnd
		};
	},

	shouldComponentUpdate: function (nextProps, nextState) {

		if ( nextState.isRecurrenceAdded !== this.state.isRecurrenceAdded ) return true;

		if ( nextState.earliestTimingStart.toISOString() != this.state.earliestTimingStart.toISOString() ||
			nextState.latestTimingEnd.toISOString() != this.state.latestTimingEnd.toISOString() ) {

			return false;

		}

		return true;
	},

	updateWeekStartAndEnd: function( weekStart ) {

		this.setState({
			weekStart: weekStart,
			weekEnd: utils.addDays( weekStart, 7 ) 
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

	createRecurrence: function (startDate, endDate) {
		var weekStart = this.state.weekStart, weekEnd = this.state.weekEnd;
		var recurrenceStart = utils.setTime(startDate, this.state.startTime.getHours(), this.state.startTime.getMinutes());
		var recurrenceEnd = utils.setTime(endDate, this.state.endTime.getHours(), this.state.endTime.getMinutes());
		if (recurrenceEnd < utils.setTime(endDate, this.state.startTime.getHours(), this.state.startTime.getMinutes())) {
			recurrenceEnd = utils.addDays(recurrenceEnd, 1);
		}

		var currentWeekTimings = utils.createTwoDimensionalArray(7);
		this.refs.scheduler.props.timings.forEach(function (t) {
			currentWeekTimings[t.start.getDay()].push(t);
		});
		var timingsToReccurence = [];
		for (var start = recurrenceStart; start < recurrenceEnd; start = utils.addDays(start, 1)) {
			var currentDayTimings = currentWeekTimings[start.getDay()];
			for (var l = 0; l < currentDayTimings.length; l++) {
				var daysDiff = Math.ceil(utils.minutesDifference(currentDayTimings[l].start, start) / 1440);
				timingsToReccurence.push({ start: utils.addDays(currentDayTimings[l].start, daysDiff), end: utils.addDays(currentDayTimings[l].end, daysDiff) });
			}
		}
		var selectedPeriodTimings = utils.createTwoDimensionalArray(7);
		this.state.timings.filter(function (t) {
			return !(t.start >= weekStart && t.end <= weekEnd) && (t.start >= recurrenceStart && t.end <= recurrenceEnd);
		}).forEach(function (t) {
			selectedPeriodTimings[t.start.getDay()].push(t);
		});

		var overlaps = [], isOverlap = false;
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
		if (isOverlap == true) {
			this.setState({ isRecurrenceAdded: false, overlaps: overlaps });
		}
		else {
			this.addTimings(timingsToReccurence);
			this.setState({ isRecurrenceAdded: true });
			setTimeout((function () { this.setState({ isRecurrenceAdded: null }) }).bind(this), 3000);
		}
	},

	render: function () {

		var weekStart = this.state.weekStart,

		weekEnd = this.state.weekEnd;

		var timings = this.state.timings.filter(function (t) {
			return t.start >= weekStart && t.end <= weekEnd;
		});

		var timingsModifications = this.state.readOnly === true ? undefined : {
			addTiming: this.addTiming, removeTiming: this.removeTiming, changeTiming: this.changeTiming
		};

		var lang = this.state.currentLanguage;

		var bottompart;

		if (!this.state.readOnly) {

			var messageCloseFunction = (function () { this.setState({ isRecurrenceAdded: undefined }) }).bind(this);
			var messageCloseIcon = React.createElement("div", {className: "rc-message-close rc-icon rc-icon-close", onClick: messageCloseFunction})
			if (this.state.isRecurrenceAdded === true) {
				bottompart = React.createElement("div", {className: "rc-success"}, 
					lang.recurrenceAddedSuccessfully, 
					messageCloseIcon
				)
			}
			else if (this.state.isRecurrenceAdded === false) {
				bottompart =
				React.createElement("div", {className: "rc-error"}, 
					lang.timingsPreventRecurring, ":", 
					React.createElement("ul", null, 
						this.state.overlaps.map(function(value, i){
							return React.createElement("li", {key: i}, value)
						})
					), 
					messageCloseIcon
				);
			}
			else {
				bottompart = React.createElement(Recurrencer, {
				  createRecurrence: this.createRecurrence, 
				  startDate: weekStart, 
				  endDate: weekEnd, 
				  strings: lang, 
				  dateFormat: this.props.dateFormat});
			}
		}

		return (
			React.createElement("div", {className: "rc-calendar rc-noselect"}, 
				React.createElement("div", {className: "rc-calendar-body"}, 
					React.createElement(Stats, {
					  timings: timings, 
					  strings: lang}), 
					React.createElement(Header, {
					  startDate: weekStart, 
					  goAnotherWeek: this.goAnotherWeek, 
					  goAnotherMonth: this.goAnotherMonth, 
					  goAnotherYear: this.goAnotherYear, 
						months: lang.months.full, 
						weekdays: lang.weekdays}), 
					React.createElement(Scheduler, {ref: "scheduler", 
					  startDate: weekStart, 
					  startTime: this.state.startTime, 
					  endTime: this.state.endTime, 
					  timeStep: this.props.timeStep, 
					  allMinutes: this.state.allMinutes, 
						timings: timings, 
						timingStep: this.props.timingStep, 
						defaultTimigDuration: this.props.defaultTimigDuration, 
						weekdays: lang.weekdays, 
						timingsModifications: timingsModifications, 
						readOnly: this.state.readOnly, 
						onTimingClick: this.props.onTimingClick, 
						timingsIdProperty: this.state.timingsIdProperty})
				), 
				React.createElement("div", {className: "rc-reccurencer"}, 
					bottompart
				)
			)
			);
	}
});

module.exports = TimingsPicker;