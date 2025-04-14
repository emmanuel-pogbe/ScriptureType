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

let previousTime = null
let scriptureCount = 0;
let totalScriptures = 0;
let averageResult = document.getElementById("average");
let testType = document.getElementById("custom-test-type");

async function fetchScripture() { //Get random scripture function
  let response = await fetch('/get_scripture');
  let data = await response.json();
  document.getElementById("scripture").innerText = data.message;
}
fetchScripture(); //On page load, get random scripture
function startTimer() {
  if (previousTime===null) {
    previousTime = Date.now()
  }
}
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
okBtn.addEventListener("click",()=>{
  const popup = document.getElementById("popup");
  const customInput = document.getElementById("customInput").value;
  if (customInput>0 && customInput<100) {
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
})
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
  })
  input.addEventListener("keydown", e => {
    const key = e.key;
    if (/^[a-zA-Z0-9 ]$/.test(key) && !e.ctrlKey) {
      if (e.key === " ") {
        if (typed.length>1 || !startsWithNumber(typed[0])) {
          e.preventDefault();
          focusNext("book","chapter");
        }
        else {
          e.preventDefault();
          typed+=key;
          const match = list.find(item =>
            item.toLowerCase().startsWith(typed.toLowerCase())
          );
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
    else if (e.key === "ArrowRight") {
      // Move focus to chapter input
      e.preventDefault();
      focusNext("book", "chapter");
    }
    else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusPrev("book","verse");
    }
    else if (e.key != "Tab"){
      e.preventDefault();
    }
  });
  input.addEventListener("paste", e => {
    e.preventDefault();
  });
  input.addEventListener("blur", () => {
    typed = "";
    input.value = defaultValue;
    input.setSelectionRange(0, defaultValue.length);
  });
}
makeStrictAutocomplete(book,bibleBooks);
chapter.addEventListener("keydown", function(e) {
  if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey) {
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
  const max = chapters.length;
  console.log("Chaptermax "+max);
  if (num > max) {
    e.preventDefault();
  }
  if (e.key==="." || e.key==="-"||e.key==="e"||e.key==="E"){
    e.preventDefault()
  }
  // Right arrow or space (without shift) moves to "verse"
  if (e.key === "ArrowRight" || (e.key === " " && !e.shiftKey)) {
    e.preventDefault();
    focusNext("chapter", "verse");
  }
  // Left arrow moves back to "book"
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    focusPrev("chapter", "book");
  }
  if (e.key === "Backspace") {
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
  const max = (scriptureData[books])[chapters - 1];
  console.log("Versemax "+max);
  if (num > max) {
    e.preventDefault();
  }
  if (e.key==="." || e.key==="-"||e.key==="e"||e.key==="E"||e.key===","){
    e.preventDefault()
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    focusPrev("verse", "chapter");
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    focusNext("verse","book");
  }
  if (e.key ===" "){
    e.preventDefault();
  }
  if (e.key === "Backspace") {
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
});
let started = 0;
let times = [];
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
  input.addEventListener("focus", function() {
    setTimeout(() => {
     input.select();
    }, 0);
  });
  // Prevent backspace if the entire text is selected or deletion would result in an empty input.
  input.addEventListener("keydown", function(e) {
    if (started==0) {
      document.getElementById("options").style.visibility = "hidden";
      started = 1;
      previousTime = Date.now();
      currentSetting = document.querySelector(".active").textContent;
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
scriptureInputs.forEach(scriptureInput=>applyInputFeatures(scriptureInput));