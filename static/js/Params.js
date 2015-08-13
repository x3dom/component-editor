/**
 * Param class contains parameters of primitives
 * @param description - the json description
 * @param targetNode - the target node for the parameters to be applied to
 * @constructor
 */
function Param(description, target)
{
    if(description)
    {
        this.name = description.editorName;
        this._x3domName = description.x3domName;
    }
    this._target = target;
    if(target)
        this._targetNode = target._visualization;
}

//----------------------------------------------------------------------------------------------------------------------

FloatParam.prototype = new Param();
FloatParam.prototype.constructor = FloatParam;

function FloatParam(description, targetNode)
{
    Param.call(this, description, targetNode);

    this._value = description.value;
    this.min = description.min ? description.min : -Number.MAX_VALUE;
    this.max = description.max ? description.max : Number.MAX_VALUE;
    this._step = description.step;

    var that = this;

    this.set = function(value)
    {
        that._value = currentReferenceUnit.toMeters(value);
        that._targetNode.setAttribute(that._x3domName,that._value);
        that._target.updatePrimitivePoints();
    }

    this.get = function()
    {
        if(that._targetNode.hasAttribute(that._x3domName))
        {
            var val = that._targetNode.getAttribute(that._x3domName);
            this._value = val;
        }
        return currentReferenceUnit.fromMeters(this._value);
    }

    this.getStep = function()
    {
        return currentReferenceUnit.fromMeters(this._step);
    }
}

//----------------------------------------------------------------------------------------------------------------------

VecParam.prototype = new Param();
VecParam.prototype.constructor = VecParam;

function VecParam(description, targetNode)
{
    Param.call(this, description, targetNode);

    this._value = description.value;
    this._step = description.step;
    this.min = description.min ? description.min : -Number.MAX_VALUE;
    this.max = description.max ? description.max : Number.MAX_VALUE;

    var that = this;

    this.set = function(value)
    {
        if(typeof value === 'string' )
            value = value.split(",");
        for(var key in value)
        {
            value[key] = currentReferenceUnit.toMeters(value[key]);
        }

        that._value = value[0] +" "+ value[2] + " " + value[1];
        that._targetNode.setAttribute(that._x3domName,that._value);
        that._target.updatePrimitivePoints();
    }

    this.get = function()
    {
        if(that._targetNode.hasAttribute(that._x3domName))
        {
            var val = that._targetNode.getAttribute(that._x3domName);

            this._value = val;
        }
        var valArray = [];
        var split = that._value.split(" ");

        valArray.push(currentReferenceUnit.fromMeters(split[0]));
        valArray.push(currentReferenceUnit.fromMeters(split[2]));
        valArray.push(currentReferenceUnit.fromMeters(split[1]));

        return valArray;
    }

    this.getStep = function()
    {
        return currentReferenceUnit.fromMeters(this._step);
    }

}

//----------------------------------------------------------------------------------------------------------------------

BoolParam.prototype = new Param();
BoolParam.prototype.constructor = BoolParam;

function BoolParam(description, targetNode)
{
    Param.call(this, description, targetNode);

    this._value = description.value;

    var that = this;

    this.set = function(value)
    {
        that._value = value;
        that._targetNode.setAttribute(that._x3domName,that._value);
        that._target.updatePrimitivePoints();
    }

    this.get = function()
    {
        if(that._targetNode.hasAttribute(that._x3domName))
        {
            var val = that._targetNode.getAttribute(that._x3domName);
            this._value = val;
        }
        return this._value;
    }
}

//----------------------------------------------------------------------------------------------------------------------

AngleParam.prototype = new Param();
AngleParam.prototype.constructor = AngleParam;

function AngleParam(description, targetNode)
{
    Param.call(this, description, targetNode);

    this._value = description.value;
    this.min = -360;
    this.max = 360;
    this._step = 0.1;

    var that = this;

    this.set = function(value)
    {
        that._value = value * Math.PI / 180;
        that._targetNode.setAttribute(that._x3domName,that._value);
        that._target.updatePrimitivePoints();
    }

    this.get = function()
    {
        if(that._targetNode.hasAttribute(that._x3domName))
        {
            var val = that._targetNode.getAttribute(that._x3domName);
            this._value = val;
        }
        return this._value * 180/Math.PI;
    }

    this.getStep = function()
    {
        return this._step;
    }
}

//----------------------------------------------------------------------------------------------------------------------
