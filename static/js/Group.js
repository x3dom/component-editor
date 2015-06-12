/*
 * Group class, inherits from TransformableObject.
 * A Group object contains a set of objects.
 */
Group.prototype = new ReferencePointHolder();
Group.prototype.constructor = Group;


function Group(domNode, transformableObjectArray)
{
    ReferencePointHolder.call(this);

    this._locked = false;
    this._children = [];
    this._name = 'group_'+this._id;

    //group node, which represents this group inside the scene graph
    this._groupingNode = domNode ? domNode : document.createElement("Group");

    //if no node was given, add to transform node
    if(!domNode)
        this.getMatrixTransformNode().appendChild(this._groupingNode);

    if(transformableObjectArray != null)
    {
        for(var i = 0, n = transformableObjectArray.length; i < n; ++i)
        {
           this.addChild(transformableObjectArray[i]);
        }
    }
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.getChildren = function()
{
    return this._children;
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.addChild = function(transformableObject)
{
    this._children.push(transformableObject);

    this._groupingNode.appendChild(transformableObject.getMatrixTransformNode());

    //!has to be reactivated because of backend graph side effects when removing from scene!
    transformableObject.activateMouseDownListener();
    this._localizeTransformation(transformableObject);

    this._updateCenter();

    return transformableObject;
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.removeChild = function(transformableObject)
{
    var index = this._children.indexOf(transformableObject);

    if( index != -1)
    {
        this._children.splice(index, 1);

        this._groupingNode.removeChild(transformableObject.getMatrixTransformNode());

        this._globalizeTransformation(transformableObject);

        this._updateCenter();
    }
    else
    {
        console.log("ERROR: Element with ID " + transformableObject.getID() + " is not a child of this group.")
    }
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Performs a recursive search, including the children of this group, for an element with the given ID
 * @param {String} id ID of the child element to search
 * @returns {Object} the element, if found, otherwise null
 */
Group.prototype.findChild = function(id)
{
    var i;
    var childResult;

    for (i = 0; i < this._children.length; ++i)
    {
        if (this._children[i].getID() == id)
        {
            return this._children[i];
        }
    }

    //if the element has not been found, forward the search to the child elements
    for (i = 0; i < this._children.length; ++i)
    {
        if (this._children[i] instanceof Group)
        {
            if (childResult = this._children[i].findChild(id))
            {
                return childResult;
            }
        }
    }

    return null;
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.contains = function(transformableObject)
{
    if( TransformableObject.prototype.contains.call(this, transformableObject))
    {
        return true;
    }
    for(var key in this._children)
    {
        if(this._children[key].contains(transformableObject))
            return true;
    }
    return false;
};

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.isLocked = function()
{
    return this._locked;
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.lock = function()
{
    this._locked = true;

    var sceneExplorer = g_editor.getSceneExplorer();
    if(sceneExplorer)
    {
        sceneExplorer.addItem(this);
    }

    for(var key in this._children)
    {
        var child = this._children[key];
        child.deactivateMouseDownListener();
        if(sceneExplorer)
        {
            sceneExplorer.removeItem(child);
        }
        var refPoints = child.getReferencePoints();
        for(var r in refPoints)
        {
            this._referencePoints[this._name+"_"+refPoints[r].getName()] = refPoints[r];
        }
    }

    //this.activateMouseDownListener();

}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.unlock = function()
{
    this._locked = false;

    var sceneExplorer = g_editor.getSceneExplorer();
    if(sceneExplorer)
    {
        sceneExplorer.removeItem(this);
    }

    for(var key in this._children)
    {
        var child = this._children[key];
        child.activateMouseDownListener();
        if(sceneExplorer)
        {
            sceneExplorer.addItem(child);
        }
    }
    this._referencePoints = {};

    this.deactivateMouseDownListener();


}



//----------------------------------------------------------------------------------------------------------------------

Group.prototype.globalCollect = function(transformationStack, targetArray)
{
    for(var c in this._children)
    {
        this._children[c].globalCollect(transformationStack.mult(this.getTransformationMatrix()), targetArray);
    }
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.clone = function()
{
    var clonedObj = TransformableObject.prototype.clone.call(this);

    //add cloned children, dont use "addChild" because of mouseListener activation/deactivation
    for(var c in this._children)
    {
        var clonedChild = this._children[c].clone();

        clonedObj._children.push(clonedChild);
        clonedObj._groupingNode.appendChild(clonedChild.getMatrixTransformNode());
    }

    return clonedObj;
}

/**
 * Assigns the values of the given transformable object to this object.
 */
Group.prototype.assign = function(t)
{
    TransformableObject.prototype.assign.call(this,t);
    this._locked = t._locked;
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.highlight = function(flag, color)
{
    for(var c in this._children)
    {
        this._children[c].highlight(flag, color);
    }
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype.delete = function()
{
    var children = [];
    //copy children for remove
    for(var c in this._children)
    {
        this._children[c].delete();
        children.push(this._children[c]);
    }

    for(var c in children)
    {
        this.removeChild(children[c]);
    }
};

//----------------------------------------------------------------------------------------------------------------------
// PRIVATE FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------

/**
 * Computes the center of the group in world coordinates, using the editor's reference coordinate system
 * This function currently assumes that this is the top-level group
 * @returns {x3dom.fields.SFVec3f}
 * @private
 */
Group.prototype._computeCenter = function()
{
    var matrix = x3dom.fields.SFMatrix4f.parse(this._matrixTransformNode.getAttribute("matrix")).transpose();

    //calculate group center as average position
    var center = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);

    for (var i = 0; i < this._children.length; ++i)
    {
        center = center.add(this._children[i].getTranslation());
    }

    //center in local editor coordinates
    center = center.divide(this._children.length);

    //center in x3dom world coordinates
    center = matrix.multMatrixPnt(ReferenceSystem.vecToX3DOM(center));

    //center in editor world coordinates
    return ReferenceSystem.vecFromX3DOM(center);
}

//----------------------------------------------------------------------------------------------------------------------

/**
 *
 * @private
 */
Group.prototype._updateCenter = function()
{
    var center = this._computeCenter();

    var offset = center.subtract(this.getTranslation());

    var i;

    for (i = 0; i < this._children.length; ++i)
    {
        this._globalizeTransformation(this._children[i]);
    }

    this.setTranslationAsVec(center);

    for (i = 0; i < this._children.length; ++i)
    {
        this._localizeTransformation(this._children[i]);
    }

    g_editor.eventSystem.triggerEvent("currentObjectTransformChanged");
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype._localizeTransformation = function(transformableObject)
{
    var childMatrix;
    var matrix;

    childMatrix  = x3dom.fields.SFMatrix4f.parse(
        transformableObject.getMatrixTransformNode().getAttribute("matrix")).transpose();

    matrix       = x3dom.fields.SFMatrix4f.parse(
        this._matrixTransformNode.getAttribute("matrix")).transpose();

    transformableObject._updateTransformValuesFromMatrix(matrix.inverse().mult(childMatrix));
}

//----------------------------------------------------------------------------------------------------------------------

Group.prototype._globalizeTransformation = function(transformableObject)
{
    var childMatrix;
    var matrix;

    childMatrix  = x3dom.fields.SFMatrix4f.parse(
                            transformableObject.getMatrixTransformNode().getAttribute("matrix")).transpose();

    matrix       = x3dom.fields.SFMatrix4f.parse(
                            this._matrixTransformNode.getAttribute("matrix")).transpose();

    transformableObject._updateTransformValuesFromMatrix(matrix.mult(childMatrix));
}

