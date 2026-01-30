export class UIView {
  constructor() {
    this.winsHeader = document.querySelector("#numberOfWins");
    this.modal = document.querySelector("#myModal");
    this.header = document.querySelector("header");
    this.playAgainBtn = document.querySelector("#yesBTN");
    this.leaveBtn = document.querySelector("#leaveBTN");
  }

  updateWinCounter(wins) {
    this.winsHeader.innerHTML = `Wins: ${wins}`;
  }

  showModal() {
    this.modal.style.display = "block";
  }

  hideModal() {
    this.modal.style.display = "none";
  }

  adjustLayoutForDifficulty(isCustomMode) {
    if (isCustomMode) {
      this.header.style.marginBottom = "224px";
    } else {
      this.header.style.marginBottom = "500px";
    }
  }

  attachModalClickOutside(callback) {
    window.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        callback();
      }
    });
  }

  attachPlayAgainListener(callback) {
    this.playAgainBtn.addEventListener("click", callback);
  }

  attachLeaveListener(callback) {
    this.leaveBtn.addEventListener("click", callback);
  }
}
