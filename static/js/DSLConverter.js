/*
 * DSLConverter
 * This class converts primitives from and to DSL descriptions.
 */

DSLConverter = {};
DSLConverter.eps = 0.0001;
DSLConverter.rad2Deg = 180.0 / Math.PI;
DSLConverter.deg2Rad = Math.PI / 180.0;
DSLConverter._dslStringToType =
{
    "box"                           : Box.prototype.constructor,
    "cone"                          : Cone.prototype.constructor,
    "cylinder"                      : Cylinder.prototype.constructor,
    "torus"                         : Torus.prototype.constructor,
    "rectangular_torus"             : RectangularTorus.prototype.constructor,
    "dish"                          : Dish.prototype.constructor,
    "snout"                         : Snout.prototype.constructor,
    "pyramid"                       : Pyramid.prototype.constructor,
    "sloped_cylinder"               : SlopedCylinder.prototype.constructor,
    "nozzle"                        : Nozzle.prototype.constructor,
    "extrusion"                     : Extrusion.prototype.constructor,
    "solid"                         : SolidOfRevolution.prototype.constructor
}

//----------------------------------------------------------------------------------------------------------------------

DSLConverter.primitiveToDSL = function(id, primitive)
{
    //find command
    var command = null;

    for(var key in this._dslStringToType)
    {
        if(this._dslStringToType[key].name == primitive.constructor.name)
        {
            command = "make_"+key;
        }
    }

    if(!command)
    {
        console.log("Unknown creation command for type "+primitive.constructor);
    }

    return id + " = "+command+ primitive.getDslParamString();
}

//----------------------------------------------------------------------------------------------------------------------

DSLConverter.transformationToDSL = function(id, transform)
{
    var transVec = new x3dom.fields.SFVec3f(0, 0, 0);
    var scaleVec = new x3dom.fields.SFVec3f(1, 1, 1);
    var scaleRotQuat = new x3dom.fields.Quaternion(0, 0, 1, 0);
    var rotationQuat = new x3dom.fields.Quaternion(0, 0, 1, 0);

    transform.getTransform(transVec, rotationQuat, scaleVec, scaleRotQuat);

    var translation = ReferenceSystem.pointFromX3DOM(transVec);
    var scale = ReferenceSystem.vecFromX3DOM(scaleVec);
    scale.x = Math.abs(scale.x);
    scale.y = Math.abs(scale.y);
    scale.z = Math.abs(scale.z);

    var angles  = rotationQuat.toMatrix().getEulerAngles(),eps = 0.000001;
    angles[0] = Math.abs(angles[0]) < eps ? 0.0 : angles[0];
    angles[1] = Math.abs(angles[1]) < eps ? 0.0 : angles[1];
    angles[2] = Math.abs(angles[2]) < eps ? 0.0 : angles[2];

    var rotationAngles = ReferenceSystem.vecFromX3DOM(new x3dom.fields.SFVec3f(
        angles[0] * DSLConverter.rad2Deg, angles[1] * DSLConverter.rad2Deg, angles[2] * DSLConverter.rad2Deg));

    var dslString = "";
    if (!scale.equals(new x3dom.fields.SFVec3f(1,1,1),DSLConverter.eps))
    {
        dslString += id + " = scale_shape(" + id + "," + scale.x + "," + scale.y + "," + scale.z + ")\n";
    }
    if (!rotationAngles.equals(new x3dom.fields.SFVec3f(0, 0, 0),DSLConverter.eps))
    {
        dslString += id + " = rotate_shape_3_axis(" + id + "," + rotationAngles.x + "," + rotationAngles.y + "," + rotationAngles.z + ")\n";
    }
    if (!translation.equals(new x3dom.fields.SFVec3f(0, 0, 0),DSLConverter.eps))
    {
        dslString += id + " = translate_shape(" + id + "," + DSLConverter.vectorToDSL(translation)+ ")\n";
    }

    return dslString;
}

//----------------------------------------------------------------------------------------------------------------------

DSLConverter.dslToTransformation = function(dsl, primitive)
{
    var transformationType = dsl.substr(0,dsl.indexOf("_shape"));
    var values = dsl.substr(dsl.indexOf("("));

    switch (transformationType.trim())
    {
        case "translate":
        {
            var translation = DSLConverter.dslToVector(values.substr(values.indexOf("Vector")));
            primitive.setTranslationAsVec(translation);
            break;
        }
        case "scale":
        {
            var scaleValues = values.replace("(","").replace(")","").trim().split(",");

            var scale = new x3dom.fields.SFVec3f(scaleValues[1],scaleValues[2],scaleValues[3]);
            //primitive.setScaleAsVec(scale);


            break;
        }
        case "rotate":
        {
            var eulerAngles = values.replace("(","").replace(")","").trim().split(",");

            var angles = new x3dom.fields.SFVec3f(eulerAngles[1],eulerAngles[2],eulerAngles[3]);
            primitive.setRotationAnglesAsVec(angles);
            break;
        }
    }
}

//----------------------------------------------------------------------------------------------------------------------

DSLConverter.dslToPrimitive = function(dsl)
{
    var start= dsl.indexOf("make_")+5;
    var length = dsl.indexOf("(") - start;

    var primitiveType = dsl.substr(start, length);
    var constructor = this._dslStringToType[primitiveType];
    var params = dsl.substr(dsl.indexOf("("));

    if(constructor)
    {
        var primitive = new constructor();
        primitive.setDslParamString(params);
        return primitive;
    }

    console.log("DSLConverter: could not handle primitive for type "+primitiveType);
    return {};
}

//----------------------------------------------------------------------------------------------------------------------

DSLConverter.vectorToDSL = function(vec)
{
    return "Vector(" + vec.x + ", " + vec.y + ", " + vec.z + ")";
};

//----------------------------------------------------------------------------------------------------------------------

DSLConverter.dslToVector = function(dsl)
{
    var start = dsl.indexOf("(")+1;
    var length = dsl.indexOf(")") -start;
    var values = dsl.substr(start,length).split(",");
    return new x3dom.fields.SFVec3f(values[0],values[1],values[2]);
};
