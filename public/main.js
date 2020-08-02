/*====================
GLOBALS***************
====================*/
let currentSet;
let currentMondai = {
  kanji: null,
  yomikata: null,
  definition: null
};
let takingPhoto = false;
let clearCanvas = false;
let clearMirror = false;
let preventDrawing = false;

const userSettings = {
  brushSize: 5
};

const domEls = {
  mondaiButt: document.getElementById('mondai-button'),
  brushSizeRange: document.getElementById('brush-size'),
  canvas: document.getElementById('canvas'),
  keshi: document.getElementById('keshi'),
  bigMag: document.getElementById('big-mac'),
  toolsCloser: document.getElementById('tools-closer'),
  tools: document.getElementById('tools'),
  studySetSelector: document.getElementById('study-set-selector'),
  setSelectorButt: document.getElementById('select-study-set-butt'),
  setCloserButt: document.getElementById('set-selector-closer'),
  selectorButts: document.getElementsByClassName('set-selector'),
  mondaiText: document.getElementById('mondai'),
  kanjiAnswer: document.getElementById('kanji_answer'),
  checkAnswerBox: document.getElementById('check-answer'),
  maru: document.getElementById('maru'),
  batsu: document.getElementById('batsu'),
  yourDrawing: document.getElementById('your-drawing'),
  statsDisplay: document.getElementById('stats'),
  toolsOut: false
};

const userStats = {
  studySetUsingNow: 'random kanji',
  percentCorrect: 100,
  numberCorrect: 0,
  questionOutOf: {
    currentQuestion: 1,
    totalQuestions: 20
  },
  updateStats: function (correct) {
    if (correct) {
      this.numberCorrect += 1;
    }
    this.percentCorrect = Math.round((this.numberCorrect / this.questionOutOf.currentQuestion) * 100);
    this.questionOutOf.currentQuestion += 1;
  }
};

function createStatsTable() {
  for (let i = 0; i < domEls.statsDisplay.childNodes.length; i++) {
    domEls.statsDisplay.removeChild(domEls.statsDisplay.childNodes[i]);
  }
  const statsTable = document.createElement('table');
  const studySetRow = document.createElement('tr');
  const questionOutOfRow = document.createElement('tr');
  const percentCorrectRow = document.createElement('tr');
  const studySetText = document.createTextNode(`Study set:  ${userStats.studySetUsingNow}`);
  const questionsOutOfText = document.createTextNode(
    `Question ${userStats.questionOutOf.currentQuestion}/${userStats.questionOutOf.totalQuestions}`
  );
  const percentCorrectText = document.createTextNode(`${userStats.percentCorrect}% correct`);
  studySetRow.appendChild(studySetText);
  questionOutOfRow.appendChild(questionsOutOfText);
  percentCorrectRow.appendChild(percentCorrectText);
  statsTable.appendChild(studySetRow);
  statsTable.appendChild(questionOutOfRow);
  statsTable.appendChild(percentCorrectRow);
  domEls.statsDisplay.appendChild(statsTable);
}
createStatsTable();

const canvasSettings = {
  width: domEls.canvas.clientWidth,
  height: domEls.canvas.clientHeight
};

const getWordSet = async (whichOne) => {
  const res = await fetch(`/get-words/${whichOne}`);
  const data = await res.json();
  currentSet = data.set;
  console.log(currentSet);
  userStats.studySetUsingNow = currentSet.title;
  userStats.questionOutOf.currentQuestion = 1;
  clearCanvas();
  createStatsTable();
};

const getPreDefinedWordSet = async (src, title) => {
  const res = await fetch(`./${src}`);
  const words = await res.json();
  currentSet = {};
  currentSet.title = title;
  currentSet.words = words;
  console.log(currentSet);
  userStats.studySetUsingNow = currentSet.title;
  userStats.questionOutOf.currentQuestion = 1;
  clearCanvas = true;
  createStatsTable();
};

getPreDefinedWordSet('jlpt-five.jscsrc', 'Random kanji'); // set up initially

