'use strict';

var moment = require('moment');
var React = require('react');
var DatePicker = require('react-datepicker');

var Reccurencer = React.createClass({
	createReccurences: function () {
		this.props.createReccurence(this.state.startDate, this.state.endDate);
	},
	onReccurenceStartChange: function(m){
		this.setState({ startDate: m.toDate() });
	},
	onReccurenceEndChange: function(m){
		this.setState({ endDate: m.toDate() });
	},
	toggleDatePickers: function () {
		this.setState({ createReccurence: !this.state.createReccurence });
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({
			startDate: nextProps.startDate, endDate: nextProps.endDate
		});
	},
	getInitialState: function () {
		return { createReccurence: false, startDate: this.props.startDate, endDate: this.props.endDate };
	},
	render: function () {
		var result;
		var strings = this.props.strings;
		if (this.state.createReccurence == true) {
			result = (<div>
				{strings.duplicateTimingsAbove} {strings.from}
				<DatePicker selected={moment(this.state.startDate)} onChange={this.onReccurenceStartChange} /> {strings.to}
				<DatePicker selected={moment(this.state.endDate)} onChange={this.onReccurenceEndChange}/>
				<a className="rc-ok-button" onClick={this.createReccurences}>OK</a>
			</div>);
		}
		else {
			result = (<a onClick={this.toggleDatePickers}>{strings.defineReccuringEvent}</a>);
		}

		return (
			<div className="rc-reccurencer">
				{result}
			</div>
			);
	}
});

module.exports = Reccurencer;