/**
 * Auto-Rotate Controller for PlayCanvas Model Viewer
 *
 * Features:
 * - Y-axis auto-rotation using OrbitCamera yaw manipulation
 * - User input detection (mouse/touch)
 * - Idle timer for auto-resume
 * - postMessage API for external control
 *
 * Based on: https://playcanvas.com/project/561263 (Auto-Rotate Orbit Camera)
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        SEARCH_ATTEMPTS: 100,           // Try for 10 seconds
        SEARCH_INTERVAL: 100,           // ms between attempts
        DEFAULT_SPEED: 15,              // degrees per second
        IDLE_TIMEOUT: 2000,             // ms until auto-rotate resumes
    };

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const autoRotateParam = urlParams.get('autoRotate');
    const disableInputParam = urlParams.get('disableInput');

    // State
    let viewer = null;
    let orbitCamera = null;
    let app = null;
    let autoRotate = false;
    let rotationSpeed = CONFIG.DEFAULT_SPEED;
    let userInteracting = false;
    let idleTimer = null;
    let updateCallback = null;

    /**
     * Find OrbitCamera in PlayCanvas Model Viewer
     */
    function findOrbitCamera() {
        console.log('[AutoRotate] Searching for OrbitCamera...');

        // Check if window.viewer exists
        if (!window.viewer) {
            return false;
        }

        viewer = window.viewer;

        // Method 1: Check viewer.cameraControls (PlayCanvas Model Viewer v5.6.3+)
        if (viewer.cameraControls && viewer.cameraControls._pose) {
            orbitCamera = viewer.cameraControls;
            app = viewer.app;
            console.log('[AutoRotate] ✅ Found at: viewer.cameraControls');
            logOrbitInfo();
            return true;
        }

        // Method 2: Check viewer.camera.script.orbitCamera
        if (viewer.camera?.script?.orbitCamera) {
            orbitCamera = viewer.camera.script.orbitCamera;
            app = viewer.app;
            console.log('[AutoRotate] ✅ Found at: viewer.camera.script.orbitCamera');
            logOrbitInfo();
            return true;
        }

        // Method 3: Check viewer.orbitCamera directly
        if (viewer.orbitCamera) {
            orbitCamera = viewer.orbitCamera;
            app = viewer.app;
            console.log('[AutoRotate] ✅ Found at: viewer.orbitCamera');
            logOrbitInfo();
            return true;
        }

        // Method 4: Search for objects with yaw/pitch/distance properties
        for (const key in viewer) {
            const obj = viewer[key];
            if (obj && typeof obj === 'object') {
                if (('yaw' in obj || 'pitch' in obj) && 'distance' in obj) {
                    orbitCamera = obj;
                    app = viewer.app;
                    console.log(`[AutoRotate] ✅ Found at: viewer.${key}`);
                    logOrbitInfo();
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Log OrbitCamera info for debugging
     */
    function logOrbitInfo() {
        if (!orbitCamera) return;

        console.log('[AutoRotate] OrbitCamera properties:');

        // Check for _orbitController._targetRootPose (PlayCanvas Model Viewer v5.6.3+)
        if (orbitCamera._orbitController && orbitCamera._orbitController._targetRootPose) {
            const targetPose = orbitCamera._orbitController._targetRootPose;
            console.log('  Structure: cameraControls._orbitController._targetRootPose');
            console.log('  yaw (targetPose.angles.y):', targetPose.angles.y);
            console.log('  pitch (targetPose.angles.x):', targetPose.angles.x);
            console.log('  distance:', targetPose.distance);
        }
        // Check for cameraControls._pose structure
        else if (orbitCamera._pose) {
            console.log('  Structure: cameraControls._pose');
            console.log('  yaw (angles.y):', orbitCamera._pose.angles.y);
            console.log('  pitch (angles.x):', orbitCamera._pose.angles.x);
            console.log('  distance:', orbitCamera._pose.distance);
        } else {
            // Legacy structure
            console.log('  Structure: legacy orbitCamera');
            console.log('  yaw:', orbitCamera.yaw);
            console.log('  pitch:', orbitCamera.pitch);
            console.log('  distance:', orbitCamera.distance);
        }

        console.log('  App found:', !!app);
    }

    /**
     * Start auto-rotation
     */
    function startAutoRotate(speed) {
        if (!orbitCamera || !app) {
            console.error('[AutoRotate] Cannot start: OrbitCamera or app not found');
            return false;
        }

        if (autoRotate) {
            console.log('[AutoRotate] Already running');
            return false;
        }

        if (speed !== undefined) {
            rotationSpeed = speed;
        }

        autoRotate = true;

        // Create update callback
        updateCallback = function(dt) {
            if (autoRotate && !userInteracting && orbitCamera) {
                // Check for cameraControls with _orbitController (PlayCanvas Model Viewer v5.6.3+)
                if (orbitCamera._orbitController && orbitCamera._orbitController._targetRootPose) {
                    // KEY: Modify _targetRootPose, not _pose!
                    // _targetRootPose is the target, _pose lerps to it automatically
                    const targetPose = orbitCamera._orbitController._targetRootPose;

                    if (targetPose.angles) {
                        // Increase yaw (angles.y) by speed degrees per second
                        targetPose.angles.y += rotationSpeed * dt;

                        // Wrap around 360 degrees
                        while (targetPose.angles.y >= 360) {
                            targetPose.angles.y -= 360;
                        }
                        while (targetPose.angles.y < 0) {
                            targetPose.angles.y += 360;
                        }
                    }
                }
                // Fallback: Check for direct _pose structure
                else if (orbitCamera._pose) {
                    // Increase yaw (angles.y) by speed degrees per second
                    orbitCamera._pose.angles.y += rotationSpeed * dt;

                    // Wrap around 360 degrees
                    if (orbitCamera._pose.angles.y >= 360) {
                        orbitCamera._pose.angles.y -= 360;
                    } else if (orbitCamera._pose.angles.y < 0) {
                        orbitCamera._pose.angles.y += 360;
                    }

                    // Update camera controls to apply changes
                    if (typeof orbitCamera.update === 'function') {
                        orbitCamera.update(dt);
                    }
                }
                // Legacy structure
                else {
                    orbitCamera.yaw += rotationSpeed * dt;

                    // Wrap around 360 degrees
                    if (orbitCamera.yaw >= 360) {
                        orbitCamera.yaw -= 360;
                    } else if (orbitCamera.yaw < 0) {
                        orbitCamera.yaw += 360;
                    }
                }
            }
        };

        // Register with PlayCanvas app update loop
        app.on('update', updateCallback);

        console.log(`[AutoRotate] ✅ Started! Speed: ${rotationSpeed} deg/sec`);
        return true;
    }

    /**
     * Stop auto-rotation
     */
    function stopAutoRotate() {
        if (!autoRotate) {
            console.log('[AutoRotate] Not running');
            return false;
        }

        autoRotate = false;

        // Unregister update callback
        if (app && updateCallback) {
            app.off('update', updateCallback);
            updateCallback = null;
        }

        console.log('[AutoRotate] ⏹️ Stopped');
        return true;
    }

    /**
     * Handle user input start (mouse down / touch start)
     */
    function handleInputStart(event) {
        // If input is disabled via URL parameter, prevent all interaction
        if (disableInputParam === 'true') {
            event.preventDefault();
            event.stopPropagation();
            console.log('[AutoRotate] 🚫 Input disabled (thumbnail mode)');
            return false;
        }

        if (!autoRotate) return;

        userInteracting = true;

        // Clear existing idle timer
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }

        console.log('[AutoRotate] 👆 User interaction - pausing');
    }

    /**
     * Handle user input end (mouse up / touch end)
     */
    function handleInputEnd(event) {
        // If input is disabled, block everything
        if (disableInputParam === 'true') {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }

        if (!autoRotate || !userInteracting) return;

        // Set idle timer to resume after timeout
        idleTimer = setTimeout(() => {
            userInteracting = false;
            idleTimer = null;
            console.log('[AutoRotate] ⏱️ Idle timeout - resuming');
        }, CONFIG.IDLE_TIMEOUT);
    }

    /**
     * Setup input listeners for user interaction detection
     */
    function setupInputListeners() {
        if (!app) return;

        // Mouse events
        if (app.mouse) {
            app.mouse.on('mousedown', handleInputStart);
            app.mouse.on('mouseup', handleInputEnd);
            console.log('[AutoRotate] ✅ Mouse listeners registered');
        }

        // Touch events
        if (app.touch) {
            app.touch.on('touchstart', handleInputStart);
            app.touch.on('touchend', handleInputEnd);
            console.log('[AutoRotate] ✅ Touch listeners registered');
        }
    }

    /**
     * Setup postMessage listener for external control
     */
    function setupMessageListener() {
        window.addEventListener('message', function(event) {
            const message = event.data;

            if (!message || typeof message !== 'object') {
                return;
            }

            switch (message.action) {
                case 'startAutoRotate':
                    const speed = message.speed || CONFIG.DEFAULT_SPEED;
                    const success = startAutoRotate(speed);
                    console.log(`[AutoRotate] postMessage: startAutoRotate(${speed}) -> ${success}`);
                    break;

                case 'stopAutoRotate':
                    stopAutoRotate();
                    console.log('[AutoRotate] postMessage: stopAutoRotate()');
                    break;

                case 'setSpeed':
                    if (message.speed !== undefined) {
                        rotationSpeed = message.speed;
                        console.log(`[AutoRotate] postMessage: setSpeed(${message.speed})`);
                    }
                    break;

                default:
                    // Ignore unknown messages
                    break;
            }
        });

        console.log('[AutoRotate] ✅ postMessage listener registered');
    }

    /**
     * Initialize auto-rotate controller
     */
    function initialize() {
        let attempts = 0;

        const searchInterval = setInterval(() => {
            attempts++;

            if (findOrbitCamera()) {
                clearInterval(searchInterval);

                // Setup listeners
                setupInputListeners();
                setupMessageListener();

                // Expose global API for debugging
                window.autoRotate = {
                    start: (speed) => startAutoRotate(speed),
                    stop: () => stopAutoRotate(),
                    setSpeed: (speed) => { rotationSpeed = speed; },
                    getState: () => {
                        let yaw, pitch, distance;

                        // Get values from _targetRootPose if available
                        if (orbitCamera?._orbitController?._targetRootPose) {
                            const targetPose = orbitCamera._orbitController._targetRootPose;
                            yaw = targetPose.angles?.y;
                            pitch = targetPose.angles?.x;
                            distance = targetPose.distance;
                        } else if (orbitCamera?._pose) {
                            yaw = orbitCamera._pose.angles.y;
                            pitch = orbitCamera._pose.angles.x;
                            distance = orbitCamera._pose.distance;
                        } else {
                            yaw = orbitCamera?.yaw;
                            pitch = orbitCamera?.pitch;
                            distance = orbitCamera?.distance;
                        }

                        return {
                            active: autoRotate,
                            userInteracting,
                            speed: rotationSpeed,
                            yaw,
                            pitch,
                            distance
                        };
                    },
                    orbitCamera: () => orbitCamera,
                    app: () => app
                };

                // Notify parent window
                window.parent.postMessage({
                    type: 'autoRotateReady',
                    success: true
                }, '*');

                console.log('[AutoRotate] ✅ Initialized successfully!');
                console.log('[AutoRotate] Available at: window.autoRotate');

                // Disable input if requested (for thumbnails)
                if (disableInputParam === 'true') {
                    const canvas = viewer.canvas;
                    if (canvas) {
                        // Disable mouse/touch
                        canvas.style.pointerEvents = 'none';
                        canvas.style.userSelect = 'none';
                        canvas.style.touchAction = 'none';

                        // Disable keyboard input
                        const blockKeyboard = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        };

                        window.addEventListener('keydown', blockKeyboard, true);
                        window.addEventListener('keyup', blockKeyboard, true);
                        window.addEventListener('keypress', blockKeyboard, true);

                        // Also disable PlayCanvas keyboard events if available
                        if (app.keyboard) {
                            app.keyboard.detach();
                            console.log('[AutoRotate] 🔒 Keyboard detached');
                        }

                        console.log('[AutoRotate] 🔒 All input disabled (mouse/touch/keyboard)');
                    }
                }

                // Auto-start rotation if URL parameter is set
                if (autoRotateParam) {
                    const speed = parseFloat(autoRotateParam);
                    if (!isNaN(speed) && speed > 0) {
                        setTimeout(() => {
                            startAutoRotate(speed);
                            console.log(`[AutoRotate] 🚀 Auto-started from URL parameter: ${speed}°/s`);
                        }, 500); // Small delay to ensure everything is ready
                    }
                }

            } else if (attempts >= CONFIG.SEARCH_ATTEMPTS) {
                clearInterval(searchInterval);

                console.error(`[AutoRotate] ❌ Failed to find OrbitCamera after ${attempts} attempts`);
                console.log('[AutoRotate] Available window.viewer keys:', Object.keys(window.viewer || {}));

                // Notify parent window of failure
                window.parent.postMessage({
                    type: 'autoRotateReady',
                    success: false
                }, '*');
            }
        }, CONFIG.SEARCH_INTERVAL);
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM already loaded, wait a bit for viewer to initialize
        setTimeout(initialize, 1000);
    }

    // Also try on window load as fallback
    window.addEventListener('load', function() {
        if (!orbitCamera) {
            setTimeout(() => {
                if (!orbitCamera) {
                    initialize();
                }
            }, 500);
        }
    });

})();
