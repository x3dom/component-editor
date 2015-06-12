matrixToGLString = function(mat){
    return mat.toGL().toString();
};

/*
 * Base class for everything that is transformed inside the editor.
 * Concretely speaking: Primitives and Groups.
 */
var idCounter = 0;

function TransformableObject()
{
    var that = this;

    this._id   = idCounter.toString();
    this._name = "object_" + idCounter++;

    this._matrixTransformNode = document.createElement('MatrixTransform');
    this._matrixTransformNode.setAttribute("matrix", matrixToGLString(x3dom.fields.SFMatrix4f.identity()));

    //transformation values
    this._translation    = new x3dom.fields.SFVec3f(0, 0, 0);
    this._rotationAngles = new x3dom.fields.SFVec3f(0, 0, 0);
    this._scale          = new x3dom.fields.SFVec3f(1, 1, 1);

    this._mouseDownListener = function() {
        g_editor.getActiveView().elementClicked(that);
    };
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Returns the mouseDown listener which is associated with this transformable object.
 * This can be used to dynamically add and remove the listener from DOM nodes.
 */
TransformableObject.prototype.getMouseDownListener = function()
{
    return this._mouseDownListener;
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Activates the mouseDown listener
 */
TransformableObject.prototype.activateMouseDownListener = function()
{
    this.getMatrixTransformNode().addEventListener("mousedown",
        this._mouseDownListener, false);
}


//----------------------------------------------------------------------------------------------------------------------

/**
 * Deactivates the mouseDown listener
 */
TransformableObject.prototype.deactivateMouseDownListener = function()
{
    this.getMatrixTransformNode().removeEventListener("mousedown",
        this._mouseDownListener, false);
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Returns a clone of this transformable object.
 */
TransformableObject.prototype.clone = function()
{
    var clonedObj = new this.constructor();

    clonedObj.assign(this);

    return clonedObj;
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Assigns the values of the given transformable object to this object.
 */
TransformableObject.prototype.assign = function(t)
{
    this.setTranslationAsVec(t.getTranslation());
    this.setRotationAnglesAsVec(t.getRotationAngles());
    this.setScaleAsVec(t.getScale());
}

//----------------------------------------------------------------------------------------------------------------------

/*
 * Returns the ID of the object. The id is unique for each primitive.
 */
TransformableObject.prototype.getID = function()
{
    return this._id;
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Returns the name of this object. Multiple primitives may have the same name.
 */
TransformableObject.prototype.getName = function()
{
    return this._name;
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Sets the name of this object. Multiple primitives may have the same name.
 */
TransformableObject.prototype.setName = function(name)
{
   this._name = name;
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Returns the DOM node which represents this object.
 */
TransformableObject.prototype.getMatrixTransformNode = function(){
    return this._matrixTransformNode;
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Convenience function that returns the X3DOM transformation matrix used for this object.
 * @returns {x3dom.fields.SFMatrix4f}
 */
TransformableObject.prototype.getTransformationMatrix = function(){
    return  x3dom.fields.SFMatrix4f.parse(this._matrixTransformNode.getAttribute("matrix")).transpose();
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Convenience function that sets the X3DOM transformation matrix used for this object.
 * @returns {x3dom.fields.SFMatrix4f}
 */
TransformableObject.prototype.setTransformationMatrix = function(matrix){
    this._matrixTransformNode.setAttribute("matrix",matrixToGLString(matrix));
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Sets the rotation angles in radians
 */
TransformableObject.prototype.setRotationAngles = function(x, y, z){
    this._rotationAngles = ReferenceSystem.vecToX3DOM(new x3dom.fields.SFVec3f(x,y,z));

    this.updateMatrixTransform();
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Sets the rotation angles in radians, given as a 3D vector
 */
TransformableObject.prototype.setRotationAnglesAsVec = function(v){
    this._rotationAngles = ReferenceSystem.vecToX3DOM(v);

    this.updateMatrixTransform();
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.setTranslation = function(x, y, z){
    this._translation = ReferenceSystem.pointToX3DOM(new x3dom.fields.SFVec3f(x,y,z));

    this.updateMatrixTransform();
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.setTranslationAsVec = function(v){
    this._translation = ReferenceSystem.pointToX3DOM(v);

    this.updateMatrixTransform();
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.setScale = function(x, y, z){
    this._scale = ReferenceSystem.vecToX3DOM(new x3dom.fields.SFVec3f(x,y,z));

    this.updateMatrixTransform();
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.setScaleAsVec = function(v){
    this._scale = ReferenceSystem.vecToX3DOM(v);

    this.updateMatrixTransform();
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.getTranslation = function(){
    return ReferenceSystem.pointFromX3DOM(this._translation);
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.getRotationAngles = function(){
    return ReferenceSystem.vecFromX3DOM(this._rotationAngles);
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.getScale = function(){
    return ReferenceSystem.vecFromX3DOM(this._scale);
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.updateMatrixTransform = function(){
    var deg2Rad = Math.PI / 180.0;

    var matTr = x3dom.fields.SFMatrix4f.translation(this._translation);

    var matRX = x3dom.fields.SFMatrix4f.rotationX(this._rotationAngles.x * deg2Rad);
    var matRY = x3dom.fields.SFMatrix4f.rotationY(this._rotationAngles.y * deg2Rad);
    var matRZ = x3dom.fields.SFMatrix4f.rotationZ(this._rotationAngles.z * deg2Rad);

    var matSc = x3dom.fields.SFMatrix4f.scale(this._scale);

    var transformMat = matTr;
    transformMat     = transformMat.mult(matRZ.mult(matRY).mult(matRX));
    transformMat     = transformMat.mult(matSc);

    this._matrixTransformNode.setAttribute("matrix", matrixToGLString(transformMat));
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Creates a temporary container containing the TransformableObject itself as 'object' and
 * the transformation of the object combined with the current matrix stack as 'transform'
 * @param transformationStack - the current transformation stack
 * @param targetArray - the array for the object
 */
TransformableObject.prototype.globalCollect = function(transformationStack, targetArray)
{
    var object = {
        object : this,
        transform : transformationStack.mult(this.getTransformationMatrix())
    };

    targetArray.push(object);
}

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.setVisible = function(flag)
{
    this._matrixTransformNode.setAttribute("render", flag);
}

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.isVisible = function()
{
    return this._matrixTransformNode.getAttribute("render") === 'true';
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Updates the transformation values of this transformable, using a given matrix
 * @param {SFMatrix4F} matrix - the matrix that should be used
 * @private
 */
TransformableObject.prototype._updateTransformValuesFromMatrix = function(matrix)
{
    var transVec = new x3dom.fields.SFVec3f(0, 0, 0);
    var scaleVec = new x3dom.fields.SFVec3f(1, 1, 1);
    var scaleRotQuat = new x3dom.fields.Quaternion(0, 0, 1, 0);
    var rotationQuat = new x3dom.fields.Quaternion(0, 0, 1, 0);
    var angles;
    //TODO: make this globally available
    var rad2Deg = 180.0 / Math.PI;

    matrix.getTransform(transVec, rotationQuat, scaleVec, scaleRotQuat);

    this.setTranslationAsVec(ReferenceSystem.pointFromX3DOM(transVec));
    this.setScaleAsVec(ReferenceSystem.vecFromX3DOM(scaleVec));

    angles = rotationQuat.toMatrix().getEulerAngles();

    this.setRotationAnglesAsVec(ReferenceSystem.vecFromX3DOM(new x3dom.fields.SFVec3f(angles[0] * rad2Deg,
                                                                                      angles[1] * rad2Deg,
                                                                                      angles[2] * rad2Deg)));
}

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.contains = function(transformableObject)
{
    return transformableObject == this;
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.delete = function()
{

};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.highlight = function(flag, color)
{

}

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.storeRepresentation = function(target)
{
    target.type = this.constructor.name;
    target.transform = this.getTransformationMatrix().toString().replace("\n","");
};

//----------------------------------------------------------------------------------------------------------------------

TransformableObject.prototype.loadRepresentation = function(representation)
{
    this.setTransformationMatrix(x3dom.fields.SFMatrix4f.parse(representation.transform));
};

//----------------------------------------------------------------------------------------------------------------------

ReferencePointHolder.prototype = new TransformableObject();
ReferencePointHolder.prototype.constructor = ReferencePointHolder;

function ReferencePointHolder()
{
    TransformableObject.call(this);

    this._referencePoints = {};
}

//----------------------------------------------------------------------------------------------------------------------

ReferencePointHolder.prototype.getReferencePoints = function()
{
    return this._referencePoints;
};

//----------------------------------------------------------------------------------------------------------------------

ReferencePointHolder.prototype.storeRepresentation = function(target)
{
    TransformableObject.prototype.storeRepresentation.call(this, target);
    target.referencePoints = [];

    for(var r in this._referencePoints)
    {
        if(this._referencePoints[r].isVisible())
            target.referencePoints.push(r);
    }
};

//----------------------------------------------------------------------------------------------------------------------

ReferencePointHolder.prototype.loadRepresentation = function(representation)
{
    TransformableObject.prototype.loadRepresentation.call(this, representation);

    for(var r in this._referencePoints)
    {
        if(representation.referencePoints.indexOf(r) < 0)
        {
            var refPoint = this._referencePoints[r];

            refPoint.setVisible(false);
            //TODO: discuss for the moment do not delete
            //this.getMatrixTransformNode().removeChild(refPoint.getMatrixTransformNode());
            // delete this._referencePoints[r];
        }
    }
};


