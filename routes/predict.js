//timestamp
let ts = new Date().getTime();
const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

if (!fs.existsSync('./temp')) {
  fs.mkdirSync('./temp');
}

// Spawed the python script
let p = spawn('python', ['python/script.py'], { stdio: ['pipe', 'pipe', process.stderr] });
//piped the stdout to outStream
console.log(`spawned with pid ${p.pid}`);


let w = fs.createWriteStream('./temp/out_' + ts + '.txt');
p.stdout.pipe(w);

/* Route '/predict' to predict the seq */
router.get('/', function (req, res, next) {
  let seq = req.query.seq;
  console.log(req.query);
  managePredictor(seq, (err, o) => {
    res.send(JSON.stringify(o, null, 4));
    console.log(JSON.stringify(o, null, 4));
  });
});

/**
 * Manages the predictor in python already running
 * Passes the Object in the callback if exists or null and error or null
 * @param {string} seq 
 * @param {*} callback 
 */
function managePredictor(seq, callback) {
  p.stdin.write(seq + '\n');
  let re = /{[^{}]*}$/g;
  let i = 4;
  let t = setInterval(reader, 1000);
  function reader() {
    i--;
    fs.readFile('./temp/out_' + ts + '.txt', 'utf-8', (err, str) => {
      str = str.trim();
      let o = str.match(re);
      if (err) {
        callback(err);
        clearInterval(t);
      }
      else {
        if (o) {
          callback(null, JSON.parse(o));
          clearInterval(t);
        }
        else {
          if (i <= 0) {
            clearInterval(t);
          }
        }
      }
    });
  }
}

module.exports = router;