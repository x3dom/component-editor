var  SHIFT_KEY = 16;
var  DEL_KEY   = 46;

//key state map, containing true if a key is down, otherwise either undefined or false
g_keyPressed = {};

//----------------------------------------------------------------------------------------------------------------------

document.addEventListener('keyup',
    function (e)
    {
        e = e || window.event;
        g_keyPressed[e.keyCode] = false;
    },
true);

//----------------------------------------------------------------------------------------------------------------------

document.addEventListener('keydown',
    function (e)
    {
        e = e || window.event;

        var selection;

        g_keyPressed[e.keyCode] = true;
        //console.log("RECORDED KEY PRESS FOR " + e.keyCode);

        if (g_keyPressed[DEL_KEY])
        {
            if (selection = g_editor.getSelectionController().getSelection())
            {
                g_editor.getScene().removeSceneObject(selection);
            }
        }
    },
true);

//----------------------------------------------------------------------------------------------------------------------

/*
document.addEventListener('blur',
    function(e)
    {
        g_keyPressed = {};
    },
true);
*/

//----------------------------------------------------------------------------------------------------------------------


function EditorView(x3dTag)
{
    this._x3dElement = document.getElementById(x3dTag);

    this._x3dElement.runtime.enterFrame = function()
    {
        g_editor.eventSystem.triggerEvent("enterFrame");
    }


    this._name = "";

    this._lastMouseX = -1;
    this._lastMouseY = -1;

}

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.getName = function()
{
    return this._name;
}

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.setName = function(name)
{
    this._name = name;
}

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.elementClicked = function(element)
{
    var selectionController = g_editor.getSelectionController();

    if(!element)
    {
        selectionController.clearSelection();
        g_editor.getDragController().stopDraggingElement();
    }
    else
    {
        if(selectionController.getSelection() == element)
        {
            g_editor.getDragController().startDraggingElement(element);
        }

        if (g_keyPressed[SHIFT_KEY])
        {
            if ( selectionController.getSelection().contains(element))
            {
                selectionController.removeFromSelection(element);
            }
            else
            {
                selectionController.addToSelection(element);
            }
        }
        else
        {
            selectionController.replaceSelection(element);
        }
    }

    g_editor.eventSystem.triggerEvent("selectionChanged");
}

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.mousePressed = function(event)
{
    //don't start dragging here - this is done by the "onmousedown" / "onclick" callback of the corresponding object,
    //which triggers the "elementClicked" function
}

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.mouseReleased = function(event)
{
    g_editor.getDragController().stopDraggingElement();
}

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.mouseMoved = function(event)
{
    //offsetX / offsetY polyfill for FF
    var target = event.target || event.srcElement;
    var rect = target.getBoundingClientRect();
    event.offsetX = event.clientX - rect.left;
    event.offsetY = event.clientY - rect.top;

    if (this._lastMouseX === -1)
    {
        this._lastMouseX = event.offsetX;
    }
    if (this._lastMouseY === -1)
    {
        this._lastMouseY = event.offsetY;
    }

    //are we dragging an object around?
    if ( g_editor.getDragController().isDragging())
    {
        g_editor.getDragController().dragElement(event.offsetX - this._lastMouseX, event.offsetY - this._lastMouseY);
    }
    //if not, we're potentially navigating around
    else
    {
        //update dynamic grid cell size, if necessary
        if (g_editor.getSceneProperties && g_editor.getSceneProperties().useAutomaticGridConfiguration())
        {
            //TODO: this code actually belongs to the desired new "Scene" class (or sth. similar to that)
            (function()
            {
                var computedCellSize; //in meters


                //compute dynamic grid resolution
                var vMatInv  = this._x3dElement.runtime.viewMatrix().inverse();
                var viewPos  = vMatInv.multMatrixPnt(new x3dom.fields.SFVec3f(0.0, 0.0,  0.0));
                var viewDir  = vMatInv.multMatrixVec(new x3dom.fields.SFVec3f(0.0, 0.0, -1.0));

                //estimate cell size by distance to ground plane along view direction
                //(everything computed in X3DOM coordinates)
                computedCellSize = (-viewPos.y / viewDir.y) / 25;

                //cluster cell sizes into power-of-two categories
                computedCellSize = Math.pow(2, Math.floor(Math.log(computedCellSize) / Math.log(2)));


                //check if the grid resolution would change - if yes, trigger a re-generation of the grid
                if (computedCellSize != gridCellSizeInMeters)
                {
                    g_editor.adjustSceneSize((gridSizeInCells.x * gridCellSizeInMeters) / computedCellSize,
                        (gridSizeInCells.y * gridCellSizeInMeters) / computedCellSize,
                        computedCellSize);
                }
            })();
        }
    }

    this._lastMouseX = event.offsetX;
    this._lastMouseY = event.offsetY;
}

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.mouseOver = function(event)
{
}

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.mouseOut = function(event)
{
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Drops a new item into the scene
 * @param event
 * @returns {boolean}
 */
EditorView.prototype.drop = function(event)
{
    if (event.dataTransfer)
    {
        var data = event.dataTransfer.getData("text/plain");

        //add a new object to the scene by dragging it from the UI
        //TODO: This does not work any more - we don't get the right position
        if (data) {

            // get ray from eye through mouse position and calc dist to ground plane
            var ray = this._x3dElement.runtime.getViewingRay(event.layerX, event.layerY);
            var len = 100;

            // if ray not parallel to plane and reasonably near then use d
            if (Math.abs(ray.dir.y) > x3dom.fields.Eps) {
                var d = -ray.pos.y / ray.dir.y;
                len = (d < len) ? d : len;
            }

            var pos = ray.pos.add(ray.dir.multiply(len));

            var obj = g_editor.getScene().addNewPrimitive(g_editor.primitiveParameterMap[data].className);

            if (obj)
            {
                obj.setTranslationAsVec(ReferenceSystem.pointFromX3DOM(pos));
                g_editor.getSelectionController().replaceSelection(obj);
            }
        }
    }

    event.preventDefault();
    event.stopPropagation();
    event.returnValue = false;
    return false;
};

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.dragEnter = function(event)
{
    event.preventDefault();
    event.stopPropagation();
    event.returnValue = false;
    return false;
};

//----------------------------------------------------------------------------------------------------------------------

EditorView.prototype.dragOver = function(event)
{
    event.preventDefault();
    event.stopPropagation();
    event.returnValue = false;
    return false;
};
