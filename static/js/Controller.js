/*
 * The Controller component handles all program specific actions, like activation
 * and deactivation of plane and axis, definition of viewpoint and transformation
 * control etc...
 * @returns {Controller}
 */
function Controller(){
    
    // IntervalID for automatically saving mode
    var saveInterval = null;

    this.lastTurntableState =  $('#turntableModeCheckbox').prop('checked');
    
    
    /*
     * Activates the specified transformation mode 
     * @param {string} mode transformation mode (translation, scale, rotation, hand)
     * @returns {Null}
     */
    this.Activate = function(mode){
       /*
        if (g_editor.HANDLING_MODE !== mode){
            g_editor.HANDLING_MODE = mode;
        }

        g_editor.getPrimitiveManager().updateTransformUIFromCurrentObject();
        */
    };

    
    /*
     * Sets the specified view point in the editor
     * @param {string} viewpoint name of the viewpoint that should be displayed
     * @returns {Null}
     */
    this.setViewpoint = function(point)
    {
        var runtime = document.getElementById("x3domCentralSceneView").runtime;
        
        switch(point) {
            case "front":
                this.disableTurntable();
                document.getElementById("orthoViewPointFront").setAttribute('fieldOfView','-7.5 -7.5 7.5 7.5');
                document.getElementById("orthoViewPointFront").setAttribute('set_bind','true');
                runtime.resetView();
                runtime.examine();
                document.getElementById("planeId").setAttribute("rotation", "1 0 0 0");
                //document.getElementById("depthMode").setAttribute("readOnly", "true");
                break;
            case "back":
                this.disableTurntable();
                document.getElementById("orthoViewPointBack").setAttribute('fieldOfView','-7.5 -7.5 7.5 7.5');
                document.getElementById("orthoViewPointBack").setAttribute('set_bind','true');
                runtime.resetView();
                runtime.examine();
                document.getElementById("planeId").setAttribute("rotation", "1 0 0 0");
                //document.getElementById("depthMode").setAttribute("readOnly", "true");
                break;
            case "right":
                this.disableTurntable();
                document.getElementById("orthoViewPointRight").setAttribute('fieldOfView','-7.5 -7.5 7.5 7.5');
                document.getElementById("orthoViewPointRight").setAttribute('set_bind','true');
                runtime.resetView();
                runtime.examine();
                document.getElementById("planeId").setAttribute("rotation", "0 1 0 " + Math.PI / 2);
                //document.getElementById("depthMode").setAttribute("readOnly", "true");
                break;
            case "left":
                this.disableTurntable();
                document.getElementById("orthoViewPointLeft").setAttribute('fieldOfView','-7.5 -7.5 7.5 7.5');
                document.getElementById("orthoViewPointLeft").setAttribute('set_bind','true');
                runtime.resetView();
                runtime.examine();
                document.getElementById("planeId").setAttribute("rotation", "0 1 0 " + Math.PI / 2);
                //document.getElementById("depthMode").setAttribute("readOnly", "true");
                break;
            case "top":
                this.disableTurntable();
                document.getElementById("orthoViewPointTop").setAttribute('fieldOfView','-7.5 -7.5 7.5 7.5');
                document.getElementById("orthoViewPointTop").setAttribute('set_bind','true');
                runtime.resetView();
                runtime.examine();
                document.getElementById("planeId").setAttribute("rotation", "1 0 0 -" + Math.PI / 2);
                //document.getElementById("depthMode").setAttribute("readOnly", "true");
                break;
            case "bottom":
                this.disableTurntable();
                document.getElementById("orthoViewPointBottom").setAttribute('fieldOfView','-7.5 -7.5 7.5 7.5');
                document.getElementById("orthoViewPointBottom").setAttribute('set_bind','true');
                runtime.resetView();
                runtime.examine();
                document.getElementById("planeId").setAttribute("rotation", "1 0 0 -" + Math.PI / 2);
                //document.getElementById("depthMode").setAttribute("readOnly", "true");
                break;
            case "free":
                this.enableTurntable();
                document.getElementById("viewPoint").setAttribute('set_bind','true');
                runtime.resetView();
                if(g_editor.getEditorConfiguration().getTurntableModeStatus())
                {
                    runtime.canvas.doc._scene.getNavigationInfo().setType("turntable");
                } else {
                    runtime.examine();
                }

                document.getElementById("planeId").setAttribute("rotation", "1 0 0 -" + Math.PI / 2);
                //document.getElementById("depthMode").setAttribute("readOnly", "false");
                break;
        }
    };


    /*
     * Helper function, taking a DOM element which represents an X3DOM shape and switching its current visibility state
     */
    this.toggleX3DOMShapeVisibility = function(shapeDOMNode)
    {
        shapeDOMNode.setAttribute("render", shapeDOMNode.getAttribute("render") == "true" ? "false" : true);
    };


    /*
     * Helper function, taking a list of X3DOM HTML element ids and switching their current visibility state
     */
    this.toggleElementsVisibility = function(elementIDs)
    {
        var i;
        var element;

        for (i = 0; i < elementIDs.length; ++i)
        {
            element = document.getElementById(elementIDs[i]);

            if (element)
            {
                this.toggleX3DOMShapeVisibility(element);
            }
        }
    };


    /*
     * Switches between turntable navigation and examine mode
     */
    this.toggleTurntableNavigation = function()
    {
        var navigationInfoElement = document.getElementById("navi");

        if (navigationInfoElement)
        {
            if (navigationInfoElement.getAttribute("type") == '"TURNTABLE" "ANY"')
            {
                navigationInfoElement.setAttribute("type", '"EXAMINE" "ANY"');
            }
            else
            {
                navigationInfoElement.setAttribute("type", '"TURNTABLE" "ANY"');
            }
        }
    };

    this.enableTurntable = function()
    {
        $('#turntableModeCheckbox').prop('checked', this.lastTurntableState);
        $('#turntableModeCheckbox').prop('disabled', false);
    }

    this.disableTurntable = function()
    {
        this.lastTurntableState =  g_editor.getEditorConfiguration().getTurntableModeStatus();
        $('#turntableModeCheckbox').prop('checked', false);
        $('#turntableModeCheckbox').prop('disabled', true);
    }


    /*
     * Disables navigation
     */
    this.disableNavigation = function()
    {
        var navigationInfoElement = document.getElementById("navi");

        if (navigationInfoElement)
        {
            navigationInfoElement.setAttribute("type", '"NONE"');
        }
    };


    /*
     * Enables navigation
     */
    this.enableNavigation = function()
    {
        var navigationInfoElement = document.getElementById("navi");

        if (navigationInfoElement)
        {
            if (g_editor.getEditorConfiguration().getTurntableModeStatus())
            {
                navigationInfoElement.setAttribute("type", '"TURNTABLE" "ANY"');
            }
            else
            {
                navigationInfoElement.setAttribute("type", '"EXAMINE" "ANY"');
            }
        }
    };


    /*
     * Toggles the auto save mode. If on the scene will be automatically saved
     * every given seconds
     * @param {number} seconds saving interval
     * @returns {Null}
     */
    this.autoSave = function(seconds){
    /*    if (ui.TBAutoSave.highlighted){
            ui.TBAutoSave.dehighlight();
            ui.TBAutoSave.setImage("../static/images/autoSave_off.png");
            clearInterval(saveInterval);
        }
        else {
            ui.TBAutoSave.highlight();
            ui.TBAutoSave.setImage("../static/images/autoSave_on.png");
            saveInterval = setInterval(saveScene, (seconds * 1000));
        }*/
    };

    
    /*
     * Saves the scene 
     * @returns {Null}
     */
    function saveScene(){
        alert("saving scene");
    }


    // this method starts dragging components
    this.dragComponent = function(event) {
        if (event.dataTransfer && event.target)
        {
            event.dataTransfer.setData("text/plain", event.target.id);
        }
    };


    // this one is for dragging primitives
    this.drag = function(event) {
        if (event.dataTransfer && event.target) {
            var name = event.target.id;
            if (name.indexOf("_") >= 0)
                name = name.substring(name.indexOf("_") + 1);

            event.dataTransfer.setData("text/plain", name);
        }
    };
}

