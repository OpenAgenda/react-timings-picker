'use strict';

var utils = require('../../utils/utils');
var propTypes = require("../../utils/propTypes");

var React = require('react');

var Timing = React.createClass({displayName: "Timing",
	propTypes:{
		timing: React.PropTypes.object.isRequired,
		timeProperties: propTypes.timingsTimeProperties.isRequired,
		readOnly: React.PropTypes.bool.isRequired,
		remove: React.PropTypes.func,
		onEventMouseDown: React.PropTypes.func,
		onResizerMouseDown: React.PropTypes.func
	},
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
			React.createElement("div", {className: "rc-event", onMouseDown: this.props.onEventMouseDown}, 
				React.createElement("div", {className: timeClassNames}, 
					React.createElement("span", {className: "start"}, utils.formatTime(this.props.timing.start)), " - ", React.createElement("span", {className: "end"}, utils.formatTime(this.props.timing.end))
				), 
				this.props.readOnly ? undefined : React.createElement("div", {className: "rc-event-resizer", "data-nodrag": "1", onMouseDown: this.props.onResizerMouseDown}), 
				this.props.readOnly ? undefined : React.createElement("div", {className: "rc-event-icon rc-icon rc-icon-close", preventDrag: true, onClick: this.props.remove.bind(null,this.props.timing)})
			)
			);
	}
});

module.exports = Timing;