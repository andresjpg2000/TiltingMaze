export class InputController {
  static instance = null;

  constructor() {
    if (InputController.instance) {
      return InputController.instance;
    }

    this.keyState = {
      left: false,
      right: false
    };

    this.listenersAttached = false;
    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyUpHandler = this.handleKeyUp.bind(this);

    InputController.instance = this;
  }

  attachKeyboardListeners() {
    if (this.listenersAttached) return;

    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
    this.listenersAttached = true;
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        this.keyState.left = true;
        break;
      case 'ArrowRight':
      case 'd':
        this.keyState.right = true;
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        this.keyState.left = false;
        break;
      case 'ArrowRight':
      case 'd':
        this.keyState.right = false;
        break;
    }
  }

  getCurrentRotationInput() {
    return {
      left: this.keyState.left,
      right: this.keyState.right
    };
  }

  detachAllListeners() {
    if (!this.listenersAttached) return;

    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
    this.listenersAttached = false;
    this.keyState = { left: false, right: false };
  }
}
