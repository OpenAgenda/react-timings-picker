var Calendar = React.createClass({
	addTiming: function (targetTiming) {
		var timings = this.state.timings;

		for (var i = 0; i < timings.length; i++) {
			var t = timings[i]
			if (!(t.start >= targetTiming.end) && !(t.end <= targetTiming.start)) {
				return;
			}
		}

		targetTiming[this.state.timingsIdProperty] = this.state.lastTimingId;

		timings.push(targetTiming);
		this.setState({ timings: timings, lastTimingId: this.state.lastTimingId + 1 });

		this.props.onTimingsChange.call(this, timings, targetTiming, "Add timing");
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
		var utils = new Utils();

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
		var utils = new Utils();
		var startDate = this.props.timings.length < 0 ? new Date() : this.getDateFromTimings(this.props.timings);

		while (startDate.getDay() != this.props.weekStartDay) {
			startDate = utils.addDays(startDate, -1);
		}

		var timeStep = 60, timingStep = 10;

		var startTime = utils.parseTime(this.props.startTime), endTime = utils.parseTime(this.props.endTime);
		endTime = endTime <= startTime ? utils.addDays(endTime, 1 /*one day*/) : endTime;

		var allMinutes = utils.minutesDifference(startTime, endTime);

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

		return {
			endTime: endTime, startTime: startTime, startDate: startDate,
			timeStep: timeStep, timingStep: timingStep, allMinutes: allMinutes,
			utils: utils, timings: timings, timingsIdProperty: timingsIdProperty, lastTimingId: _rc_id,
		};
	},
	goAnotherWeek: function(next){
		this.setState({
			startDate: this.state.utils.addDays(this.state.startDate, next == true ? 7 : -7)
		});
	},
	render: function () {
		var weekStart = this.state.utils.setTime(this.state.startDate, this.state.startTime.getHours(), this.state.startTime.getMinutes()),
			weekEnd = this.state.utils.setTime(this.state.utils.addDays(weekStart, 7), this.state.endTime.getHours(), this.state.endTime.getMinutes());
		var timings = this.state.timings.filter(function (t) {
			return t.start >= weekStart && t.end <= weekEnd;
		});
		return (
			<div className="rc-calendar">
				<Header startDate={this.state.startDate} goAnotherWeek={this.goAnotherWeek}/>
				<Scheduler startDate={this.state.startDate} startTime={this.state.startTime} endTime={this.state.endTime} timeStep={this.state.timeStep} 
						timings={timings} timingStep={this.state.timingStep} allMinutes={this.state.allMinutes} defaultTimigDuration={60} 
						addTiming={this.addTiming} removeTiming={this.removeTiming} changeTiming={this.changeTiming}/>
			</div>
			);
	}
});