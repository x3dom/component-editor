function DragController()
{
    this._draggedObject    = null;
    this._draggingUpVec    = null;
    this._draggingRightVec = null;
    this._unsnappedDragPos = null;
}

//----------------------------------------------------------------------------------------------------------------------

DragController.prototype.startDraggingElement = function(transformableObj)
{
    /*
    this._draggedObject    = transformableObj;
    this._unsnappedDragPos = this._draggedObject.getTranslation();

    g_editor.getController().disableNavigation();

    //compute the dragging vectors in world coordinates
    //since navigation is disabled, those will not change until dragging has been finished

    //get the viewer's 3D local frame
    var x3dElem  = g_editor.getActiveView()._x3dElement;
    var vMatInv  = x3dElem.runtime.viewMatrix().inverse();
    var viewDir  = vMatInv.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 0.0, -1.0));
    this._draggingUpVec    = vMatInv.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 1.0,  0.0));
    this._draggingRightVec = viewDir.cross(this._draggingUpVec);

    //project a world unit to the screen to get its size in pixels
    var translation = ReferenceSystem.pointToX3DOM(this._unsnappedDragPos);
    var p1 = x3dElem.runtime.calcCanvasPos(translation.x, translation.y, translation.z);
    var p2 = x3dElem.runtime.calcCanvasPos(translation.x + this._draggingRightVec.x,
        translation.y + this._draggingRightVec.y,
        translation.z + this._draggingRightVec.z)
    var magnificationFactor = 1.0 / Math.abs(p1[0] - p2[0]);

    //scale up vector and right vector accordingly
    this._draggingUpVec    = this._draggingUpVec.multiply(magnificationFactor);
    this._draggingRightVec = this._draggingRightVec.multiply(magnificationFactor);
    */
}

//----------------------------------------------------------------------------------------------------------------------

DragController.prototype.dragElement = function(dx, dy)
{
    /*var translationX3DOM = ReferenceSystem.pointToX3DOM(this._unsnappedDragPos);

    var offsetUp    = this._draggingUpVec.multiply(-dy);
    var offsetRight = this._draggingRightVec.multiply(dx);

    translationX3DOM = translationX3DOM.add(offsetUp).add(offsetRight);

    this._unsnappedDragPos = ReferenceSystem.pointFromX3DOM(translationX3DOM);

    var snappedDragPos;

    //take grid snapping into account, if enabled
    if (g_editor.getEditorConfiguration().getGridSnappingStatus())
    {
        snappedDragPos = new x3dom.fields.SFVec3f(gridCellSizeInMeters * Math.ceil(this._unsnappedDragPos.x / gridCellSizeInMeters),
            gridCellSizeInMeters * Math.ceil(this._unsnappedDragPos.y / gridCellSizeInMeters),
            gridCellSizeInMeters * Math.ceil(this._unsnappedDragPos.z / gridCellSizeInMeters));
        this._draggedObject.setTranslationAsVec(snappedDragPos);
    }
    else
    {
        this._draggedObject.setTranslationAsVec(this._unsnappedDragPos);
    }

    //notify UI about new translation values
    g_editor.eventSystem.triggerEvent("selectionTransformChanged");
    */
}

//----------------------------------------------------------------------------------------------------------------------

DragController.prototype.stopDraggingElement = function()
{
    /*
    if (this._draggedObject)
    {
        this._draggedObject    = null;
        this._draggingUpVec    = null;
        this._draggingRightVec = null;
        this._unsnappedDragPos = null;

        g_editor.getController().enableNavigation();
    }
     */
}

//----------------------------------------------------------------------------------------------------------------------

DragController.prototype.isDragging = function()
{
    return (this._draggedObject != null);
}
