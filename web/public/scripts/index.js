const loginElement = document.querySelector('#login-form');
const registerElement = document.querySelector('#register-form')
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector("#authentication-bar");

function showRegisterForm() 
{
    registerElement.style.display = "block";
    loginElement.style.display = "none";
}

function showLoginForm() 
{
    registerElement.style.display = "none";
    loginElement.style.display = "block";
}

// Elements for GPIO_relay states
const stateElement1 = document.getElementById("state1");
const stateElement2 = document.getElementById("state2");
const stateElement3 = document.getElementById("state3");
const stateElement4 = document.getElementById("state4");
const stateElement5 = document.getElementById("state5");
const stateElement6 = document.getElementById("state6");
const stateElement7 = document.getElementById("state7");
const stateElement8 = document.getElementById("state8");
/*
const stateElement9 = document.getElementById("state9");
const stateElement10 = document.getElementById("state10");
const stateElement11 = document.getElementById("state11");
const stateElement12 = document.getElementById("state12");
const stateElement13 = document.getElementById("state13");
const stateElement14 = document.getElementById("state14");
const stateElement15 = document.getElementById("state15");
const stateElement16 = document.getElementById("state16");
*/
// Button Elements
const btn1state = document.getElementById('btn1');
const btn2state = document.getElementById('btn2');
const btn3state = document.getElementById('btn3');
const btn4state = document.getElementById('btn4');
const btn5state = document.getElementById('btn5');
const btn6state = document.getElementById('btn6');
const btn7state = document.getElementById('btn7');
const btn8state = document.getElementById('btn8');
/*
const btn9On = document.getElementById('btn9On');
const btn9Off = document.getElementById('btn9Off');
const btn10On = document.getElementById('btn10On');
const btn10Off = document.getElementById('btn10Off');
const btn11On = document.getElementById('btn11On');
const btn11Off = document.getElementById('btn11Off');
const btn12On = document.getElementById('btn12On');
const btn12Off = document.getElementById('btn12Off');
const btn13On = document.getElementById('btn13On');
const btn13Off = document.getElementById('btn13Off');
const btn14On = document.getElementById('btn14On');
const btn14Off = document.getElementById('btn14Off');
const btn15On = document.getElementById('btn15On');
const btn15Off = document.getElementById('btn15Off');
const btn16On = document.getElementById('btn16On');
const btn16Off = document.getElementById('btn16Off');
*/
// Database path for GPIO_relay states
var dbPathOutput1 = 'board1/outputs/digital/2';
var dbPathOutput2 = 'board1/outputs/digital/4';
var dbPathOutput3 = 'board1/outputs/digital/5';
var dbPathOutput4 = 'board1/outputs/digital/21';
var dbPathOutput5 = 'board1/outputs/digital/14';
var dbPathOutput6 = 'board1/outputs/digital/15';
var dbPathOutput7 = 'board1/outputs/digital/16';
var dbPathOutput8 = 'board1/outputs/digital/17';
/*
var dbPathOutput9 = 'board1/outputs/digital/18';
var dbPathOutput10 = 'board1/outputs/digital/19';
var dbPathOutput11 = 'board1/outputs/digital/23';
var dbPathOutput12 = 'board1/outputs/digital/25';
var dbPathOutput13 = 'board1/outputs/digital/26';
var dbPathOutput14 = 'board1/outputs/digital/27';
var dbPathOutput15 = 'board1/outputs/digital/32';
var dbPathOutput16 = 'board1/outputs/digital/33';
*/

// Database references for relay
var dbRefOutput1 = firebase.database().ref().child(dbPathOutput1);
var dbRefOutput2 = firebase.database().ref().child(dbPathOutput2);
var dbRefOutput3 = firebase.database().ref().child(dbPathOutput3);
var dbRefOutput4 = firebase.database().ref().child(dbPathOutput4);
var dbRefOutput5 = firebase.database().ref().child(dbPathOutput5);
var dbRefOutput6 = firebase.database().ref().child(dbPathOutput6);
var dbRefOutput7 = firebase.database().ref().child(dbPathOutput7);
var dbRefOutput8 = firebase.database().ref().child(dbPathOutput8);
/*
var dbRefOutput9 = firebase.database().ref().child(dbPathOutput9);
var dbRefOutput10 = firebase.database().ref().child(dbPathOutput10);
var dbRefOutput11 = firebase.database().ref().child(dbPathOutput11);
var dbRefOutput12 = firebase.database().ref().child(dbPathOutput12);
var dbRefOutput13 = firebase.database().ref().child(dbPathOutput13);
var dbRefOutput14 = firebase.database().ref().child(dbPathOutput14);
var dbRefOutput15 = firebase.database().ref().child(dbPathOutput15);
var dbRefOutput16 = firebase.database().ref().child(dbPathOutput16);
*/
var indexDBRefSensor = firebase.database().ref().child('/board1/Sensor');
// MANAGE LOGIN/LOGOUT UI
let stopListening;
const setupUI = (user) => 
{
  stopListening?.();
  stopListening = null;
  if (user) 
  {
    loginElement.style.display = 'none';
    registerElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display ='block';
    userDetailsElement.style.display ='block';
    userDetailsElement.textContent = user.email;
    const cleanups = [listenForReadings()];
    const outputs = [
      [dbRefOutput1, btn1state, stateElement1],
      [dbRefOutput2, btn2state, stateElement2],
      [dbRefOutput3, btn3state, stateElement3],
      [dbRefOutput4, btn4state, stateElement4],
      [dbRefOutput5, btn5state, stateElement5],
      [dbRefOutput6, btn6state, stateElement6],
      [dbRefOutput7, btn7state, stateElement7],
      [dbRefOutput8, btn8state, stateElement8]
    ];
    for (const [ref, button, label] of outputs) {
      let pending = false;
      let active = true;
      let state = null;
      function render() {
        button.disabled = pending || state === null;
        button.checked = state === 1;
        label.textContent = pending ? 'Sending…' : state === null ? 'Unavailable' : state === 0 ? 'ON' : 'OFF';
      }
      render();
      const changed = snap => {
        const value = snap.val();
        state = value === 0 || value === 1 ? value : null;
        render();
      };
      ref.on('value', changed, () => { state = null; render(); });
      button.onclick = async () => {
        const value = button.checked ? 1 : 0;
        pending = true;
        render();
        let failed = false;
        try {
          await ref.set(value);
        } catch {
          failed = true;
        } finally {
          if (active) {
            pending = false;
            render();
            if (failed) label.textContent = 'Write failed';
          }
        }
      };
      cleanups.push(() => { active = false; ref.off('value', changed); button.onclick = null; });
    }
    stopListening = () => cleanups.forEach(cleanup => cleanup());
  } 
  else
  {
    loginElement.style.display = 'block';
    registerElement.style.display = 'none';
    authBarElement.style.display ='none';
    userDetailsElement.style.display ='none';
    contentElement.style.display = 'none';
  }
}