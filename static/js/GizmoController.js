function GizmoController()
{
    //element that should receive transformation updates from the transform gizmos, if any
    this._gizmoAffectedElement = null;

    this._currentGizmoTranslation       = new x3dom.fields.SFVec3f();
    this._currentGizmoTranslationOffset = new x3dom.fields.SFVec3f();
    this._currentGizmoRotation          = new x3dom.fields.SFMatrix4f();
    this._currentGizmoRotationOffset    = new x3dom.fields.SFMatrix4f();

    this._connectionPointLists      = [];

    this._connectionPoints = [];
    this._connectionPointLabels = [];

    //axis
    this._identifiers = g_editor._config['Identifiers'].value["Gizmos"];
    this._zAxisDisplayMode  = g_editor._config['ZAxisDisplayMode'];

    this._axesIds =
        [
            this._identifiers['xAxis'],
            this._identifiers['yAxis'],
            this._identifiers['zAxis']
        ];
    this._axesLabelIds =
        [
            this._identifiers['xAxisLabel'],
            this._identifiers['yAxisLabel'],
            this._identifiers['zAxisLabel']
        ];

    this._gridId      = this._identifiers['plane'];
    this._heightCueId = this._identifiers['heightCue'];

    //deativate height cue prototype
    this._heightCuesPrototype = document.getElementById(this._heightCueId);
    g_editor.getController().toggleX3DOMShapeVisibility(this._heightCuesPrototype);

    this._heightCuesParent = document.createElement('Transform');
    document.getElementById(this._identifiers['axes']).appendChild(this._heightCuesParent);

    this._gridX3DOMNode        = document.getElementById( this._identifiers['gridPlaneId']);
    this._gridBordersCoordNode = document.getElementById( this._identifiers["gridBordersCoordNodeId"]);

    this._axes = [];
    this._axesLabels = [];
    this._grid = null;
    this._heightCues = [];

    for(var i = 0, n = 100; i < n; ++i )
    {
        var transform = document.createElement('Transform');
        transform.setAttribute('translation','0 '+(-49+i)+' 0');

        //activate
        var newCue = this._heightCuesPrototype.cloneNode(true);

        newCue.setAttribute('render','true');
        newCue.removeAttribute('id','');
        newCue.removeAttribute('DEF','');

        //assemble
        transform.appendChild(newCue);
        this._heightCues.push(transform);
        this._heightCuesParent.appendChild(transform);
    }

    this.refreshGizmoObjects();

    var that = this;

    g_editor.eventSystem.registerCallback("selectionChanged", function() {

            //adapt transformation gizmo

            that._gizmoAffectedElement = g_editor.getSelectionController().getSelection();

            //if the selection has been cleared, hide gizmos, otherwise show them, if desired
            that.updateRotationGizmoVisibility();
            that.updateTranslationGizmoVisibility();

            if (that._gizmoAffectedElement)
            {
                that.updateTransformationGizmo();
            }

            var selection = g_editor.getSelectionController().getSelection();
            if ( selection)
            {
                that._connectionPointLists.length = 0;
                that._connectionPointLists.push(selection.getReferencePoints());
                that.recreateConnectionPointLabels();
            }
    });

    g_editor.eventSystem.registerCallback("enterFrame", function(){ that.enterFrame(); });
}

//----------------------------------------------------------------------------------------------------------------------

GizmoController.prototype.updateTranslationGizmoVisibility = function()
{
    var translationGizmoGroupDOMNode = document.getElementById(this._identifiers['translationGizmoGroup']);

    if (document.getElementById(this._identifiers['translationGizmoButton']).className ==
            this._identifiers['translationGizmoIconEnabledClass'] &&
        this._gizmoAffectedElement)
    {
        translationGizmoGroupDOMNode.setAttribute("render", "true");
    }
    else
    {
        translationGizmoGroupDOMNode.setAttribute("render", "false");
    }
};

//----------------------------------------------------------------------------------------------------------------------

