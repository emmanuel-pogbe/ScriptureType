const selection = document.getElementById("selection");
const startBtn = document.getElementById("start");
const software = document.getElementById("software");
const scriptureSearchBoxes = document.querySelectorAll(".scripture-search");
const scriptureButton = document.querySelectorAll(".scriptureButton");
const scriptureOption = document.querySelectorAll(".scripturebutton-option");
const customBtn = document.getElementById("custom");
const okBtn = document.getElementById("okBtn");
const scriptureInputsEasyWorship = document.querySelectorAll(".input-class");
const scripture = document.getElementById("scripture");
const scriptureData = JSON.parse(document.getElementById("scripture-data").textContent);
const bibleBooks = JSON.parse(document.getElementById("bible-books").textContent);
const prefixMap = JSON.parse(document.getElementById("prefix-map").textContent);
const aliasMap = JSON.parse(document.getElementById("alias-map").textContent);
const help = document.getElementById("help");
const main = document.getElementById("main");
const confirmHelp = document.getElementById("confirm-help");
const timeblock = document.getElementById("timeblock");
const custInput = document.getElementById("customInput");
const customParam = document.querySelector(".customparam");
const book = document.getElementById("book");
const chapter = document.getElementById("chapter");
const verse = document.getElementById("verse");
const videoPsalmInput = document.getElementById("videopsalm-input");
const bibleShowInput = document.getElementById("bibleshow-input");
const resultPage = document.getElementById("result");

let selected = "";
let vPText = ""; // VideoPsalmText
let vPSuggestion = ""; //VideoPsalmSuggestion
let vPFinalBook = null; //VideoPsalmFinalBook
let resultText = document.getElementById("average-result-text");
let started = 0;
let times = [];
let previousTime = null
let scriptureCount = 0;
let totalScriptures = 0;
let totalTime = 30;
let timeLeft = 30;
let timerActive = false;
let timeoutId = null;
let averageResult = document.getElementById("average");
let testType = document.getElementById("custom-test-type");
let softwareType = document.getElementById("software-type");
let timerText = document.getElementById("timerText");

startBtn.addEventListener("click",function(e) {
  console.log(prefixMap);
  console.log(aliasMap);
  e.preventDefault();
  selected = software.value;
  scriptureSearchBoxes.forEach(input=>{
    input.classList.add("hidden")
  });
  if (selected == "EasyWorship") {
    document.getElementById("easyworship-box").classList.remove("hidden");
  }
  else if (selected == "VideoPsalm") {
    document.getElementById("videopsalm-box").classList.remove("hidden");
  }
  else {
    document.getElementById("bibleshow-box").classList.remove("hidden");
  }
  selection.classList.add("hidden");
  main.classList.remove("hidden");
  document.getElementById("options").style.visibility = "visible";
  timeblock.classList.add("hidden");
  fetchScripture();
});
const DEFAULT_VP = {
  mode: "book",        // "book" | "chapter"
  text: "",            // typed book text
  suggestion: "",      // autofill suffix
  bookDisplay: "",     // accepted canonical book + trailing space
  chapVerse: "",       // typed chapter/verse text (with separator while typing)
  separator: null      // '.', ':', or ' '
};

function cloneDefaultVp() {
  if (typeof structuredClone === "function") {
    return structuredClone(DEFAULT_VP);
  }
  // fallback for older browsers:
  return JSON.parse(JSON.stringify(DEFAULT_VP));
}
function resetVideoPsalmInput() {
  videoPsalmInput.value = "";
  videoPsalmInput._vp = cloneDefaultVp();
}
function resetVariables() {
  started = 0;
  times = [];
  scriptureCount = 0;
  previousTime = null;
  totalScriptures = 0;
  stopCountdown();
  resetVideoPsalmInput();
  bibleShowInput.value = "";
}
function fetchBook() {
  const books = Object.keys(scriptureData);
  return books[Math.floor(Math.random() * books.length)];
}
function fetchChapter(book) {
  const chapters = scriptureData[book];
  return Math.floor(Math.random() * chapters.length) + 1;
}
function fetchVerse(book, chapter) {
  const verseCount = scriptureData[book][chapter - 1];
  return Math.floor(Math.random() * verseCount) + 1;
}
function fetchScripture() {
  const book_f    = fetchBook();
  const chapter_f = fetchChapter(book_f);
  const verse_f   = fetchVerse(book_f, chapter_f);
  finalscripture = `${book_f} ${chapter_f}:${verse_f}`;
  document.getElementById("scripture").innerText = finalscripture;
}
fetchScripture(); //On page load, get random scripture
function startTimer() { 
  if (previousTime===null) {
    previousTime = Date.now()
  }
}
function displayHelp() {
  document.getElementById("options").style.visibility = "visible";
  document.getElementById("result").classList.add("hidden");
  main.classList.add("hidden");
  timeblock.classList.add("hidden");
  help.classList.remove("hidden");
  stopCountdown();
  document.querySelector("#help .help-content").scrollTop = 0;
}
const restartButtons = [document.getElementById("logo"),document.getElementById("restartButton"),document.getElementById("restartButton2")];
const homeButtons = [document.getElementById("homeButton"),document.getElementById("homeButton2")];

