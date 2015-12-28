
var DOMUtils = function() {

}

DOMUtils.prototype.getVertiacalScrollOffset = function () {

  var doc = document.documentElement;
  return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

}

DOMUtils.prototype.elementOffset = function ( element ) {
  var top = 0, left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while ( element );

  return {
    top: top,
    left: left
  };
};

DOMUtils.prototype.getParentHavingClass = getParentHavingClass;

function getParentHavingClass( element, cls ) {

  if ( element.className && element.className.split( ' ' ).indexOf( cls ) >= 0 ) return element;

  if ( !element.parentNode ) return false;

  return getParentHavingClass( element.parentNode, cls );

}

DOMUtils.prototype.hasClass = function ( el, className ) {

  if ( el.classList )
    return el.classList.contains( className );
  else
    return !!el.className.match( new RegExp( '(\\s|^)' + className + '(\\s|$)' ) );

}

DOMUtils.prototype.addClass = function ( el, className ) {

  if ( el.classList )
    el.classList.add( className );
  else if ( !hasClass( el, className ) )
    el.className += " " + className;

}

DOMUtils.prototype.removeClass = function ( el, className ) {

  if ( el.classList )
    el.classList.remove(className);

  else if ( hasClass( el, className ) ) {

    var reg = new RegExp( '(\\s|^)' + className + '(\\s|$)' );
    el.className = el.className.replace( reg, ' ' );

  }

}

module.exports = new DOMUtils();