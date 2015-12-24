'use strict';

var React = require( 'react' ),
  ReactDOM = require( 'react-dom' );

var utils = require( '../../utils/utils' );

var internalOverlayClassName = 'rc-modal-overlay',
  internalContentClassName = 'rc-modal-content';

var Modal = React.createClass( {
  displayName: 'Modal',

  propTypes: {
    show: React.PropTypes.bool,
    selector: React.PropTypes.string,
    overlayClassNames: React.PropTypes.string,
    contentClassNames: React.PropTypes.string,
    onClose: React.PropTypes.func,
    styles: React.PropTypes.shape( {
      content: React.PropTypes.object,
      overlay: React.PropTypes.object
    } )
  },

  getDefaultProps: function () {

    return {
      show: false,
      selector: '',
      overlayClassNames: '',
      contentClassNames: '',
      onClose: function () { },
      styles: {
        content: {},
        overlay: {}
      }
    }

  },

  getInitialState: function(){

    return {
      show: this.props.show
    }

  },

  componentWillReceiveProps: function (newProps) {

    this.setState( {
      show: newProps.show
    } );

  },

  onOverlayClick: function (e) {

    if ( !utils.hasClass( e.target, internalOverlayClassName ) ) return;

    this.setState( {
      show: false
    } );

    this.props.onClose(e);

  },

  onContentClick: function ( e ) {

    e.stopPropagation();

  },

  componentDidMount: function () {

    var owner = this.props.selector ? document.querySelector( this.props.selector ) : document.body;

    var modalComponent = document.createElement( 'div' );
    modalComponent.className = internalOverlayClassName + ' ' + this.props.overlayClassNames;

    modalComponent.addEventListener( 'click', this.onOverlayClick );

    var overlayStyles = this.props.styles.overlay;
    for ( var style in this.props.styles.overlay ) {
      var prop = style.toString()
      //hasOwnProperty doesn't work for FireFox and IE because of additional nesting.
      //all the styles are empty string by default. 
      //due to this check for undefined can be used.
      if ( modalComponent.style[prop] !== undefined ) {
        modalComponent.style[prop] = overlayStyles[prop];
      }
    }

    this._modalComponent = modalComponent;

    owner.appendChild( modalComponent );

    this.renderModal();

  },

  componentWillUnmount: function () {

    var owner = this.props.selector ? document.querySelector( this.props.selector ) : document.body;

    owner.removeChild( this._modalComponent );

    delete this._modalComponent;

  },

  componentDidUpdate: function(){

    this.renderModal();

  },

  renderModal: function(){

    this._modalComponent.style.display = this.state.show ? '' : 'none';

    ReactDOM.render( this.renderConent(), this._modalComponent );

  },

  renderConent: function () {

    var classNames = internalContentClassName + ' ' + this.props.contentClassNames;

    return (
      <div className={classNames} onClick={this.onContentClick} style={this.props.styles.content}>
        {this.props.children}
      </div>
    );

  },

  render: function () {

    return ( <span></span> );

  }

} );

module.exports = Modal;