restartButtons.forEach(button=>{
  button.addEventListener("click",function(event){
    event.preventDefault();
    fetchScripture(); //Get a new scripture when page logo is clicked
    const mainApp = document.getElementById("main-app");
    document.getElementById("options").style.visibility = "visible";
    timeblock.classList.add("hidden");
    resultPage.classList.add("hidden");
    document.getElementById("main").classList.remove("hidden");
    mainApp.classList.remove("pop-in");
    void mainApp.offsetWidth;
    mainApp.classList.add("pop-in");
    //reset variables
    resetVariables();
  });
});

homeButtons.forEach(button=> {
  button.addEventListener("click",function(event) {
    event.preventDefault();
    main.classList.add("hidden");
    resultPage.classList.add("hidden");
    selection.classList.remove("hidden");
    resetVariables();
  });
});
scriptureButton.forEach(button=>{ 
  button.addEventListener("click",function(){ //At any given time, only one button settings should be active
    scriptureButton.forEach(btn=>btn.classList.remove("active"));
    this.classList.add("active");
  });
});
scriptureOption.forEach(button=>{ 
  button.addEventListener("click",function(){ //At any given time, only one button settings should be active
    scriptureOption.forEach(btn=>btn.classList.remove("active2"));
    scriptureButton.forEach(btn=>btn.classList.remove("active"));
    document.querySelector(".scriptureButton").classList.add("active");
    let selected = this.textContent;
    const option1 = document.getElementById("opt1");
    const option2 = document.getElementById("opt2");
    const customPaneTitle = document.querySelector("#popup .popup-content .popup-title");
    if (selected == "Time") {
      customPaneTitle.textContent = "Custom test duration"
      customParam.innerHTML = "Min: 10s<br>Max: 999s";
      option1.textContent = "30 Seconds";
      option2.textContent = "60 Seconds";
    }
    else {
      customPaneTitle.textContent = "Custom scripture amount";
      customParam.innerHTML = "Min: 5<br>Max: 99";
      option1.textContent = "10 Scriptures";
      option2.textContent = "20 Scriptures";
    }
    this.classList.add("active2");
  });
});
customBtn.addEventListener("click",()=>{ //Custom scripture pane popup
  popup.classList.remove("hidden");
  custInput.focus();
});
confirmHelp.addEventListener("click",()=>{
  if (selection.classList.contains("hidden")) {
    main.classList.remove("hidden");
  }
  help.classList.add("hidden");
  fetchScripture();
  resetVariables();
});
okBtn.addEventListener("click",()=>{
  const popup = document.getElementById("popup");
  let customInput = custInput.value;
  let currentSelected = document.querySelector(".active2").textContent;
  let min = (currentSelected == "Scripture count")?5:10;
  let max = (currentSelected == "Scripture count")?99:999;
  if (customInput>=min && customInput<=max) { //valid custom input, proceed to main app
    popup.classList.add("hidden");
  }
  else if (customInput>max){
    console.log("Can't be greater than "+max);
  }
  else {
    console.log("Can't be less than "+min);
  }
});
custInput.addEventListener("keydown",(e)=>{ //Only allows positive integers 
  let customInput = custInput;
  let currentSelected = document.querySelector(".active2").textContent;
  maxLength = (currentSelected=="Scripture count")?1:2;
  if (customInput.value.length > maxLength && e.key!="Backspace" && e.key!="Tab") {
    e.preventDefault();
  }
  if (e.key==="." || e.key==="-"||e.key==="e"||e.key==="E"){
    e.preventDefault()
  }
  if (e.key==="Enter" || e.key === "Escape") { //press enter to close pane
    e.preventDefault()
    okBtn.click();
  }
})
custInput.addEventListener("focus", function() { 
  setTimeout(() => {   //when pane opens, highlight the input box
   custInput.select();
  }, 0);
});
//Helper functions for changing focus to another input field
function focusNext(currentId, nextId) {
    document.getElementById(nextId).focus();
}
function focusPrev(currentId, prevId) {
    document.getElementById(prevId).focus();
}
//Helper function to check if a string starts with a number for Scriptures like 1 Samuel, to allow space key to temporarily work
function startsWithNumber(str) {
  return /^\d/.test(str);
}
function findMaxChapter() {
  const chapters = scriptureData[book.value];
  return chapters.length;
}
//EasyWorship
function makeStrictAutocomplete(input,list) { 
  let defaultValue = list[0]; //Genesis
  let typed = "";
  input.addEventListener("focus",()=>{
    typed="";
  }) //reset typed variable when input is clicked
  input.addEventListener("keydown", e => {
    const key = e.key;
    if (/^[a-zA-Z0-9 ]$/.test(key) && !e.ctrlKey) {
      if (e.key === " ") { //space bar switches to chapter field
        if (typed.length>1 || !startsWithNumber(typed[0])) {
          e.preventDefault();
          focusNext("book","chapter");
        }
        else {
          e.preventDefault();
          typed+=key;
          const match = list.find(item =>
            item.toLowerCase().startsWith(typed.toLowerCase())
          ); //check list of bible verses for input
          if (match) {
            defaultValue = match;
            input.value = match;
            // highlight the suggested part
            input.setSelectionRange(typed.length, match.length);
          } else {
            // no match → ignore this keystroke
            typed = typed.slice(0, -1);
          }
        }
      }
      else {
        if (/^[0-9]$/.test(e.key) && typed.length>=1) {
          const maxChap = findMaxChapter();
          e.preventDefault();
          const inputtedNumber = Number(e.key);
          if (inputtedNumber<=maxChap && inputtedNumber != 0) {
            focusNext("book","chapter");
            chapter.value = Number(e.key);
            setTimeout(()=>{
              chapter.setSelectionRange(chapter.value.length,chapter.value.length);
            },0); 
          }

        }
        else {
          e.preventDefault();
          typed += key;
          const match = list.find(item =>
            item.toLowerCase().startsWith(typed.toLowerCase())
          );
          if (match) {
            defaultValue = match;
            input.value = match;
            input.setSelectionRange(typed.length, match.length);
          } else {
            // ignore this keystroke
            typed = typed.slice(0, -1);
          }
        }
      }
      if (typed.length==1 && /^[a-zA-Z]$/.test(e.key) && startsWithNumber(typed[0])) {
        //This area accounts for books starting with numbers e.g 1 Samuel
        e.preventDefault();
        typed += " ";
        typed += key;
        e.preventDefault();
        const match = list.find(item =>
          item.toLowerCase().startsWith(typed.toLowerCase())
        );
        if (match) {
          defaultValue = match;
          input.value = match;
          input.setSelectionRange(typed.length, match.length);
        } else {
          // ignore this keystroke
          typed = typed.slice(0, -1);
        }
      }
    }
    else if (key === "Backspace") {
      e.preventDefault();
      if (typed.length > 0) {
        typed = typed.slice(0, -1);
        if (typed === "") {
          input.value = defaultValue;
          input.select();
        } else {
            input.setSelectionRange(typed.length, defaultValue.length);
        }
      }
      else if (input.selectionStart == input.selectionEnd) {
        if (input.selectionStart==input.value.length && typed.length == 0) {
          typed = input.value.slice(0,-1);
          input.setSelectionRange(typed.length,defaultValue.length);
        }

      }
    }
    else if (["'",";","ArrowRight",".",",","=","-"," "].includes(e.key)) { // Move focus to chapter input
      e.preventDefault();
      focusNext("book", "chapter");
    }
    else if (e.key === "ArrowLeft") { //Move focus to verse input
      e.preventDefault();
      focusPrev("book","verse");
    }
    else if (e.ctrlKey && e.key === "a") {
      typed = ""; // reset typed variable if user selects all
    }
    else if (e.key != "Tab" && !e.ctrlKey){
      e.preventDefault();
    }
  });
  input.addEventListener("paste", e => {
    e.preventDefault();
  });
  input.addEventListener("blur", () => { //When you leave focus, reset typed variable
    typed = "";
    input.value = defaultValue;
    input.setSelectionRange(0, defaultValue.length);
  });
}
makeStrictAutocomplete(book,bibleBooks);
chapter.addEventListener("keydown", function(e) {
  if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey) { //Only allow numbers
    e.preventDefault();
  }
  const isDigit = /^[0-9]$/.test(e.key);
  const start = chapter.selectionStart;
  const end = chapter.selectionEnd;
  let cur = chapter.value;
  let proposed;
  if (isDigit) {
    proposed = cur.slice(0, start) + e.key + cur.slice(end);
  }
  const num = Number(proposed);
  // const books = book.value;
  // const chapters = scriptureData[books]
  const max = findMaxChapter(); //get the maximum number of chapters for the corresponding book
  if (num > max || num == 0) { 
    //don't allow input if it's greater than the max number of chapters in the book
    e.preventDefault();
  }
  if (!/^[0-9]$/.test(e.key)) {
      // Right arrow or space (without shift) moves to "verse"
    if (["'",";","ArrowRight",".",",","=","-"," "].includes(e.key)) {
      e.preventDefault();
      focusNext("chapter", "verse");
    }
    // Left arrow moves back to "book"
    else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusPrev("chapter", "book");
    }
    else if (e.key === "Backspace") {
      e.preventDefault();
      if (chapter.selectionStart === 0 && chapter.selectionEnd === chapter.value.length) { 
        focusPrev("chapter","book");
        setTimeout(()=>{
          book.setSelectionRange(book.value.length,book.value.length);
        },0);
        return;
      }
      if (chapter.selectionStart === chapter.selectionEnd) {
          chapter.setSelectionRange(chapter.value.length - 1, chapter.value.length);
      } 
      // If something is already selected, expand the selection by one digit
      else {
          chapter.setSelectionRange(chapter.selectionStart - 1, chapter.selectionEnd);
      }
    }
    else if (e.key != "Tab" && !e.ctrlKey)  {
      e.preventDefault();
    }
  }
});
verse.addEventListener("keydown", function(e) {
  if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey) {
    e.preventDefault();
  }
  const isDigit = /^[0-9]$/.test(e.key);
  const start = verse.selectionStart;
  const end = verse.selectionEnd;
  let cur = verse.value;
  let proposed;
  if (isDigit) {
    proposed = cur.slice(0, start) + e.key + cur.slice(end);
  }
  const num = Number(proposed);
  const books = book.value;
  const chapters = Number(chapter.value);
  const max = (scriptureData[books])[chapters - 1]; //get the maximum number of verses for the corresponding book and chapter
  if (num > max || num == 0) {
    e.preventDefault();
  }
  if (!/^[0-9]$/.test(e.key)) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusPrev("verse", "chapter");
    }
    else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusNext("verse","book");
    }
    else if (e.key ===" "){
      e.preventDefault();
    }
    else if (e.key === "Backspace") {
      e.preventDefault();
      if (verse.selectionStart === 0 && verse.selectionEnd === verse.value.length) { 
        focusPrev("verse","chapter");
        setTimeout(()=>{
          chapter.setSelectionRange(chapter.value.length,chapter.value.length);
        },0);
        return;
      }
      if (verse.selectionStart === verse.selectionEnd) {
          verse.setSelectionRange(verse.value.length - 1, verse.value.length);
      }
      else {
          verse.setSelectionRange(verse.selectionStart - 1, verse.selectionEnd);
      }
   }
   else if (e.key != "Tab" && !e.ctrlKey) {
    e.preventDefault();
   }
  }
});

