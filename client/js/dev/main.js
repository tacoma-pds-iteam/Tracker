/***************************************************************************
Filename: main.js
Description: This class is the instantiator class. There are no functions, only
to generate the various objects needed for the page. All actions are driven
by the controller and view classes. 
****************************************************************************/
class Main {
  constructor () {
    this.cookies = new Cookies('SUPP');
    this.socket = io({
          reconnection: false,
          reconnectionAttempts: 1,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          forceNew: true
    }); // socket initialize
    this.view = new View(); // UI functions
    this.controller = new Controller(this); // pass cookies socket and view to controller
  }
}
