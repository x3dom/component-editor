EditorScene.prototype = new Group();
EditorScene.prototype.constructor = EditorScene;

function EditorScene(id)
{
    Group.call(this);

    this._registry = {};

    this._rootNode = document.getElementById(id);
    if(!this._rootNode)
        console.log("Error: root node not found");
    else
        Group.call(this,this._rootNode);
}


//----------------------------------------------------------------------------------------------------------------------

/**
 * Adds a new primitive of the given type to the scene
 * @param {String} primitive type name
 * @param {editorInput} needs the primitive input from 2d Editor
 * @returns {Primitive} the new primitive
 */
EditorScene.prototype.addNewPrimitive = function(primitiveType, editorInput )
{
    console.log("Creating primitive: "+primitiveType);
    var primitive = eval("new "+primitiveType+"()");

    this.addSceneObject(primitive);

    if(editorInput)
    {
        var shapeEditor = g_editor.getShapeEditor();

        //shapeEditor.setPrimitive(primitive);
        shapeEditor.editor2D_show( true, primitive );
    }

    return primitive;
};

//----------------------------------------------------------------------------------------------------------------------

EditorScene.prototype.getRegisteredSceneObjects = function()
{
    var result = [];
    for(var key in this._registry)
        result.push(this._registry[key]);

    return result;
};

//----------------------------------------------------------------------------------------------------------------------

EditorScene.prototype.getSceneObject = function(key)
{
    return this._registry[key];
};


//----------------------------------------------------------------------------------------------------------------------

/**
 * Removes the given element from the scene
 */
EditorScene.prototype.removeSceneObject = function(sceneObject)
{
    var sceneExplorer = g_editor.getSceneExplorer();

    var names = [sceneObject.getName()];
    //collect "inner" names for groups
    for(var key in this._registry)
    {
        if(sceneObject.contains(this._registry[key]))
            names.push(key);
    }

    for(var n in names)
    {
        if(this._registry[names[n]])
        {
            var obj = this._registry[names[n]];

            if (sceneExplorer)
            {
                sceneExplorer.removeItem(obj);
            }

            delete this._registry[names[n]];
        }
    }

    sceneObject.delete();
    this.removeChild(sceneObject);

    //group items are not in registry
    if (sceneExplorer)
    {
        sceneExplorer.removeItem(sceneObject);
    }

    g_editor.getSelectionController().clearSelection(true);
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Adds a primitive or component to the scene, displays it in the scene explorer (if any) and selects it
 * @param {TransformableObject} sceneObject - the primitive or component
 */
EditorScene.prototype.addSceneObject = function(sceneObject)
{
    this.addChild(sceneObject);

    var name = sceneObject.getName();
    if(!this._registry[name])
        this._registry[name] = sceneObject;
    else
        console.log("Registry Error: object already registerd for name "+name);

    g_editor.getSelectionController().replaceSelection(sceneObject);
    
    if (g_editor.getSceneExplorer())
    {
        g_editor.getSceneExplorer().addItem(sceneObject);
    }
};

//----------------------------------------------------------------------------------------------------------------------

EditorScene.prototype.globalCollect = function(transformationStack, targetArray)
{
    for(var c in this._children)
    {
        this._children[c].globalCollect(transformationStack, targetArray);
    }
};

//----------------------------------------------------------------------------------------------------------------------

EditorScene.prototype.setVisible = function(flag)
{
    for(var c in this._children)
    {
        this._children[c].setVisible(flag);
    }
};

//----------------------------------------------------------------------------------------------------------------------

EditorScene.prototype.removeAllSceneObjects = function()
{
    for(var key in this._registry)
        this.removeSceneObject(this._registry[key]);
};

//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
// PRIVATE FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------

/**
 * Workaround
 */
EditorScene.prototype._computeCenter = function()
{
    return new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);
}
