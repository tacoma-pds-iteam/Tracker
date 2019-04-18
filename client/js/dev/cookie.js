/***************************************************************************
Filename: cookie.js
Description: This file holds methods for updating the browser cookies used 
by the controller.
****************************************************************************/
class Cookies {
  constructor () {
    this.username = "";
    this.path = "/";
  }
  /* Function replaces encoded space characters with real space value */
  _spaceReplace (_str) { // if cookie contains a space, encode it
    if (typeof(_str) != 'undefined')
      return _str.split('%20').join(' ');
    else
      return _str;
  }
  /* Function grabs cookie from browser with give identifier */
  getCookie (key) {
    let cookieVal;
    let cookies = document.cookie.split(";");
    for(let i in cookies) {
      cookieVal = cookies[i].split("=");
      if(cookieVal && cookieVal[0].includes(key)) {
        return this._spaceReplace(cookieVal[1]);
      }
    }
    return null;
  }
  /* Function sets cookie in the browser */
  setCookie (cookieName, cookieVal) {
    document.cookie = `${encodeURIComponent(cookieName)}=${encodeURIComponent(cookieVal)};path=${this.path}`;
  }
  /* Function resets cookie values, essentially deleting them */
  resetCookie (key) {
    for(let i in arguments)
      document.cookie = `${arguments[i]}=; Path=${this.path};expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  }

}