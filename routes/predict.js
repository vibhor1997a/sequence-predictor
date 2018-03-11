// let ts1 = new Date().getTime();
const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
let str = "";

/* if (!fs.existsSync('./tmp')) {
  fs.mkdirSync('./tmp');
}
 */
// Spawed the python script
let p = spawn('python', ['python/script.py']);
console.log(`spawned with pid ${p.pid}`);

/* let w = fs.createWriteStream('./tmp/log' + ts1 + '.txt');
p.stderr.pipe(w);
p.stdout.pipe(w);
 */

/* Route '/predict' to predict the seq */
router.get('/', managePredictor);

function managePredictor(req, res, next) {
  try {
    //timestamp
    let ts = new Date().getTime();
    let token = ts + '_' + magic();
    let seq = req.query.seq;
    let re = new RegExp(token + '((?:\\s|\\S)*)' + token);
    // w.write(token + '\n' + seq + '\n');
    // p.stdin.write(token + '\n' + seq + '\n');
    handle(5, (err, o) => {
      if (err) {
        res.status(500).send('Internal Server Error!');
      }
      else {
        res.send(o);
      }
    });
    /**
     * Handles the stdout
     * @param {Number} counter 
     * @param {*} callback 
     */
    function handle(counter, callback) {
      if (counter > 0) {
        p.stdout.once('data', (chunk) => {
          str += chunk;
          let r = re.exec(str);
          if (r) {
            callback(null, JSON.parse(r[1]));
          }
          else {
            handle(counter - 1, callback);
          }
        });
      }
      else {
        callback(new Error('stack size exceeded'));
      }
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
}

/** 
 * returns a random token of length b/w 5-7 with some magic sauce
 * @returns {string}
*/
function magic() {
  let charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  //5-7
  let n = Math.ceil(Math.random() * 3) + 4;
  let s = '';
  for (let i = 0; i < n; i++) {
    //concatenate a random char from the charSet
    s += charSet.charAt(Math.floor(Math.random() * charSet.length));
  }
  return s;
}


module.exports = router;