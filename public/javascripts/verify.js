let txt = document.getElementById('seq');
let re = /^\s*(?:-\d|\d)+(?:(?:\s*,\s*|\s)(?:-\d|\d)*){11,}(?:-\d|\d)+\s*$/g;
let re1 = /(?:\s*,\s*|\s+)/g;
let btn = document.getElementById('predict');
// check fuction is invoked every second
let t = setInterval(check, 1000);
/**
 * checks for input validity and enable and disable the btn
 */
function check() {
    let seq = txt.value;
    let a = seq.match(re);
    if (a) {
        btn.disabled = false;
    }
    else {
        btn.disabled = true;
    }
}
//send the GET request to the server on btn click
btn.addEventListener('click', () => {
    let s = txt.value;
    s = s.split(re1).filter(x => (x != '') ? true : false).join(' ');
    console.log(s);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/predict?seq=' + encodeURIComponent(s));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        let DONE = 4; // readyState 4 means the request is done.
        let OK = 200; // status 200 is a successful return.
        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                let o = JSON.parse(xhr.responseText);
                let orignal = document.getElementById('orignal');
                let predicted = document.getElementById('predicted');
                orignal.innerHTML = o.orignal.join(',&nbsp;') + ',';
                predicted.innerHTML = '&nbsp;' + o.predicted.join(',&nbsp;');
                document.getElementById('result').removeAttribute('hidden');
            }
            else {
                console.log('Error: ' + xhr.status); // An error occurred during the request.
            }
        }
    }
    xhr.send(null);
});