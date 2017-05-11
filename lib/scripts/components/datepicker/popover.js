"use strict";

var React = require("react");
var createReactClass = require( 'create-react-class' );
var PropTypes = require( 'prop-types' );
var ReactDOM = require("react-dom");

var Popover = createReactClass({
  displayName: "Popover",

  propTypes: {
    attachment: PropTypes.string,
    targetAttachment: PropTypes.string,
    targetOffset: PropTypes.string
  },

  getDefaultProps: function () {
    return {
      attachment: "top left",
      targetAttachment: "bottom left",
      targetOffset: "10px 0"
    }
  },
  componentWillMount: function () {
    var popoverContainer = document.createElement("span");
    popoverContainer.className = "rc-datepicker-wrapper";

    this._popoverElement = popoverContainer;
    document.querySelector("body").appendChild(this._popoverElement);
  },
  componentDidMount: function () {
    this._renderPopover();
  },
  componentDidUpdate: function () {
    this._renderPopover();
  },

  _popoverComponent: function () {
    var className = this.props.className;
    return (
      React.createElement("div", {className: className}, 
        this.props.children
      )
      );
  },
  _tetherOptions: function () {
    return {
      element: this._popoverElement,
      target: ReactDOM.findDOMNode(this).parentElement.querySelector("input"),
      attachment: this.props.attachment,
      targetAttachment: this.props.targetAttachment,
      targetOffset: this.props.targetOffset,
      optimizations: {
        moveElement: false
      },
      constraints: [
        {
          to: "window",
          attachment: "together"
        }
      ]
    };
  },
  _renderPopover: function () {
    ReactDOM.render(this._popoverComponent(), this._popoverElement);

    if (this._tether != null) {
      this._tether.setOptions(this._tetherOptions());
    }
    else if (window && document) {
      var Tether = require("tether");
      this._tether = new Tether(this._tetherOptions());
    }
  },

  componentWillUnmount: function () {
    this._tether.destroy();
    ReactDOM.unmountComponentAtNode(this._popoverElement);
    if (this._popoverElement.parentNode) {
      this._popoverElement.parentNode.removeChild(this._popoverElement);
    }
  },

  render: function () {
    return React.createElement("span", null)
  }
});

module.exports = Popover;