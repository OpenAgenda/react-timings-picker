"use strict";

var React = require("react");
var utils = require("../../utils/utils");

var DateInput = React.createClass({
  displayName: "DateInput",
  propTypes: {
    dateFormat: React.PropTypes.string.isRequired,
    className: React.PropTypes.string.isRequired,
    onBlur: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    focus: React.PropTypes.bool.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    handleClick: React.PropTypes.func.isRequired,
    name: React.PropTypes.string,
    readOnly: React.PropTypes.bool,
    placeholderText: React.PropTypes.string,
    required: React.PropTypes.bool
  },
  getDefaultProps: function () {
    return {
      onBlur: function () { },
      onFocus: function () { },
      dateFormat: "DD-MM-YYYY",
      className: "rc-dp-input",
    };
  },

  componentDidMount: function () {
    this.toggleFocus(this.props.focus);
  },
  componentWillReceiveProps: function (newProps) {
    this.toggleFocus(newProps.focus)
  },

  toggleFocus: function (focus) {
    if (focus)
      this.refs.input.focus();
    else
      this.refs.input.blur();
  },
  safeDateFormat: function (date) {
    return !!date ? date.format(this.props.dateFormat) : null;
  },

  handleKeyDown: function (event) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        this.props.hideCalendar();
        break;
      default: return;
    }
  },
  handleClick: function (event) {
    if (!this.props.disabled) {
      this.props.handleClick(event);
    }
  },
  handleChange: function(){
    console.log("handleChange");
    console.log(arguments);
  },

  render: function () {
    return (
      <input ref="input" type="text" name={this.props.name}
        value={this.safeDateFormat(this.props.date)} 
        onClick={this.handleClick} onKeyDown={this.handleKeyDown}
        onFocus={this.props.onFocus} onBlur={this.props.onBlur}
        onChange={this.handleChange}
        className={this.props.className}
        disabled={this.props.disabled}
        placeholder={this.props.placeholderText}
        readonly={this.props.readonly}
        required={this.props.required}/>
      );
  }
});

module.exports = DateInput;