function ensureVp(el) {
  if (!el) return null;
  if (!el._vp) {
    el._vp = cloneDefaultVp();
  }
  return el._vp;
}
//VideoPsalm
videoPsalmInput.addEventListener("keydown", function(e){
  const input = e.target;
  // --- persistent state attached to the input element ---
  function resetInputs() {
      S.text = "";
      S.suggestion = "";
      S.bookDisplay = "";
      S.chapVerse = "";
      S.separator = null;
  }
  const S = ensureVp(input);
  function render() {
    if (S.mode === "book") {
      input.value = S.text + S.suggestion;
      // input.setSelectionRange(S.text.length, S.text.length);
    } else {
      input.value = S.bookDisplay + S.chapVerse;
      // input.setSelectionRange(input.value.length, input.value.length); //hmm
    }
  }
  function optionsFor(prefix) {
    return bibleBooks.filter(b => b.startsWith(prefix));
  }
  function computeSuggestion() {
    S.suggestion = "";
    S.bookDisplay = "";
    if (!S.text) return;
    const opts = optionsFor(S.text);
    if (opts.length === 1) {
      S.bookDisplay = opts[0] + " ";
      S.suggestion  = opts[0].slice(S.text.length)+" "; //remaining characters
    }
  }
  function acceptBookIfSingle() { //Ended up not using this function
    const opts = optionsFor(S.text);
    if (opts.length === 1) {
      S.mode        = "chapter";
      S.text        = opts[0];         // lock in canonical casing
      S.bookDisplay = opts[0] + " ";
      S.suggestion  = "";
      S.chapVerse   = "";
      S.separator   = null;
      render();
      return true;
    }
    return false;
  }
  function validNum(s) {
    if (!/^\d+$/.test(s)) return false;
    const n = parseInt(s, 10);
    return n >= 1 && n < 10000; // strictly below 10000, strictly above 0
  }
  function checkBibleBook(letter) {
    letter = letter.toUpperCase();
    return bibleBooks.some(bk=>bk.startsWith(letter));
  }
  if ("Aa".includes(e.key) && e.ctrlKey) {
    input.setSelectionRange(0,input.value.length);
    setTimeout(()=> {
      S.mode = "book";
    },0);
    return;
  }
  // BOOK MODE
  if (S.mode === "book") {
    e.preventDefault();
    let data = e.key;
    if (e.key === "Backspace") {
      if (input.selectionStart === 0 && input.selectionEnd === input.value.length) {
        resetInputs();
        input.value = "";
        S.mode = "book";
      }
      else if (S.text.length>0) {
        if (S.text.length === 2 && "123".includes(S.text[0])) {
          S.text = S.text.slice(0,-2);
        }
        else {
          S.text = S.text.slice(0,-1);
          computeSuggestion();
          render();
        }
      }
    }
    if (e.key === "Enter") {
      return;
    }
    if (input.selectionStart ===0 && input.selectionEnd === input.value.length && checkBibleBook(e.key)) {
      resetInputs();
    }
    if (S.bookDisplay.length>2 && validNum(data) && !(input.selectionStart === 0 && input.selectionEnd === input.value.length)) {
      S.mode = "chapter";
      S.chapVerse = data;
      render();
    }
    if ("123".includes(data)) {
      data += " ";
    }
    if ((S.text.startsWith("P") || S.text.startsWith("p")) && "Hh".includes(data)) {
      data += "il"; // "ph" -> "phil"
    } 
    else if ((S.text.startsWith("J") || S.text.startsWith("j")) && "Uu".includes(data)) {
      data += "d";  // "ju" -> "jud"
    }
    if (S.text.length === 0) {
      S.text += data.toUpperCase();
    }
    else if (S.text.length === 2 && S.text[S.text.length - 1] === " ") {
      S.text += data.toUpperCase();
    }
    else {
      S.text += data.toLowerCase();
    }
    const opts = optionsFor(S.text);
    if (opts.length === 1) { //still book mode
      S.bookDisplay = opts[0] + " ";
      S.suggestion  = opts[0].slice(S.text.length)+" ";
      render();
      S.mode = "chapter"
      return;
    } 
    else if (opts.length === 0) {
      // revert this keystroke
      S.text = S.text.slice(0, -data.length);
      computeSuggestion();
      render();
      return;
    } else {
      // multiple matches gives no suggestion
      S.bookDisplay = "";
      S.suggestion  = "";
      render();
      return;
    }
  }
  //CHAPTER/VERSE MODE
  if (S.mode === "chapter") {
    const isDigit = /\d/.test(e.key);
    const isSep   = (e.key === "." || e.key === ":" || e.key === " ");
    if (!(isDigit || isSep)) {
      // ignore letters in chapter mode
      e.preventDefault();
      if (e.key === "Backspace") {
        if (input.selectionStart === 0 && input.selectionEnd === input.value.length) {
          resetInputs();
          input.value = "";
          S.mode = "book";
        }
        else {
          if (S.chapVerse.length>0) {
            const last = S.chapVerse.slice(-1);
            S.chapVerse = S.chapVerse.slice(0,-1);
            if (S.chapVerse.length === 0) {
              S.mode = "book";
            }
            if (last === S.separator) S.separator = null;
            render();
          }
          else if (S.chapVerse.length === 0 ){
            S.mode = "book";
            if (S.text.length > 0) {
              if (S.text[0]==="3") {
                S.text = S.text.slice(0,-2);
              }
              else {
                S.text = S.text.slice(0,-1);
              }
              computeSuggestion();
              render();
            }
          }
        }
      }
      return;
    }
    e.preventDefault();
    if (isDigit) {
      if (S.separator === null) {
        // building chapter
        const candidate = (S.chapVerse || "") + e.key;
        if (validNum(candidate)) {
          S.chapVerse = candidate;
          render();
        }
        // else: ignore
      } else {
        // building verse
        const parts = S.chapVerse.split(S.separator);
        const vChapter = parts[0] || "";
        const verse   = (parts[1] || "") + e.key;
        if (validNum(verse)) {
          S.chapVerse = vChapter + S.separator + verse;
          render();
        }
        // else: ignore
      }
      return;
    }
    // separator handling: only if we have a valid chapter and no separator yet
    if (isSep) {
      if (S.separator !== null) return;  // already have one
      if (!/^\d+$/.test(S.chapVerse)) return; // need numeric chapter first
      if (!validNum(S.chapVerse)) return; // chapter must be 1..9999
      S.separator = e.key; // can be ".", ":", or " "
      S.chapVerse += e.key;
      render();
      return;
    }
  }
});
//bibleshow functions
bibleShowInput.addEventListener("keydown",function(e){
  //code for bibleshow
});
function calculateAverageTime() {
  let sum = times.reduce((a, b) => a + b, 0);
  let average = sum / times.length;
  return average.toFixed(3);
}
let endTime = null;
function startCountdown() {
  const now = Date.now();
  endTime = now + totalTime * 1000;
  if (!timerActive) {
    timerActive = true;
    countdown();
  }
}
function stopCountdown() {
  clearTimeout(timeoutId)
  timerActive = false
}
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  seconds = seconds < 10 && minutes!=0 ? '0' + seconds : seconds;
  if (minutes==0) {
    timerText.textContent = `${seconds}`;
  }
  else {
    timerText.textContent = `${minutes}:${seconds}`;
  }
}
function countdown() {
  updateTimerDisplay();
  let msLeft = endTime - Date.now();
  timeLeft = Math.ceil(msLeft/1000);
  if (timeLeft <= 0) {
    started = 0;
    resultText.textContent = "Number of Scriptures typed";
    averageResult.textContent = scriptureCount + " scriptures";
    testType.textContent = "Time " + totalTime;
    document.getElementById("software-type").textContent = selected;
    document.getElementById("main").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");
    stopCountdown();
    return;
  }
  timeoutId = setTimeout(countdown,200);
}
function preventMouseDown(input) {   // Prevent mousedown from altering selection.
    input.addEventListener("mousedown", function(e) {
      e.preventDefault();
      input.focus();
    });
}
function selectAllOnFocus(input) {
  input.addEventListener("focus", function() { //on focus, select all
    setTimeout(() => {
     input.select();
    }, 0);
  });
}
function replaceSecondSeparator(str) {
  str = str.trim(); // Trim input for consistency
  let bk = null;
  let ref = null;
  // Find the matching book name
  for (let b of bibleBooks) {
    // Check if the string starts with the book name followed by a space or end of string
    if (str === b || str.startsWith(b + ' ')) {
      bk = b;
      ref = str.slice(b.length).trim(); // Get the remaining reference part
      break;
    }
  }
  // If no valid book match, return unchanged
  if (!bk) {
    return str;
  }
  // Parse the reference part (chapter [sep] verse)
  const match = ref.match(/^(\d+)([ .:])?(\d+)?$/);
  if (!match) {
    return str; // Return unchanged if reference format is invalid
  }
  const [, chapt, , ver] = match;
  // If verse exists, use colon; else append :1
  return ver ? `${bk} ${chapt}:${ver}` : `${bk} ${chapt}:1`;
}
function modifyFinalInput() {
  if (selected == "EasyWorship") {
      book.focus();
      bookInput = book.value
      chapterInput = chapter.value
      verseInput = verse.value
      finalInput = bookInput+" "+chapterInput+":"+verseInput;
      return finalInput;
  }
  else if (selected == "VideoPsalm") {
    return replaceSecondSeparator(videoPsalmInput.value);
  }
  else {
    return bibleShowInput.value;
  }
}
function applyInputFeatures(input) {
  preventMouseDown(input);
  if (input.classList.contains("input-class")) {
    selectAllOnFocus(input);
  }

  // Prevent backspace if the entire text is selected or deletion would result in an empty input.
  input.addEventListener("keydown", function(e) {
    if (started==0) { // Starting the test
      document.getElementById("options").style.visibility = "hidden"; //Hide the options pane
      started = 1;
      previousTime = Date.now();
      currentOption = document.querySelector(".active2").textContent;
      currentSetting = document.querySelector(".active").textContent; //Get the total number of scriptures to type
      if (currentSetting=="10 Scriptures"){
        totalScriptures = 10;
      }
      else if (currentSetting=="20 Scriptures") {
        totalScriptures = 20;
      }
      else if (currentSetting == "Custom" && currentOption == "Scripture count"){
        totalScriptures = custInput.value;
      }
      //These are for time
      else if (currentSetting == "30 Seconds"){
        totalTime = 30;
      }
      else if (currentSetting == "60 Seconds"){
        totalTime = 60;
      }
      else if (currentSetting == "Custom" && currentOption == "Time") {
        totalTime = custInput.value;
      }
      if (currentOption == "Time") {
        timeLeft = totalTime;
        updateTimerDisplay();
        timeblock.classList.remove("hidden");
        startCountdown();
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      finalInput = modifyFinalInput(); // function to work on input based on software selected
      if (finalInput==scripture.textContent) {
        scriptureCount++;
        if (selected == "VideoPsalm") {
          resetVideoPsalmInput();
        }
        if (currentOption == "Scripture count") {
          if ((scriptureCount!=totalScriptures)) {
            fetchScripture();
          }
          if (scriptureCount<=totalScriptures) {
            let finalTime = Date.now();
            let timeTaken = (finalTime-previousTime)/1000;
            times.push(timeTaken);
            previousTime = Date.now();
          }
          if (scriptureCount==totalScriptures) {
            averageTime = calculateAverageTime();
            resultText.textContent = "Average Time";
            averageResult.textContent = averageTime + " seconds";
            testType.textContent = "Scriptures " + totalScriptures; 
            document.getElementById("software-type").textContent = selected+"";
            document.getElementById("main").classList.add("hidden");
            document.getElementById("result").classList.remove("hidden");
          }
        }
        else {
          fetchScripture();
        }
      }
      else {
        if (selected == "EasyWorship") {
          const inputFields = document.querySelectorAll(".input-class");
          inputFields.forEach(inputField=>inputField.style.borderColor = "red");
          setTimeout(() => {
            inputFields.forEach(inputField=>inputField.style.borderColor = "#013FBF");
          }, 500);
        }
        else {
          const inputBox = document.getElementById(selected.toLowerCase()+"-input");
          inputBox.style.borderColor = "red";
          setTimeout(()=> {
            inputBox.style.borderColor = "grey";
          }, 500);
        }
      }
    }
 });
} 
const inputBoxes = [...scriptureInputsEasyWorship,videoPsalmInput,bibleShowInput];
inputBoxes.forEach(scriptureInput=>applyInputFeatures(scriptureInput)); //Add input features to all of EasyWorship's input boxes