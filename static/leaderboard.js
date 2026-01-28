sideBarButtons = document.querySelectorAll(".side-bar-button");

sideBarButtons.forEach(button=>{ 
  button.addEventListener("click",function(){ //At any given time, only one button settings should be active
    sideBarButtons.forEach(btn=>btn.classList.remove("leaderboard-active"));
    this.classList.add("leaderboard-active");
  });
});