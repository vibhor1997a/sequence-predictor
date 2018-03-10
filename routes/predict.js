let ts1 = new Date().getTime();
const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
let str = "";

if (!fs.existsSync('./Logs')) {
  fs.mkdirSync('./Logs');
}

// Spawed the python script
let p = spawn('python', ['python/script.py'], { stdio: ['pipe', 'pipe', process.stderr] });
//piped the stdout to outStream
console.log(`spawned with pid ${p.pid}`);


let w = fs.createWriteStream('./Logs/log' + ts1 + '.txt');
p.stdout.pipe(w);

/* Route '/predict' to predict the seq */
router.get('/', managePredictor);

function managePredictor(req, res, next) {
  try {
    //timestamp
    let ts = new Date().getTime();
    let token = ts + '_' + magic();
    let seq = req.query.seq;
    let re = new RegExp(token + '((?:\\s|\\S)*)' + token);
    w.write(token + '\n' + seq + '\n');
    p.stdin.write(token + '\n' + seq + '\n');
    p.stdout.once('data', (chunk) => {
      str += chunk;
      let s = re.exec(str);
      res.send(JSON.parse(s[1]));
    });
  }
  catch (err) {
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