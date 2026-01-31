export class InputController {
  static instance = null;
  static TILT_THRESHOLD = 15; // degrees
  static MAX_TILT = 45; // degrees - maximum tilt angle for full rotation

  constructor() {
    if (InputController.instance) {
      return InputController.instance;
    }

    this.keyState = {
      left: false,
      right: false
    };

    this.tiltValue = 0; // Continuous tilt value in range [-1, 1]

    this.listenersAttached = false;
    this.gyroscopeEnabled = false;
    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyUpHandler = this.handleKeyUp.bind(this);
    this.orientationHandler = this.handleOrientation.bind(this);
    // this.mouseMoveHandler = this.handleMouseMove.bind(this);

    InputController.instance = this;
  }

  attachListeners() {
    if (this.listenersAttached) return;
    // Keyboard listeners
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
    // Mouse listener
    // document.addEventListener('mousemove', this.mouseMoveHandler);
    
    // Gyroscope listener (non-iOS or already granted permission)
    this.attachGyroscopeListener();
  
    this.listenersAttached = true;
  }

  attachGyroscopeListener() {
    if (this.gyroscopeEnabled) return;
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.orientationHandler);
      this.gyroscopeEnabled = true;
    }
  }

  async requestGyroscopePermission() {
    // iOS 13+ requires explicit permission request
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          this.attachGyroscopeListener();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Gyroscope permission request failed:', error);
        return false;
      }
    }
    // Non-iOS devices don't need permission
    this.attachGyroscopeListener();
    return true;
  }

  handleOrientation(e) {
    if (e.gamma === null) return;
    
    const gamma = e.gamma || 0; // Left/right tilt: -180 to 180
    const threshold = InputController.TILT_THRESHOLD;
    const maxTilt = InputController.MAX_TILT;
    
    // Clamp gamma to [-MAX_TILT, MAX_TILT]
    const clampedGamma = Math.max(-maxTilt, Math.min(maxTilt, gamma));
    
    // Compute target tilt value
    let targetTilt = 0;
    
    if (Math.abs(clampedGamma) < threshold) {
      // Within dead zone
      targetTilt = 0;
    } else {
      // Map from [threshold, maxTilt] to [0, 1], keeping sign
      const sign = clampedGamma < 0 ? -1 : 1;
      const absGamma = Math.abs(clampedGamma);
      // Linear mapping: (absGamma - threshold) / (maxTilt - threshold)
      targetTilt = sign * ((absGamma - threshold) / (maxTilt - threshold));
    }
    
    // Apply simple smoothing (lerp) to reduce jitter
    const smoothingFactor = 0.3;
    this.tiltValue = this.tiltValue + (targetTilt - this.tiltValue) * smoothingFactor;
    
    // Clamp final value to [-1, 1]
    this.tiltValue = Math.max(-1, Math.min(1, this.tiltValue));
  }

  // handleMouseMove(e) {
  //   const halfWidth = window.innerWidth / 2;
  //   this.keyState.left = e.clientX < halfWidth;
  //   this.keyState.right = e.clientX >= halfWidth;
  // }

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
      right: this.keyState.right,
      tilt: this.tiltValue // float in [-1, 1]
    };
  }

  detachAllListeners() {
    if (!this.listenersAttached) return;
    // Keyboard listeners
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
    // Mouse listener
    // document.removeEventListener('mousemove', this.mouseMoveHandler);
    // Gyroscope listener
    if (this.gyroscopeEnabled) {
      window.removeEventListener('deviceorientation', this.orientationHandler);
      this.gyroscopeEnabled = false;
    }
    this.listenersAttached = false;
    this.keyState = { left: false, right: false };
    this.tiltValue = 0;
  }

  isGyroscopeAvailable() {
    return window.DeviceOrientationEvent !== undefined;
  }

  needsPermissionRequest() {
    return typeof DeviceOrientationEvent !== 'undefined' && 
           typeof DeviceOrientationEvent.requestPermission === 'function';
  }
}
