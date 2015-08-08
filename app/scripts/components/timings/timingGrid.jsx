var TimingGrid = React.createClass({
	render: function () {
		var utils = new Utils();
		var timings = this.props.timings;
		var startDate = this.props.startDate;

		var columns = [];
		for (var i = 0; i < 7; i++) {
			var dateString = startDate.toDateString();
			var currentTimings = timings.filter(function (t) {
				return new Date(t.start).toDateString() == dateString;
			});

			columns.push(<TimingColumn height={this.props.height} timings={currentTimings} allMinutes={this.props.allMinutes} startDate={startDate} timingStep={this.props.timingStep}/>);
			startDate = utils.addDays(startDate, 1);
		}
		return (
			<div className="rc-timing-grid">
				{columns}
			</div>
			);
	}
});