function SelectionController(editorBase)
{
    this._selection = null;
    this._selectionColor = "1 1 0";
    this._selectionColorNegative = "1 0 1";

    var that = this;
    editorBase.eventSystem.registerCallback("selectionPropertiesChanged", function()
    {
        that.highlightObject(that._selection, true);
    });
    editorBase.eventSystem.registerCallback("selectionChanged", function()
    {
        that.highlightObject(that._selection, true);
    });
}

//----------------------------------------------------------------------------------------------------------------------

/**
 *
 * @returns {TransformableObject} the selected element - can be a group
 */
SelectionController.prototype.getSelection = function()
{
    return this._selection;
}

//----------------------------------------------------------------------------------------------------------------------

SelectionController.prototype.replaceSelection = function(transformableObject)
{
    this.clearSelection();
    this.addToSelection(transformableObject);
    g_editor.eventSystem.triggerEvent("selectionChanged");
}

//----------------------------------------------------------------------------------------------------------------------

SelectionController.prototype.addToSelection = function(transformableObject)
{
    var hasSelection  = this._selection;
    var isGroup = (this._selection instanceof Group);


    //already something in selection?
    if( hasSelection )
    {
        //remove selected from scene
        var scene = g_editor.getScene();
        scene.removeChild(transformableObject);

        //do we have a group already ? if its locked we need a new group
        if( !isGroup || this._selection.isLocked())
        {
            //create new group
            var oldSelection = this._selection;
            scene.removeChild(oldSelection);

            this._selection = new Group();
            scene.addChild(this._selection);

            this._selection.addChild(oldSelection);
        }
        this._selection.addChild(transformableObject);
    }
    else
    {
        //simply select new object
        this._selection = transformableObject;
    }

    this.highlightObject(this._selection, true);
};

//----------------------------------------------------------------------------------------------------------------------

//is only called if we have currently selected a group
SelectionController.prototype.removeFromSelection = function(transformableObject)
{
    if (this._selection != transformableObject && this._selection.contains(transformableObject))
    {
        this.highlightObject(transformableObject, false);

        var scene = g_editor.getScene();
        this._selection.removeChild(transformableObject);
        scene.addChild(transformableObject);

        //selection must be a group
        if (this._selection.getChildren().length < 2)
        {
            var oldSelection = this._selection;

            this._selection = oldSelection.getChildren()[0];
            oldSelection.removeChild(this._selection);

            scene.removeChild(oldSelection);
            scene.addChild(this._selection);

            //x3dom backend "forgets" about highlight state
            this.highlightObject(this._selection, true);
        }
    }
    g_editor.eventSystem.triggerEvent("selectionChanged");
}

//----------------------------------------------------------------------------------------------------------------------

/*
 * Highlights or un-highlights the currently selected primitive or group (if any)
 * @param {bool} on specifies whether highlighting should be active
 * @returns (undefined)
 */
SelectionController.prototype.highlightObject = function(object, on)
{
    if (object)
    {
        var negative = object["positive element"] && object["positive element"].get() === 'false';

        // x3dom highlighting stores the actual color in the backend
        // and resets it when highlighting is deactivated
        // therefore, when activating highlighting, we have to set the current material before "highlight",
        // but when deactivating we have to set the current material after "highlight"
        if(object.getMaterial && on)
        {
            var material = object.getMaterial();
            if(material)
                material.setAttribute("diffuseColor", negative ? "#ff0000" : "#3F7EBD" );
        }

        object.highlight(on, negative ? this._selectionColorNegative : this._selectionColor );

        if(object.getMaterial && !on)
        {
            var material = object.getMaterial();
            if(material)
                material.setAttribute("diffuseColor", negative ? "#ff0000" : "#3F7EBD");
        }
    }
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Clears the current selection
 */
SelectionController.prototype.clearSelection = function(triggerEvent)
{
    if (this._selection)
    {
        if(this._selection instanceof Group && !this._selection.isLocked())
        {
            var scene = g_editor.getScene();

            //obtain a copy of the child list
            var children = this._selection.getChildren().slice(0);;
            var i;

            //move all children of the temporary group back to the scene
            for (i = 0; i < children.length; ++i)
            {
                this._selection.removeChild(children[i]);
                scene.addChild(children[i]);
            }
        }

        this.highlightObject(this._selection, false);
    }

    this._selection = null;

    if(triggerEvent)
        g_editor.eventSystem.triggerEvent("selectionChanged");
};

//----------------------------------------------------------------------------------------------------------------------

SelectionController.prototype.toggleLocking = function()
{
    if(this._selection && this._selection instanceof Group)
    {
        if(!this._selection.isLocked())
            this._selection.lock();
        else
            this._selection.unlock();

        g_editor.eventSystem.triggerEvent("selectionChanged");
    }
}
