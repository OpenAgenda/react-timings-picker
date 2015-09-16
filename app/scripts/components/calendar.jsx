'use strict';

var React = require('react');

var utils = require('../utils');
var i18n = require('../../locales/locales.json');

var Header = require('./header/header.jsx');
var Scheduler = require('./scheduler/scheduler.jsx');
var Reccurencer = require('./scheduler/reccurencer.jsx');

var Calendar = React.createClass({
	isOverlap: function (t1, t2) {
		return t1.start < t2.end && t1.end > t2.start
	},
	canCreateTiming: function (targetTiming) {
		var timings = this.state.timings;
		for (var i = 0; i < timings.length; i++)
			if (this.isOverlap(timings[i], targetTiming)) return false;
		return true;
	},
	addTiming: function (targetTiming) {
		if (this.canCreateTiming(targetTiming)) {
			var timings = this.state.timings, lastId = this.state.lastTimingId;
			targetTiming[this.state.timingsIdProperty] = lastId++;
			timings.push(targetTiming);
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
		this.setState({ timings: timings });

		this.props.onTimingsChange.call(this, timings, targetTiming, "Remove timing");
	},
	changeTiming: function(targetTiming){
		var timings = this.state.timings;

		for (var i = 0; i < timings.length; i++) {
			if (timings[i][this.state.timingsIdProperty] == targetTiming[this.state.timingsIdProperty]) {
				timings[i].start = targetTiming.start;
				timings[i].end = targetTiming.end;
			}
		}

		this.setState({ timings: timings });

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
	getDefaultProps: function(){
		return {
			timeStep: 60,
			timingStep: 10,
			startTime: "7:00",
			endTime: "3:00",
			weekStartDay: 1,
			readOnly: false,
			onTimingClick: function () { },
			onTimingsChange: function () { },
			timings: [],
			defaultTimigDuration: 60,
			additionalLanguages: [],
			lang: navigator.language,
		}
	},
	getInitialState: function () {
		var timingStep = this.props.timingStep;

		var startTime = utils.parseTime(this.props.startTime), endTime = utils.parseTime(this.props.endTime);
		endTime = endTime <= startTime ? utils.addDays(endTime, 1 /*one day*/) : endTime;
		var allMinutes = utils.minutesDifference(startTime, endTime);

		var startDate = this.props.timings.length < 0 ? new Date() : this.getDateFromTimings(this.props.timings);

		while (startDate.getDay() != this.props.weekStartDay) {
			startDate = utils.addDays(startDate, -1);
		}
		var weekStart = utils.setTime(startDate, startTime.getHours(), startTime.getMinutes()),
			weekEnd = utils.setTime(utils.addDays(weekStart, 7), endTime.getHours(), endTime.getMinutes());

		var timingsIdProperty = "_rc_id", _rc_id = 0;

		var setSecondsToZero = function(date) { date.setSeconds(0); date.setMilliseconds(0); return date }

		var timings = this.props.timings.map(function (t) {
			var result = {
				start: setSecondsToZero(utils.roundMinutes(new Date(t.start), timingStep)),
				end: setSecondsToZero(utils.roundMinutes(new Date(t.end), timingStep)),
				originalTiming: t,
			};
			result[timingsIdProperty] = _rc_id++;
			return result;
		});

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
			endTime: endTime, startTime: startTime, weekStart: weekStart, weekEnd: weekEnd,
			allMinutes: allMinutes, timings: timings, timingsIdProperty: timingsIdProperty,
			lastTimingId: _rc_id, readOnly: readOnly,
			languages: languages, currentLanguage: currentLanguage,
		};
	},
	updateWeekStartAndEnd: function (weekStart) {
		this.setState({ weekStart: weekStart, weekEnd: utils.addDays(weekStart, 7) });
	},
	goAnotherWeek: function (next) {
		var newWeekStart = utils.addDays(this.state.weekStart, next == true ? 7 : -7);
		this.updateWeekStartAndEnd(newWeekStart);
	},
	goAnotherMonth: function (month) {
		var newWeekStart = this.state.weekStart;
		var daysInMonth = utils.daysInMonth(newWeekStart.getYear(), month);
		newWeekStart.setDate(newWeekStart.getDate() > daysInMonth ? daysInMonth : newWeekStart.getDate());
		newWeekStart.setMonth(month);
		while (newWeekStart.getDay() != this.props.weekStartDay) {
			newWeekStart = utils.addDays(newWeekStart, -1);
		}
		this.updateWeekStartAndEnd(newWeekStart);
	},
	goAnotherYear: function (year) {
		var newWeekStart = this.state.weekStart;
		newWeekStart.setYear(parseInt(year));
		while (newWeekStart.getDay() != this.props.weekStartDay) {
			newWeekStart = utils.addDays(newWeekStart, -1);
		}
		this.updateWeekStartAndEnd(newWeekStart);
	},
	createReccurence: function (startDate, endDate) {
		var weekStart = this.state.weekStart, weekEnd = this.state.weekEnd;
		var reccurenceStart = utils.setTime(startDate, this.state.startTime.getHours(), this.state.startTime.getMinutes());
		var reccurenceEnd = utils.setTime(endDate, this.state.endTime.getHours(), this.state.endTime.getMinutes());
		if (reccurenceEnd < utils.setTime(endDate, this.state.startTime.getHours(), this.state.startTime.getMinutes())) {
			reccurenceEnd = utils.addDays(reccurenceEnd, 1);
		}

		var currentWeekTimings = utils.createTwoDimensionalArray(7);
		this.refs.scheduler.props.timings.forEach(function (t) {
			currentWeekTimings[t.start.getDay()].push(t);
		});
		var timingsToReccurence = [];
		for (var start = reccurenceStart; start < reccurenceEnd; start = utils.addDays(start, 1)) {
			var currentDayTimings = currentWeekTimings[start.getDay()];
			for (var l = 0; l < currentDayTimings.length; l++) {
				var daysDiff = Math.ceil(utils.minutesDifference(currentDayTimings[l].start, start) / 1440);
				timingsToReccurence.push({ start: utils.addDays(currentDayTimings[l].start, daysDiff), end: utils.addDays(currentDayTimings[l].end, daysDiff) });
			}
		}
		var selectedPeriodTimings = utils.createTwoDimensionalArray(7);
		this.state.timings.filter(function (t) {
			return !(t.start >= weekStart && t.end <= weekEnd) && (t.start >= reccurenceStart && t.end <= reccurenceEnd);
		}).forEach(function (t) {
			selectedPeriodTimings[t.start.getDay()].push(t);
		});

		var overlaps = [], isOverlap = false;
		for (var j = 0; j < timingsToReccurence.length; j++) {
			var t = timingsToReccurence[j], timingsToCheck = selectedPeriodTimings[t.start.getDay()];
			for (var k = 0; k < timingsToCheck.length; k++) {
				if (this.isOverlap(t, timingsToCheck[k])) {
					overlaps.push({ reccurencedTiming: t, overleppedTiming: timingsToCheck[k] });
					isOverlap = true;
				}
			}
		}
		if (isOverlap == true) {
			console.log('overlap');
			console.log(overlaps);
		}
		else {
			this.addTimings(timingsToReccurence);
		}
	},
	render: function () {
		var weekStart = this.state.weekStart, weekEnd = this.state.weekEnd;
		var timings = this.state.timings.filter(function (t) {
			return t.start >= weekStart && t.end <= weekEnd;
		});
		var timingsModifications = this.state.readOnly === true ? null : {
			addTiming: this.addTiming, removeTiming: this.removeTiming, changeTiming: this.changeTiming
		};
		var lang = this.state.currentLanguage;
		return (
			<div className="rc-calendar rc-noselect">
				<div className="rc-calendar-body">
					<Header startDate={weekStart} goAnotherWeek={this.goAnotherWeek} goAnotherMonth={this.goAnotherMonth} goAnotherYear={this.goAnotherYear}
							months={lang.months.full} />
					<Scheduler ref="scheduler" startDate={weekStart} startTime={this.state.startTime} endTime={this.state.endTime} timeStep={this.props.timeStep}
						timings={timings} timingStep={this.props.timingStep} allMinutes={this.state.allMinutes} defaultTimigDuration={this.props.defaultTimigDuration}
						timingsModifications={timingsModifications} readOnly={this.state.readOnly} onTimingClick={this.props.onTimingClick} timingsIdProperty={this.state.timingsIdProperty} 
						weekdays={lang.weekdays}/>
				</div>
				{(this.state.readOnly ? undefined : <Reccurencer createReccurence={this.createReccurence} startDate={weekStart} endDate={weekEnd} strings={lang} />)}
			</div>
			);
	}
});

module.exports = Calendar;