GizmoController.prototype.updateRotationGizmoVisibility = function()
{
    var rotationGizmoGroupDOMNode = document.getElementById(this._identifiers['rotationGizmoGroup']);

    if (document.getElementById(this._identifiers['rotationGizmoButton']).className ==
            this._identifiers['rotationGizmoIconEnabledClass'] &&
        this._gizmoAffectedElement)
    {
        rotationGizmoGroupDOMNode.setAttribute("render", "true");
    }
    else
    {
        rotationGizmoGroupDOMNode.setAttribute("render", "false");
    }
};

//----------------------------------------------------------------------------------------------------------------------

GizmoController.prototype.processGizmoEvent = function(event)
{
    var TranslationEpsilonInMeters = 0.00001;

    //this helper function sets input translation values smaller than epsilon to zero,
    //which is necessary to achieve a correct grid snapping behavior
    var cleanupTranslationOffsetVector = function(translationVec)
    {
        return new x3dom.fields.SFVec3f(Math.abs(translationVec.x) < TranslationEpsilonInMeters ? 0 : translationVec.x,
                                        Math.abs(translationVec.y) < TranslationEpsilonInMeters ? 0 : translationVec.y,
                                        Math.abs(translationVec.z) < TranslationEpsilonInMeters ? 0 : translationVec.z);
    };

    var sensorMatrix;

    if (event.fieldName === 'translation_changed')
    {
        //convert the sensor's output from sensor coordinates to local coordinates (i.e., include its 'axisRotation')
        sensorMatrix = x3dom.fields.SFMatrix4f.parseRotation(event.target.getAttribute("axisRotation"));

        this._currentGizmoTranslationOffset = cleanupTranslationOffsetVector(
                                                sensorMatrix.multMatrixPnt(cleanupTranslationOffsetVector(event.value))
                                              );

        this.applyGizmoTransformations();
    }
    else if (event.fieldName === 'rotation_changed')
    {
        //convert the sensor's output from sensor coordinates to local coordinates (i.e., include its 'axisRotation')
        sensorMatrix = x3dom.fields.SFMatrix4f.parseRotation(event.target.getAttribute("axisRotation"));

        this._currentGizmoRotationOffset = sensorMatrix.mult(event.value.toMatrix()).mult(sensorMatrix.inverse());

        this.applyGizmoTransformations();
    }

    if (event.fieldName === 'isActive' && event.value === false)
    {
        //incorporate the current translation offset, interpreted globally, into the stored translation value
        this._currentGizmoTranslation = this._currentGizmoTranslationOffset.add(this._currentGizmoTranslation);


        //take grid snapping (in CAD system) into account, if enabled
        if (g_editor.getEditorConfiguration().getGridSnappingStatus())
        {
            this._currentGizmoTranslation = ReferenceSystem.pointFromX3DOM(this._currentGizmoTranslation);

            this._currentGizmoTranslation = new x3dom.fields.SFVec3f(
                              gridCellSizeInMeters * Math.ceil(this._currentGizmoTranslation.x / gridCellSizeInMeters),
                              gridCellSizeInMeters * Math.ceil(this._currentGizmoTranslation.y / gridCellSizeInMeters),
                              gridCellSizeInMeters * Math.ceil(this._currentGizmoTranslation.z / gridCellSizeInMeters));

            this._currentGizmoTranslation = ReferenceSystem.pointToX3DOM(this._currentGizmoTranslation);
        }

        this._currentGizmoTranslationOffset = new x3dom.fields.SFVec3f();

        //incorporate the current rotation offset, interpreted globally, into the stored rotation value
        this._currentGizmoRotation       = this._currentGizmoRotationOffset.mult(this._currentGizmoRotation);
        this._currentGizmoRotationOffset = new x3dom.fields.SFMatrix4f();

        this.applyGizmoTransformations();
    }
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * This function applies the transformations that have been computed with the help of the gizmo to the affected element,
 * also in the transformation UI (if there is any).
 * Rotation values are clamped to degrees.
 */
GizmoController.prototype.applyGizmoTransformations = function()
{
    //TODO: make this globally available
    var radToDeg = 180.0 / Math.PI;

    var objectTransformationWidget = g_editor.getObjectTransformation();
    var translation, rotationAngles, resultRotation ;


    //translation update: apply the current translation to the gizmo itself, and to the affected object
    translation = ReferenceSystem.pointFromX3DOM(this._currentGizmoTranslationOffset.add(this._currentGizmoTranslation));

    //take grid snapping (in CAD system) into account, if enabled
    if (g_editor.getEditorConfiguration().getGridSnappingStatus())
    {
        translation = new x3dom.fields.SFVec3f(gridCellSizeInMeters * Math.ceil(translation.x / gridCellSizeInMeters),
                                               gridCellSizeInMeters * Math.ceil(translation.y / gridCellSizeInMeters),
                                               gridCellSizeInMeters * Math.ceil(translation.z / gridCellSizeInMeters));
    }

    $('.' + this._identifiers['gizmoHandleTranslationClass']).attr("translation",
                                                                   ReferenceSystem.pointToX3DOM(translation).toString());
    this._gizmoAffectedElement.setTranslationAsVec(translation);


    //rotation update: apply the current rotation offset, interpreted globally
    rotationAngles = this._currentGizmoRotationOffset.mult(this._currentGizmoRotation).getEulerAngles();

    resultRotation = new x3dom.fields.SFVec3f(rotationAngles[0], rotationAngles[1], rotationAngles[2]);
    resultRotation = ReferenceSystem.vecFromX3DOM(resultRotation);
    resultRotation = resultRotation.multiply(radToDeg);

    //clamp to full degrees
    resultRotation.x = Math.ceil(resultRotation.x);
    resultRotation.y = Math.ceil(resultRotation.y);
    resultRotation.z = Math.ceil(resultRotation.z);

    this._gizmoAffectedElement.setRotationAnglesAsVec(resultRotation);


    //UI update
    if (objectTransformationWidget)
    {
        objectTransformationWidget.updateUI();
    }
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Updates the position and size of the transformation gizmos to match the selected element,
 * and puts the selected element below the corresponding transformations.
 */
GizmoController.prototype.updateTransformationGizmo = function()
{
    var rotX, rotY, rotZ;

    //TODO: make this globally available
    var degToRad = Math.PI / 180.0;

    var affectedElementPos, affectedElementRot;
    var boxVolume;
    var scaleFactor;

    if (this._gizmoAffectedElement)
    {
        //update gizmo position, synchronize stored gizmo translation value with translation of the affected element
        affectedElementPos = ReferenceSystem.pointToX3DOM(this._gizmoAffectedElement.getTranslation());

        $('.' + this._identifiers['gizmoHandleTranslationClass']).attr("translation", affectedElementPos.toString());
        this._currentGizmoTranslation = affectedElementPos;


        //synchronize stored gizmo rotation value with rotation of the affected element
        affectedElementRot = ReferenceSystem.vecToX3DOM(this._gizmoAffectedElement.getRotationAngles());

        rotX = x3dom.fields.SFMatrix4f.rotationX(degToRad * affectedElementRot.x);
        rotY = x3dom.fields.SFMatrix4f.rotationY(degToRad * affectedElementRot.y);
        rotZ = x3dom.fields.SFMatrix4f.rotationZ(degToRad * affectedElementRot.z);

        this._currentGizmoRotation = rotZ.mult(rotY).mult(rotX);


        //update gizmo handles' scale
        //TODO: here, we would need the _local_ box to compute the box volume, otherwise the volume changes on rotation
        //boxVolume = this._gizmoAffectedElement.getMatrixTransformNode()._x3domNode.getVolume();
        //boxVolume.transform(this._gizmoAffectedElement.getMatrixTransformNode()._x3domNode.getParentTransform());

        //scaleFactor = 0.1 * 1.2 * boxVolume.getDiameter();
        scaleFactor = 0.1 * 1.2 * 2.5;

        $('.' + this._identifiers['gizmoSensorGeometryScale']).attr("scale", scaleFactor + " " + scaleFactor + " " + scaleFactor);
    }
};

//----------------------------------------------------------------------------------------------------------------------

GizmoController.prototype.toggleConnectionPointLabelsVisibility = function()
{
    var labelRoot = document.getElementById(this._identifiers["connectionPointOverlays"]);

    labelRoot.style.visibility = labelRoot.style.visibility == 'visible' ? 'hidden' : 'visible';
};

//----------------------------------------------------------------------------------------------------------------------

/**
 *
 */
GizmoController.prototype.recreateConnectionPointLabels = function()
{
    //clear old labels, if any
    var labelRoot = document.getElementById(this._identifiers["connectionPointOverlays"]);
    while (labelRoot.firstChild)
    {
        labelRoot.removeChild(labelRoot.firstChild);
    }

    this._connectionPoints = [];
    this._connectionPointLabels = [];

    var key, container, connectionPointID;
    var label;
    var i;

    //update list of currently used connection points and HTML labels
    for(key in this._connectionPointLists)
    {
        container = this._connectionPointLists[key];
        for (connectionPointID in container)
        {
            label = document.createElement("div");
            label.className = label.className = container[connectionPointID].isVisible() ? "selectedObjectConnectionPointLabel" : "inactiveConnectionPointLabel";
            label.innerHTML = connectionPointID;
            this._connectionPoints.push(container[connectionPointID]);
            this._connectionPointLabels.push(label);
        }
    }

    //compute initial label positions
    this.updateConnectionPointLabelPositions();


    //finally, add label elements to the DOM
    for (i = 0; i < this._connectionPointLabels.length; ++i)
    {
        labelRoot.appendChild(this._connectionPointLabels[i]);
    }
};

//----------------------------------------------------------------------------------------------------------------------

GizmoController.prototype.getConnectionPointLabel = function(connectionPoint)
{
    for(var i = 0, n = this._connectionPoints.length; i < n; ++i)
    {
        if(this._connectionPoints[i] == connectionPoint)
        {
            return this._connectionPointLabels[i];
        }
    }
    return null;
};


//----------------------------------------------------------------------------------------------------------------------

/**
 *
 */
GizmoController.prototype.updateConnectionPointLabelPositions = function()
{
    var i;
    var label;
    var localToWorldMatrix;
    var point3DPos;
    var labelPagePos;

    var x3domRuntime = g_editor.getActiveView()._x3dElement.runtime;

    var localOffsetVec = new x3dom.fields.SFVec3f(0.0, 0.2, 0.0);

    for (i = 0; i < this._connectionPointLabels.length; ++i)
    {
        label = this._connectionPointLabels[i];

        if (this._connectionPoints[i] && this._connectionPoints[i]._matrixTransformNode
            && this._connectionPoints[i]._matrixTransformNode._x3domNode)
        {
            localToWorldMatrix = this._connectionPoints[i]._matrixTransformNode._x3domNode.getCurrentTransform();
            point3DPos = localToWorldMatrix.multMatrixPnt(localOffsetVec);

            labelPagePos = x3domRuntime.calcPagePos(point3DPos.x, point3DPos.y, point3DPos.z);

            label.setAttribute("style", "left: " + labelPagePos[0] + "px; top: " + labelPagePos[1] + "px");
        }
    }
};

//----------------------------------------------------------------------------------------------------------------------

/**
 *
 */
GizmoController.prototype.enterFrame = function()
{
    this.updateConnectionPointLabelPositions();
};

//----------------------------------------------------------------------------------------------------------------------

GizmoController.prototype.refreshGizmoObjects = function()
{
    var that = this;
    //clear axes
    this._axes.length = 0;

    //get new axis
    for(var id in this._axesIds)
        this._axes.push(document.getElementById(this._axesIds[id]));

    if(this._axes.length != 3)
        console.log("Error: Could not find (all) axes!");

    for(var id in this._axesLabelIds)
        this._axesLabels.push(document.getElementById(this._axesLabelIds[id]));

    if(this._axesLabels.length != 3)
        console.log("Error: Could not find (all) labels!");


    this._grid = document.getElementById(this._gridId);

    that.refreshHeightCues();
    g_editor.eventSystem.registerCallback("scenePropertiesChanged",function(){that.refreshHeightCues();});
};

//----------------------------------------------------------------------------------------------------------------------
/*
 * update the grid and axes
 */
GizmoController.prototype.updateGridSize = function(x, y, cellSize)
{
    gridSizeInCells.x    = x;
    gridSizeInCells.y    = y;
    gridCellSizeInMeters = cellSize;

    var cellsX;
    var cellsY;
    var sizeX;
    var sizeY;
    var sizeX_half;
    var sizeY_half;
    var coordStr;

    if (this._gridX3DOMNode)
    {
        cellsX = Math.ceil(x);
        cellsY = Math.ceil(y);

        sizeX = cellsX * cellSize;
        sizeY = cellsY * cellSize;

        this._gridX3DOMNode.setAttribute("subdivision",  cellsX + " " + cellsY);
        this._gridX3DOMNode.setAttribute("size", sizeX + " " + sizeY);
    }

    if (this._gridBordersCoordNode)
    {
        sizeX_half = sizeX * 0.5;
        sizeY_half = sizeY * 0.5;

        coordStr  = (-sizeX_half) + " " + (-sizeY_half) + " 0,";
        coordStr += (-sizeX_half) + " " + ( sizeY_half) + " 0,";
        coordStr += ( sizeX_half) + " " + ( sizeY_half) + " 0,";
        coordStr += ( sizeX_half) + " " + (-sizeY_half) + " 0";

        this._gridBordersCoordNode.setAttribute("point", coordStr);
    }

    this.adjustAxesLength(sizeX_half, sizeY_half);
    g_editor.eventSystem.triggerEvent("scenePropertiesChanged");

};

//----------------------------------------------------------------------------------------------------------------------

/*
 * adjust the length of the main coordinate axes
 *
 */
GizmoController.prototype.adjustAxesLength = function(sizeX, sizeZ)
{
    $(this._axes[0]).find("IndexedLineSet").find("Coordinate").attr('point', '-'+sizeX+' 0.0005 0, '+sizeX+' 0.0005 0');
    $(this._axes[1]).find("IndexedLineSet").find("Coordinate").attr('point', '0 0.0005 -'+sizeZ+', 0 0.0005 '+sizeZ);

    var length = this._zAxisDisplayMode.length;

    switch (this._zAxisDisplayMode.value)
    {
        case "NONE":
            $(this._axes[2]).find("IndexedLineSet").find("Coordinate").attr('point', '0 0 0, 0 0 0');
            break;
        case "POSITIVE_ONLY":
            $(this._axes[2]).find("IndexedLineSet").find("Coordinate").attr('point', '0 0 0, 0 '+length+' 0 ');
            break;
        case "NEGATIVE_ONLY":
            $(this._axes[2]).find("IndexedLineSet").find("Coordinate").attr('point', '0 -'+length+' 0, 0 0 0');
            break;
        case "FULL":
        default:
            $(this._axes[2]).find("IndexedLineSet").find("Coordinate").attr('point', '0 -'+length+' 0, 0 '+length+' 0');
    }
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Toggles the visibility of the coordinate axes' labels
 * @returns (undefined)
 */
GizmoController.prototype.toggleAxisLabelsVisibility = function()
{
    for(var key in this._axesLabels)
        g_editor.getController().toggleX3DOMShapeVisibility(this._axesLabels[key]);

};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Show or hide the grid
 */
GizmoController.prototype.toggleGridVisibility = function()
{
    g_editor.getController().toggleX3DOMShapeVisibility(this._grid);
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Toggles the visibility of the coordinate axes
 * @returns (undefined)
 */
GizmoController.prototype.toggleAxesVisibility = function()
{
    for(var key in this._axes)
    {
        g_editor.getController().toggleX3DOMShapeVisibility(this._axes[key]);
    }

    for(var key in this._heightCues)
    {
        g_editor.getController().toggleX3DOMShapeVisibility(this._heightCues[key]);
    }
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * refresh scale of height cues
 */
GizmoController.prototype.refreshHeightCues = function()
{
    this._heightCuesParent.setAttribute('scale', gridCellSizeInMeters+" "+gridCellSizeInMeters+" "+gridCellSizeInMeters );
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Show or hide height cues
 */
GizmoController.prototype.toggleHeightCueVisibility = function()
{
    g_editor.getController().toggleX3DOMShapeVisibility(this._heightCuesParent);
};

//----------------------------------------------------------------------------------------------------------------------

GizmoController.prototype.getConnectionPointLists = function()
{
    return this._connectionPointLists;
};

//----------------------------------------------------------------------------------------------------------------------

GizmoController.prototype.clearConnectionPointLists = function()
{
    this._connectionPointLists.length = 0;
};