align = function(transformableA, refPointA, transformableB, refPointB, distanceInMeters)
{
    var rad2Deg = 180.0 / Math.PI;

    var array = [];
    g_editor.getScene().globalCollect(x3dom.fields.SFMatrix4f.identity(), array);

    var transformMatA = transformableA.getTransformationMatrix();
    var transformMatB = transformableB.getTransformationMatrix();

    //are the transform matrices world transforms ?
    for(var key in array)
    {
        if(array[key].object == transformableA)
        {
            transformMatA = array[key].transform;
        }
        if(array[key].object == transformableB)
        {
            transformMatB = array[key].transform;
        }
    }

    var refPntPosA =  ReferenceSystem.vecToX3DOM(refPointA.getTranslation());
    var refPntPosB =  transformMatB.multMatrixPnt(ReferenceSystem.vecToX3DOM(refPointB.getTranslation()));

    var upVec = new x3dom.fields.SFVec3f(0,1,0);
    //transform reference point B and both reference vectors to world space
    var refPntDirA = transformMatA.multMatrixVec(refPointA.getTransformationMatrix().multMatrixVec(upVec));
    var refPntDirB = transformMatB.multMatrixVec(refPointB.getTransformationMatrix().multMatrixVec(upVec));

    //1. apply rotation
    //compute rotation matrix that aligns refPntDirA with -refPntDirB
    var rotationMatrix = x3dom.fields.Quaternion.rotateFromTo(refPntDirA, refPntDirB.negate()).toMatrix();

    //update transformation values after applying the new rotation
    var newTransformMatA = rotationMatrix.mult(transformMatA);

    var transVec     = new x3dom.fields.SFVec3f(0, 0, 0);
    var rotationQuat = new x3dom.fields.Quaternion(0, 0, 1, 0);
    var scaleVec     = new x3dom.fields.SFVec3f(1, 1, 1);
    var scaleRotQuat = new x3dom.fields.Quaternion(0, 0, 1, 0);
    newTransformMatA.getTransform(transVec, rotationQuat, scaleVec, scaleRotQuat);

    var angles = rotationQuat.toMatrix().getEulerAngles();

    //transformableA.setTranslationAsVec(transVec);
    transformableA.setScaleAsVec(ReferenceSystem.vecFromX3DOM(scaleVec));
    transformableA.setRotationAngles(angles[0]*rad2Deg, -angles[2]*rad2Deg, angles[1]*rad2Deg);

    //transform reference point A to world space, taking into account the new rotation
    var refPntPosA = newTransformMatA.multMatrixPnt(refPntPosA);


    //2. apply translation to given distance
    var translationVec = refPntPosB.subtract(refPntPosA);
    translationVec     = translationVec.add(refPntDirB.multiply(distanceInMeters));

    var translation = transVec.add(translationVec);

    transformableA.setTranslationAsVec(ReferenceSystem.pointFromX3DOM(translation));


    //update transformation gizmo's position
    if (g_editor.getGizmoController())
    {
        g_editor.getGizmoController().updateTransformationGizmo(transformableA);
    }
}
