const scriptureButton = document.querySelectorAll(".scriptureButton");
const customBtn = document.getElementById("custom");
const okBtn = document.getElementById("okBtn");
const book = document.getElementById("book");
const chapter = document.getElementById("chapter");
const verse = document.getElementById("verse");
const scriptureInputs = document.querySelectorAll(".input-class");
const scripture = document.getElementById("scripture");
const scriptureData = JSON.parse(document.getElementById("scripture-data").textContent);
const bibleBooks = JSON.parse(document.getElementById("bible-books").textContent);
const help = document.getElementById("help");
const main = document.getElementById("main");
const confirmHelp = document.getElementById("confirm-help");

let started = 0;
let times = [];
let previousTime = null
let scriptureCount = 0;
let totalScriptures = 0;
let averageResult = document.getElementById("average");
let testType = document.getElementById("custom-test-type");

function resetVariables() {
  started = 0;
  times = [];
  scriptureCount = 0;
  previousTime = null;
  totalScriptures = 0;
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
  help.classList.remove("hidden");
}
document.getElementById("logo").addEventListener("click",function(event){
  event.preventDefault();
  fetchScripture(); //Get a new scripture when page logo is clicked
  const mainApp = document.getElementById("main-app");
  const resultPage = document.getElementById("result");
  document.getElementById("options").style.visibility = "visible";
  resultPage.classList.add("hidden");
  document.getElementById("main").classList.remove("hidden");
  mainApp.classList.remove("pop-in");
  void mainApp.offsetWidth;
  mainApp.classList.add("pop-in");
  //reset variables
  resetVariables();
});
scriptureButton.forEach(button=>{ 
  button.addEventListener("click",function(){ //At any given time, only one button settings should be active
    scriptureButton.forEach(btn=>btn.classList.remove("active"));
    this.classList.add("active");
  });
});
customBtn.addEventListener("click",()=>{ //Custom scripture pane popup
  popup.classList.remove("hidden");
  document.getElementById("customInput").focus();
});
confirmHelp.addEventListener("click",()=>{
  main.classList.remove("hidden");
  help.classList.add("hidden");
  fetchScripture();
  resetVariables();
});
okBtn.addEventListener("click",()=>{
  const popup = document.getElementById("popup");
  const customInput = document.getElementById("customInput").value;
  if (customInput>0 && customInput<100) { //valid custom input, proceed to main app
    popup.classList.add("hidden");
  }
  else if (customInput>100){
    //should add a tip popup later
    console.log("Can't be greater than 100");
  }
  else {
    //should add a tip popup later
    console.log("Can't be less than 1")
  }
});
document.getElementById("customInput").addEventListener("keydown",(e)=>{ //Only allows positive integers 
  const customInput = document.getElementById("customInput");
  if (customInput.value.length > 1 && e.key!="Backspace" && e.key!="Tab") {
    e.preventDefault();
  }
  if (e.key==="." || e.key==="-"||e.key==="e"||e.key==="E"){
    e.preventDefault()
  }
  if (e.key==="Enter") { //press enter to close pane
    e.preventDefault()
    okBtn.click();
  }
})
document.getElementById("customInput").addEventListener("focus", function() { 
  setTimeout(() => {   //when pane opens, highlight the input box
   document.getElementById("customInput").select();
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
    }
    else if (e.key === "ArrowRight") { // Move focus to chapter input
      e.preventDefault();
      focusNext("book", "chapter");
    }
    else if (e.key === "ArrowLeft") { //Move focus to verse input
      e.preventDefault();
      focusPrev("book","verse");
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
  const books = book.value;
  const chapters = scriptureData[books]
  const max = chapters.length; //get the maximum number of chapters for the corresponding book
  console.log("Chaptermax "+max);
  if (num > max) { 
    //don't allow input if it's greater than the max number of chapters in the book
    e.preventDefault();
  }
  if (!/^[0-9]$/.test(e.key)) {
      // Right arrow or space (without shift) moves to "verse"
    if (e.key === "ArrowRight" || (e.key === " " && !e.shiftKey)) {
      e.preventDefault();
      focusNext("chapter", "verse");
    }
    // Left arrow moves back to "book"
    else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusPrev("chapter", "book");
    }
    else if (e.key === "Backspace") {
      if (chapter.selectionStart === 0 && chapter.selectionEnd === chapter.value.length) {
        e.preventDefault();
        return;
      }
      if (chapter.value.length === 1) {
        e.preventDefault();
        chapter.select();
        return;
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
  console.log("Versemax "+max);
  if (num > max) {
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
      if (verse.selectionStart === 0 && verse.selectionEnd === verse.value.length) {
        e.preventDefault();
        return;
      }
      if (verse.value.length === 1) {
        e.preventDefault();
        verse.select();
        return;
      }
   }
   else if (e.key != "Tab" && !e.ctrlKey) {
    e.preventDefault();
   }
  }
});
function calculateAverageTime() {
  let sum = times.reduce((a, b) => a + b, 0);
  let average = sum / times.length;
  return average.toFixed(3);
}
function applyInputFeatures(input) {
  // Prevent mousedown from altering selection.
  input.addEventListener("mousedown", function(e) {
    e.preventDefault();
    input.focus();
  });
  input.addEventListener("focus", function() { //on focus, select all
    setTimeout(() => {
     input.select();
    }, 0);
  });
  // Prevent backspace if the entire text is selected or deletion would result in an empty input.
  input.addEventListener("keydown", function(e) {
    if (started==0) { // Starting the test
      document.getElementById("options").style.visibility = "hidden"; //Hide the options pane
      started = 1;
      previousTime = Date.now();
      currentSetting = document.querySelector(".active").textContent; //Get the total number of scriptures to type
      if (currentSetting=="10 Scriptures"){
        totalScriptures = 10;
      }
      else if (currentSetting=="20 Scriptures") {
        totalScriptures = 20;
      }
      else {
        totalScriptures = document.getElementById("customInput").value;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      book.focus();
      bookInput = book.value
      chapterInput = chapter.value
      verseInput = verse.value
      finalInput = bookInput+" "+chapterInput+":"+verseInput;
      if (finalInput==scripture.textContent) {
        scriptureCount++;
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
          averageResult.textContent = averageTime + " seconds";
          testType.textContent = "Scriptures " + totalScriptures; 
          document.getElementById("main").classList.add("hidden");
          document.getElementById("result").classList.remove("hidden");
        }
      }
    }
 });
}
scriptureInputs.forEach(scriptureInput=>applyInputFeatures(scriptureInput)); //Add input features to all input boxes