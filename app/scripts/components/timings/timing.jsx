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
		return (
			<div className="rc-event big">
				<div className="rc-time">
					{this.props.startTime} - {this.props.endTime}
				</div>
				<div className="rc-event-resizer"></div>
				<div className="rc-event-icon rc-icon rc-icon-close" onClick={this.props.remove.bind(null,this.props.timing)}></div>
			</div>
			);
	}
});