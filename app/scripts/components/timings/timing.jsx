var Timing = React.createClass({
	render: function () {
		return (
			<div className="rc-event big" style={this.props.style}>
				<div className="rc-time">
					{this.props.startTime} - {this.props.endTime}
				</div>
				<div className="rc-event-resizer"></div>
				<div className="rc-event-icon rc-icon rc-icon-close"></div>
			</div>
			);
	}
});