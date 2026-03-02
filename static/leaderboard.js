sideBarButtons = document.querySelectorAll(".side-bar-button");

sideBarButtons.forEach(button => {
  button.addEventListener("click", function () { //At any given time, only one button settings should be active
    sideBarButtons.forEach(btn => btn.classList.remove("leaderboard-active"));
    this.classList.add("leaderboard-active");
    active_btn = this.textContent;
    document.getElementById("table-body").classList.add("hidden");
    fetch("/leaderboards?partial=true&type=" + encodeURIComponent(active_btn), {
      method: "GET"
    })
      .then(response => response.text())
      .then(html => {
        const container = document.getElementById("leaderboard-container");
        container.innerHTML = html;
        document.getElementById("table-body").classList.remove("hidden");
      });
  });

});