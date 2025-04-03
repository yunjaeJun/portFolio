document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("background-video");
  const muteButton = document.getElementById("mute-button");
  const unmuteButton = document.getElementById("unmute-button");

  muteButton.addEventListener("click", function () {
    video.muted = false;
    muteButton.style.display = "none";
    unmuteButton.style.display = "block";
  });

  unmuteButton.addEventListener("click", function () {
    video.muted = true;
    unmuteButton.style.display = "none";
    muteButton.style.display = "block";
  });
});
