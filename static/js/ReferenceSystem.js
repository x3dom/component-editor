/**
 * Structure holding the reference system and the respective transformation to/from the x3dom system.
 */

ReferenceSystem = {};

//----------------------------------------------------------------------------------------------------------------------

ReferenceSystem.setup = function(x3domToReferenceMatrix)
{
    this._matrix = x3domToReferenceMatrix != null ? x3domToReferenceMatrix : x3dom.fields.SFMatrix4f.identity();
    this._inverse = this._matrix.inverse();
};

//----------------------------------------------------------------------------------------------------------------------

ReferenceSystem.getMatrix = function()
{
    return this._matrix;
};

//----------------------------------------------------------------------------------------------------------------------

ReferenceSystem.pointFromX3DOM = function(vec3)
{
    return this._matrix.multMatrixPnt(vec3);
};

//----------------------------------------------------------------------------------------------------------------------

ReferenceSystem.pointToX3DOM = function(vec3)
{
    return this._inverse.multMatrixPnt(vec3);
};

//----------------------------------------------------------------------------------------------------------------------

ReferenceSystem.vecFromX3DOM = function(vec3)
{
    return this._matrix.multMatrixVec(vec3);
};

//----------------------------------------------------------------------------------------------------------------------

ReferenceSystem.vecToX3DOM = function(vec3)
{
    return this._inverse.multMatrixVec(vec3);
};

//----------------------------------------------------------------------------------------------------------------------

ReferenceSystem.setup();
