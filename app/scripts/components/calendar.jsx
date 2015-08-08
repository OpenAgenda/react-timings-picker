var Calendar = React.createClass({
	getDateFromTimings: function (timings) {
		var utils = new Utils();

		var sortedTimings = timings.sort(function (t1, t2) {
			return t1.start > t2.start ? 1 :
					t1.start < t2.start ? -1 : 0;
		});
		var today = utils.setTime(new Date, 0, 0, 0, 0);

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

		var startTime = utils.parseTime(this.props.startTime);
		var endTime = utils.parseTime(this.props.endTime);
		endTime = endTime <= startTime ? utils.addDays(endTime, 1 /*one day*/) : endTime;
		return { endTime: endTime, startTime: startTime, startDate: startDate, timeStep: timeStep, timingStep: timingStep };
	},
	componentDidMount: function () {
		this.renderTimings();
	},
	componentDidUpdate: function () {
		this.renderTimings();
	},
	renderTimings: function () {
		var utils = new Utils();
		var timingsElement = document.getElementById('rc-timings');
		var allMinutes = utils.minutesDifference(this.state.startTime, this.state.endTime);

		React.render(<TimingGrid height={timingsElement.clientHeight} timings={this.props.timings} timingStep={this.state.timingStep} startDate={this.state.startDate} allMinutes={allMinutes}/>, timingsElement);
	},
	goAnotherWeek: function(next){
		var utils = new Utils();
		this.setState({
			startDate: utils.addDays(this.state.startDate, next == true ? 7 : -7)
		});
	},
	render: function () {
		
		return (
			<div className="rc-calendar">
				<Header startDate={this.state.startDate} goAnotherWeek={this.goAnotherWeek}/>
				<Scheduler startDate={this.state.startDate} startTime={this.state.startTime} endTime={this.state.endTime} timeStep={this.state.timeStep} />
			</div>
			);
	}
});