for (let i = 0; i < domEls.selectorButts.length; i++) {
  domEls.selectorButts[i].addEventListener('click', (e) => {
    domEls.studySetSelector.style.display = 'none';
    preventDrawing = false;
    if (
      e.target.value === 'jlpt1' ||
      e.target.value === 'jlpt2' ||
      e.target.value === 'jlpt3' ||
      e.target.value === 'jlpt4' ||
      e.target.value === 'jlpt5' ||
      e.target.value === 'random-kanji'
    ) {
      let fileName;
      let title;
      switch (e.target.value) {
        case 'jlpt1':
          fileName = 'jlpt-two.jscsrc';
          title = 'JLPT1';
          break;
        case 'jlpt2':
          fileName = 'jlpt-two.jscsrc';
          title = 'JLPT2';
          break;
        case 'jlpt3':
          fileName = 'jlpt-three.jscsrc';
          title = 'JLPT3';
          break;
        case 'jlpt4':
          fileName = 'jlpt-four.jscsrc';
          title = 'JLPT4';
          break;
        case 'jlpt5':
          fileName = 'jlpt-five.jscsrc';
          title = 'JLPT5';
          break;
        default:
          fileName = 'jlpt-two.jscsrc';
          title = 'Random kanji';
          break;
      }
      getPreDefinedWordSet(fileName, title);
    } else {
      getWordSet(e.target.value);
    }
  });
}

const getMondai = () => {
  domEls.mondaiButt.innerText = 'チェック';
  let ranNum = Math.floor(Math.random() * currentSet.words.length);
  currentMondai.yomikata = currentSet.words[ranNum].yomikata;
  currentMondai.kanji = currentSet.words[ranNum].kanji;
  currentMondai.definition = currentSet.words[ranNum].definition;
  domEls.mondaiText.innerText = `${currentMondai.yomikata} (${currentMondai.definition})`;
  console.log(currentMondai);
  clearMirror = true;
};

const checkAnswer = () => {
  //domEls.mondaiButt.innerText = 'もんだい';
  takingPhoto = true;
  domEls.kanjiAnswer.innerText = currentMondai.kanji;
  domEls.checkAnswerBox.style.display = 'block';
  domEls.mondaiButt.disabled = true;
  domEls.mondaiButt.style.display = 'none';
  preventDrawing = true;
};

domEls.maru.addEventListener('click', () => {
  domEls.checkAnswerBox.style.display = 'none';
  preventDrawing = false;
  domEls.mondaiButt.disabled = false;
  domEls.mondaiButt.style.display = 'block';
  getMondai();
  userStats.updateStats(true);
  createStatsTable();
});
domEls.batsu.addEventListener('click', () => {
  domEls.checkAnswerBox.style.display = 'none';
  preventDrawing = false;
  domEls.mondaiButt.disabled = false;
  domEls.mondaiButt.style.display = 'block';
  getMondai();
  userStats.updateStats(false);
  createStatsTable();
});

domEls.setSelectorButt.addEventListener('click', () => {
  domEls.studySetSelector.style.display = 'block';
  preventDrawing = true;
});

domEls.setCloserButt.addEventListener('click', () => {
  domEls.studySetSelector.style.display = 'none';
  preventDrawing = false;
});

domEls.mondaiButt.addEventListener('click', (e) => {
  let text = e.target.innerHTML;
  text === 'スタート' ? getMondai() : checkAnswer();
});

domEls.brushSizeRange.addEventListener('change', (e) => {
  userSettings.brushSize = e.target.value;
});

domEls.bigMag.addEventListener('click', () => {
  if (!domEls.toolsOut) {
    domEls.tools.style.right = '0px';
    domEls.toolsOut = true;
  } else {
    domEls.tools.style.right = '-100%';
    domEls.toolsOut = false;
  }
});

domEls.toolsCloser.addEventListener('click', () => {
  domEls.tools.style.right = '-100%';
  domEls.toolsOut = false;
});

keshi.addEventListener('click', () => {
  clearCanvas = true;
});

window.addEventListener('resize', (e) => {
  canvasSettings.width = domEls.canvas.clientWidth;
  canvasSettings.height = domEls.canvas.clientHeight;
  console.log(canvasSettings);
});

const lastPoints = {
  x: null,
  y: null
};

let mirror;

let sketch = function (p) {
  let pg;
  let cnv;

  p.setup = function () {
    cnv = p.createCanvas(canvasSettings.width, canvasSettings.height);
  };
  p.draw = function () {
    if (clearCanvas) {
      p.clear();
      clearCanvas = false;
    }
    if (!preventDrawing) {
      p.stroke(255, 110, 109);
      p.strokeWeight(userSettings.brushSize);
      if (p.mouseIsPressed) {
        if (lastPoints.x && lastPoints) {
          p.line(lastPoints.x, lastPoints.y, p.mouseX, p.mouseY);
        } else {
          p.line(p.mouseX, p.mouseY, p.mouseX, p.mouseY);
        }
        lastPoints.x = p.mouseX;
        lastPoints.y = p.mouseY;
      }
    }
    if (takingPhoto) {
      mirror = p.createGraphics(p.width, p.height);
      mirror.image(cnv, 0, 0, 100, 100);
      mirror.loadPixels();
    }
  };
  p.mouseReleased = function () {
    lastPoints.x = null;
    lastPoints.y = null;
  };
  p.windowResized = function () {
    pg = p.createGraphics(p.width, p.height);
    pg.image(cnv, 0, 0, canvasSettings.width, canvasSettings.height);
    pg.loadPixels();
    p.resizeCanvas(canvasSettings.width, canvasSettings.height);
    p.image(pg, 0, 0);
  };
};

