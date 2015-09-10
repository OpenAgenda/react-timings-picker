'use strict';

var utils = require('../../utils');

var React = require('react');

var Timing = React.createClass({
	calculateStyles: function(){
		var thisNode = this.getDOMNode();
		var height = thisNode.parentNode.clientHeight;

		var top = (height * this.props.timeProperties.startMinutesDifference) / this.props.timeProperties.allMinutes;
		var bottom = (height * this.props.timeProperties.endMinutesDifference) / this.props.timeProperties.allMinutes;

		var style = 'top:' + top + 'px; height:' + (bottom - top - 2) + 'px;';
		thisNode.style.cssText = style;
	},
	componentDidMount: function () {
		this.calculateStyles.call(this);
	},
	componentDidUpdate: function () {
		this.calculateStyles.call(this);
	},
	render: function () {
		var timeClassNames = this.props.readOnly ? 'rc-time rc-readonly' : 'rc-time';
		return (
			<div className="rc-event" onMouseDown={this.props.onEventMouseDown}>
				<div className={timeClassNames}>
					<span className="start">{utils.formatTime(this.props.timing.start)}</span> - <span className="end">{utils.formatTime(this.props.timing.end)}</span>
				</div>
				{this.props.readOnly ? undefined : <div className="rc-event-resizer" onMouseDown={this.props.onResizerMouseDown}></div>}
				{this.props.readOnly ? undefined : <div className="rc-event-icon rc-icon rc-icon-close" onClick={this.props.remove.bind(null,this.props.timing)}></div>}
			</div>
			);
	}
});

module.exports = Timing;