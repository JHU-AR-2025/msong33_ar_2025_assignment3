var createScene = async function () {

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    scene.useRightHandedSystem = true;

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -5), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    var xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
        },
        optionalFeatures: true
    });

    const fm = xr.baseExperience.featuresManager;

    let triggerComponent = null;
    let triggerObserver = null;
    let hitTestSource = null;
    let frameObserver = null;

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.2 }, scene);
    sphere.isVisible = false;
    
    const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.15, thickness: 0.05 });
    marker.isVisible = false;
    marker.rotationQuaternion = new BABYLON.Quaternion();

    xr.input.onControllerAddedObservable.add((inputSource) => {
        inputSource.onMotionControllerInitObservable.add(async (motionController) => {
            if (motionController.handedness !== "right") return;

            triggerComponent = motionController.getComponent("xr-standard-trigger");

            triggerObserver = triggerComponent.onButtonStateChangedObservable.add(() => {
                if (triggerComponent.pressed && marker.isVisible) {
                    sphere.isVisible = true;
                    sphere.position = marker.position.clone();
                }
            });

            // Reference space
            const session = xr.baseExperience.sessionManager.session;
            const refSpace = xr.baseExperience.sessionManager.referenceSpace;

            // Request hit test source from controller
            hitTestSource = await session.requestHitTestSource({
                space: inputSource.inputSource.targetRaySpace,
            });

            // XR frame loop
            frameObserver = xr.baseExperience.sessionManager.onXRFrameObservable.add((xrFrame) => {
                if (!hitTestSource) return;

                const results = xrFrame.getHitTestResults(hitTestSource);

                if (results.length > 0) {
                    const hit = results[0];
                    const babylonMatrix = BABYLON.Matrix.FromArray(hit.getPose(refSpace).transform.matrix);
                    babylonMatrix.decompose(marker.scaling, marker.rotationQuaternion, marker.position);
                    marker.isVisible = true;
                    
                } else {
                    marker.isVisible = false;
                }
            });
        });
    });

    return scene;

};