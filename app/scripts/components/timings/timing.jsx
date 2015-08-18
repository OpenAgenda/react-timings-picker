var Timing = React.createClass({
	calculateStyles: function(){
		var thisNode = this.getDOMNode();
		var height = thisNode.parentNode.clientHeight;

		var top = (height * this.props.startMinutesDifference) / this.props.allMinutes;
		var bottom = (height * this.props.endMinutesDifference) / this.props.allMinutes;

		var style = 'top:' + top + 'px; height:' + (bottom - top) + 'px;';
		thisNode.style.cssText = style;
	},
	componentDidMount: function () {
		this.calculateStyles.call(this);
	},
	componentDidUpdate: function () {
		this.calculateStyles.call(this);
	},
	render: function () {
		var utils = new Utils();
		return (
			<div className="rc-event big" onMouseDown={this.props.onEventMouseDown}>
				<div className="rc-time">
					<span className="start">{utils.formatTime(this.props.startTime)}</span> - <span className="end">{utils.formatTime(this.props.endTime)}</span>
				</div>
				<div className="rc-event-resizer"></div>
				<div className="rc-event-icon rc-icon rc-icon-close" onClick={this.props.remove.bind(null,this.props.timing)}></div>
			</div>
			);
	}
});