function yourDrawing(p) {
  let cnv;
  p.setup = function () {
    cnv = p.createCanvas(100, 100);
  };
  p.draw = function () {
    if (clearMirror) {
      p.clear();
      clearMirror = false;
    }
    if (takingPhoto) {
      domEls.yourDrawing.clientWidth = domEls.kanjiAnswer.clientWidth;
      domEls.yourDrawing.clientHeight = domEls.kanjiAnswer.clientHeight;
      p.resizeCanvas(domEls.kanjiAnswer.clientWidth, domEls.kanjiAnswer.clientHeight);
      p.image(mirror, 0, 0);
      takingPhoto = false;
      clearCanvas = true;
    }
  };
}

new p5(sketch, domEls.canvas);
new p5(yourDrawing, domEls.yourDrawing);

/*
//text file parser

const parseText = async (path) => {
  const data = await fetch(`/${path}.txt`);
  const text = await data.text();
  const textToArr = text.split('\n');

  for (let i = 0; i < textToArr.length; i++) {
    const newArr = textToArr[i].split('');
    textToArr[i] = newArr;
  }
  console.log(textToArr);

  for (let i = 0; i < textToArr.length; i++) {
    for (let j = 0; j < textToArr[i].length; j++) {
      if (textToArr[i][j] === ' ' || textToArr[i][j] === '	') {
        textToArr[i][j] = '*';
      }
    }
  }

  for (let i = 0; i < textToArr.length; i++) {
    const newString = textToArr[i].join('');
    textToArr[i] = newString.split('*');

    if (textToArr[i].length > 3) {
      let def = [];
      for (let j = 2; j < textToArr[i].length; j++) {
        def.push(textToArr[i][j]);
      }
      let string = def.join(' ');
      textToArr[i][2] = string;
    }
  }

  const words = [];
  for (let i = 0; i < textToArr.length; i++) {
    words.push({ kanji: textToArr[i][0], yomikata: textToArr[i][1], definition: textToArr[i][2] });
  }
  const jason = JSON.stringify(words);
  async function sendJason() {
    const hello = await fetch('/send-jason', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: jason
    });
  }
  console.log(words);
  sendJason();
};

parseText('jlpt3');


*/

/*

const parseText = async (path) => {
  const data = await fetch(`/${path}.txt`);
  const text = await data.text();
  const textToArr = text.split('\n');

  for (let i = 0; i < textToArr.length; i++) {
    const newArr = textToArr[i].split('');
    textToArr[i] = newArr;
  }
  for (let i = 0; i < textToArr.length; i++) {
    for (let j = 0; j < textToArr[i].length; j++) {
      if (textToArr[i][j] === ' ' || textToArr[i][j] === '	') {
        textToArr[i][j] = '*';
      }
    }
  }
  for (let i = 0; i < textToArr.length; i++) {
    const newString = textToArr[i].join('');
    textToArr[i] = newString;
  }
  for (let i = 0; i < textToArr.length; i++) {
    const newArr = textToArr[i].split('*');
    textToArr[i] = newArr;
    textToArr[i].shift();
  }
  for (let i = textToArr.length - 1; i >= 0; i--) {
    textToArr[i].splice(2, 1); //erase part of speech
    if (textToArr[i][1] === '') {
      textToArr.splice(i, 1);
    }
    if (textToArr[i].length > 3) {
      let word = [];
      for (let j = 2; j < textToArr[i].length; j++) {
        word.push(textToArr[i][j]);
      }
      let string = word.join(' ');
      textToArr[i].splice(2, textToArr[i].length);
      textToArr[i].push(string);
    }
  }
  
  const words = [];
  for (let i = 0; i < textToArr.length; i++) {
    words.push({ kanji: textToArr[i][1], yomikata: textToArr[i][0], definition: textToArr[i][2] });
  }
  const jason = JSON.stringify(words);
  async function sendJason() {
    const hello = await fetch('/send-jason', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: jason
    });
  }
  console.log(words);
  sendJason();
  
};
*/
