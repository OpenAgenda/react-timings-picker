var TimingColumn = React.createClass({
	render: function () {
		var utils = new Utils();

		var timingsComponents = [];

		var startDate = this.props.startDate;
		var height = this.props.height;

		var timings = this.props.timings;
		var timingStep = this.props.timingStep;
		for (var i = 0; i < timings.length; i++) {
			var timingStart = new Date(timings[i].start);
			var timingsEnd = new Date(timings[i].end);

			var startMinutesDifference = utils.round(utils.minutesDifference(startDate, timingStart), timingStep);
			timingStart.setMinutes(utils.addMinutes(startDate, startMinutesDifference).getMinutes());
			var endMinutesDifference = utils.round(utils.minutesDifference(startDate, timingsEnd), timingStep);
			timingsEnd.setMinutes(utils.addMinutes(startDate, endMinutesDifference).getMinutes());

			var top = (height * startMinutesDifference) / this.props.allMinutes;
			var bottom = (height * endMinutesDifference) / this.props.allMinutes;

			var style = { top: top + 'px', height: (bottom - top) + 'px' };

			timingsComponents.push(<Timing startTime={utils.formatTime(timingStart)} endTime={utils.formatTime(timingsEnd)} style={style}/>);
		}

		return (
			<div className="rc-timing-column">
				{timingsComponents}
			</div>
			);
	}
});