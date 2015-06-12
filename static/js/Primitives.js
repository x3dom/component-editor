/*
 * Primitive class, inherits from TransformableObject.
 * This class encapsulates all data which is related to a single primitive.
 * A Primitive consists of a main visualization object
 * and possibly additional objects like PrimitivePoints
 */

Primitive.prototype = new ReferencePointHolder();
Primitive.prototype.constructor = Primitive;

function Primitive()
{
    ReferencePointHolder.call(this);

    this._name = this.constructor.name+"(id:"+this._id+")";
    this._shape = null;
    this._material = null;
    this._visualization = null;

    this._parameters = [];
};

//----------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------

/**
 * Creates the primitives parameters based on the description
 * @param description - the description of the primitive
 */
Primitive.prototype.createFromDescription = function(description)
{
    var that = this;

    if(description.shape)
    {
        this._shape         = description.shape.cloneNode(true);

        this._visualization = this._shape.getElementsByTagName(description.x3domName)[0];
        this._visualization.setAttribute('useGeoCache','false');

        this._material      = this._shape.getElementsByTagName("Material")[0];
        this._matrixTransformNode.appendChild(this._shape);
    }

    //create parameters
    for (k = 0; k < description.parameters.length; k++)
    {
        var constructor = window[description.parameters[k].type+"Param"];
        var param = new constructor(description.parameters[k], that);
        this[param.name.toLowerCase()] = param;
        this._parameters.push(param);
    }
    //after all parameters have been initialized set initial value
    for (k = 0; k < this._parameters.length; k++)
    {
        this._parameters[k].set(this._parameters[k]._value);
    }
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Assigns the values of the given primitive to this object.
 */
Primitive.prototype.assign = function(prim)
{
    ReferencePointHolder.prototype.assign.call(this, prim);

    //after all parameters have been initialized set initial value
    for (var k = 0; k < this._parameters.length; k++)
    {
        this._parameters[k].set(prim._parameters[k].get());
    }
};

//----------------------------------------------------------------------------------------------------------------------

Primitive.prototype.highlight = function(flag, color)
{
    if(this._shape && this._shape._x3domNode)
        this._shape.highlight(flag, color);
};

//----------------------------------------------------------------------------------------------------------------------

Primitive.prototype.getShape = function()
{
    return this._shape;
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Returns the material which is associated with this primitive.
 */
Primitive.prototype.getMaterial = function()
{
    return this._material;
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Returns the parameters which are associated with this primitive.
 */
Primitive.prototype.getParameters = function()
{
    return this._parameters;
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Returns the primitive type as a string (for instance, "cone").
 */
Primitive.prototype.getType = function()
{
    return this.constructor.name;
};

//----------------------------------------------------------------------------------------------------------------------

Primitive.prototype.updatePrimitivePoints = function()
{
    console.log("Warning: updatePrimitivePoints not overwritten!");
};

//----------------------------------------------------------------------------------------------------------------------

Primitive.prototype.getDslParamString = function()
{
    console.log("Warning: writeDslParamStirng not overwritten!");
};

//----------------------------------------------------------------------------------------------------------------------

Primitive.prototype.setDslParamString = function()
{
    console.log("Warning: readDslParamString not overwritten!");
};

//----------------------------------------------------------------------------------------------------------------------

Primitive.prototype.storeRepresentation = function(target)
{
    ReferencePointHolder.prototype.storeRepresentation.call(this, target);
    target.parameters = {};
    for(var p in this._parameters)
    {
        var param = this._parameters[p];
        target.parameters[param.name] = param.get();
    }
};

//----------------------------------------------------------------------------------------------------------------------

Primitive.prototype.loadRepresentation = function(representation)
{
    ReferencePointHolder.prototype.loadRepresentation.call(this, representation);
    for(var p in representation.parameters)
    {
        var param = this[p.toLowerCase()];
        param.set(representation.parameters[p]);
    }
};

//----------------------------------------------------------------------------------------------------------------------

Box.prototype = new Primitive();
Box.prototype.constructor = Box;

function Box()
{
    Primitive.call(this);

    //setup primitive points
    for(var i = 1,n = 6; i <=n; ++i )
    {
        var primPoint = new ReferencePoint();
        primPoint.setName(this._name+"_p"+i);

        var rotation = new x3dom.fields.SFVec3f(0,0,0);
        switch(i)
        {
            case 1:
                rotation = new x3dom.fields.SFVec3f(0, 90, 0);
                break;
            case 2:
                rotation = new x3dom.fields.SFVec3f(90, 0, 0);
                break;
            case 4:
                rotation = new x3dom.fields.SFVec3f(0, 270, 0);
                break;
            case 5:
                rotation = new x3dom.fields.SFVec3f(270, 0, 0);
                break;
            case 6:
                rotation = new x3dom.fields.SFVec3f(180, 0, 0);
                break;
        }
        primPoint.setRotationAnglesAsVec(rotation);
        this.getMatrixTransformNode().appendChild(primPoint.getMatrixTransformNode());
        this._referencePoints["p"+i] = primPoint;
    }
    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Box.prototype.updatePrimitivePoints = function()
{
    var val = this.size.get();
    var vec = ReferenceSystem.pointFromX3DOM(new x3dom.fields.SFVec3f(val[0],val[1],val[2]));

    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(vec.x*0.5,    0,          0));
    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,            -vec.z*0.5,  0));
    this._referencePoints["p3"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,            0,          -vec.y*0.5));
    this._referencePoints["p4"].setTranslationAsVec(new x3dom.fields.SFVec3f(-vec.x*0.5,   0,          0));
    this._referencePoints["p5"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,            vec.z*0.5, 0));
    this._referencePoints["p6"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,            0,          vec.y*0.5));
};

//----------------------------------------------------------------------------------------------------------------------

Box.prototype.getDslParamString = function()
{
    var size = this.size.get();
    return "(" + size[0] + ", " + size[1] + ", " + size[2] + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

Box.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','');
    this.size.set(dsl);
};

//----------------------------------------------------------------------------------------------------------------------

Cone.prototype = new Primitive();
Cone.prototype.constructor = Cone;

function Cone()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAngles(0,0,0);
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAngles(180,0,0);
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Cone.prototype.updatePrimitivePoints = function()
{
    var height = this.height.get();
    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,height/2));
    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,-height/2));
};

//----------------------------------------------------------------------------------------------------------------------

Cone.prototype.getDslParamString = function()
{
    return "(" + this["bottom radius"].get() + "," + this["top radius"].get() + ","+ this.height.get() + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

Cone.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(',"").replace(')','').split(',');
    this["bottom radius"].set(dsl[0]);
    this["top radius"].set(dsl[1]);
    this.height.set(dsl[2]);
};

//----------------------------------------------------------------------------------------------------------------------

Cylinder.prototype = new Primitive();
Cylinder.prototype.constructor = Cylinder;

function Cylinder()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAngles(0,0,0);
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAngles(180,0,0);
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Cylinder.prototype.updatePrimitivePoints = function()
{
    var height = this.height.get();
    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,height/2));
    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,-height/2));
}

//----------------------------------------------------------------------------------------------------------------------

Cylinder.prototype.getDslParamString = function()
{
    return "(" + (this.radius.get() * 2.0) + "," + this.height.get() + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

Cylinder.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','').split(',');
    this.radius.set(dsl[0]/2.0);
    this.height.set(dsl[1]);
};

//----------------------------------------------------------------------------------------------------------------------

Torus.prototype = new Primitive();
Torus.prototype.constructor = Torus;

function Torus()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAngles(90,0,0);
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAngles(90,0,0);
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Torus.prototype.updatePrimitivePoints = function()
{
    var radius = 0.5 * (this.routside.get() + this.rinside.get());
    var angle  = this.angle.get();

    //TODO: make this globally available
    var rad2Deg = 180.0 / Math.PI;
    var deg2Rad = Math.PI / 180.0;

    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(radius, 0, 0));
    //(fixed value, already set in constructor)
    //this._primitivePoints["p1"].setRotationAngles(90, 0, 0);

    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(radius*Math.cos(deg2Rad*angle),
                                                                             radius*Math.sin(deg2Rad*angle),
                                                                             0));

    this._referencePoints["p2"].setRotationAngles(90, 0, 180 + angle);
};

//----------------------------------------------------------------------------------------------------------------------

Torus.prototype.getDslParamString = function()
{
    return "(" + this.routside.get() + "," + this.rinside.get() + "," + this.angle.get() + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

Torus.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','').split(',');
    this.routside.set(dsl[0]);
    this.rinside.set(dsl[1]);
    this.angle.set(dsl[2]);
};

//----------------------------------------------------------------------------------------------------------------------

RectangularTorus.prototype = new Primitive();
RectangularTorus.prototype.constructor = RectangularTorus;

function RectangularTorus()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAngles(90,0,0);
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAngles(90,0,0);
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

RectangularTorus.prototype.updatePrimitivePoints = function()
{
    var radius = 0.5 * (this.routside.get() + this.rinside.get());
    var angle  = this.angle.get();

    //TODO: make this globally available
    var rad2Deg = 180.0 / Math.PI;
    var deg2Rad = Math.PI / 180.0;

    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(radius, 0, 0));
    //(fixed value, already set in constructor)
    //this._primitivePoints["p1"].setRotationAngles(90, 0, 0);

    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(radius*Math.cos(deg2Rad*angle),
                                                                             radius*Math.sin(deg2Rad*angle),
                                                                             0));

    this._referencePoints["p2"].setRotationAnglesAsVec(new x3dom.fields.SFVec3f(90, 0, 180 + angle));
};

//----------------------------------------------------------------------------------------------------------------------

RectangularTorus.prototype.getDslParamString = function()
{
    return "(" + this.routside.get() + "," + this.rinside.get() + "," + this.height.get() +"," + this.angle.get() + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

RectangularTorus.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','').split(',');
    this.routside.set(dsl[0]);
    this.rinside.set(dsl[1]);
    this.height.set(dsl[2]);
    this.angle.set(dsl[3]);
};

//----------------------------------------------------------------------------------------------------------------------

Dish.prototype = new Primitive();
Dish.prototype.constructor = Dish;

function Dish()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAngles(0,0,0);
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAngles(180,0,0);
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Dish.prototype.updatePrimitivePoints = function()
{
    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,this.height.get()));
    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,0));
};

//----------------------------------------------------------------------------------------------------------------------

Dish.prototype.getDslParamString = function()
{
    return "(" + this.diameter.get() + "," + this.radius.get() + "," + this.height.get() + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

Dish.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','').split(',');
    this.diameter.set(dsl[0]);
    this.radius.set(dsl[1]);
    this.height.set(dsl[2]);
};

//----------------------------------------------------------------------------------------------------------------------

Snout.prototype = new Primitive();
Snout.prototype.constructor = Snout;

function Snout()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAngles(0,0,0);
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAngles(180,0,0);
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Snout.prototype.updatePrimitivePoints = function()
{
    var x = this.xoff.get();
    var y = this.yoff.get();
    var height = this.height.get();
    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(x,-y,height/2));
    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,-height/2));
}

//----------------------------------------------------------------------------------------------------------------------

Snout.prototype.getDslParamString = function()
{
    return "(" + this.dtop.get() + "," + this.dbottom.get() + "," + this.xoff.get() + "," + this.yoff.get() +"," + this.height.get() + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

Snout.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','').split(',');
    this.dtop.set(dsl[0]);
    this.dbottom.set(dsl[1]);
    this.xoff.set(dsl[2]);
    this.yoff.set(dsl[3]);
    this.height.set(dsl[4]);
};

//----------------------------------------------------------------------------------------------------------------------

Pyramid.prototype = new Primitive();
Pyramid.prototype.constructor = Pyramid;

function Pyramid()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAngles(0,0,0);
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAngles(180,0,0);
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Pyramid.prototype.updatePrimitivePoints = function()
{
    var height = this.height.get();

    var xoff   = this.xoff.get();
    var yoff   = this.yoff.get();
    var xtop   = this.xtop.get();
    var ytop   = this.ytop.get();
    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(xoff, -yoff, height/2));
    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,-height/2));
};

//----------------------------------------------------------------------------------------------------------------------

Pyramid.prototype.getDslParamString = function()
{
    return "(" + this.xbottom.get() + "," + this.ybottom.get() + "," + this.xtop.get() + ","
        + this.ytop.get() +"," + this.height.get() +"," + this.xoff.get() + "," + this.yoff.get() + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

Pyramid.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','').split(',');
    this.xbottom.set(dsl[0]);
    this.ybottom.set(dsl[1]);
    this.xtop.set(dsl[2]);
    this.ytop.set(dsl[3]);
    this.height.set(dsl[4]);
    this.xoff.set(dsl[5]);
    this.yoff.set(dsl[6]);
};

//----------------------------------------------------------------------------------------------------------------------

SlopedCylinder.prototype = new Primitive();
SlopedCylinder.prototype.constructor = SlopedCylinder;

//TODO: In which unit are xtshear / ytshear / ... specified? Is this conforming to the PDMS rules?
function SlopedCylinder()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAngles(0,0,0);
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAngles(180,0,0);
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

SlopedCylinder.prototype.updatePrimitivePoints = function()
{
    var height  = this.height.get();
    var xtshear = this.xtshear.get();
    var ytshear = this.ytshear.get();
    var xbshear = this.xbshear.get();
    var ybshear = this.ybshear.get();

    //TODO: which unit is this? we just assume 1.0 = 60 degree for now, revise the implementation
    xtshear *= 60;
    ytshear *= 60;
    xbshear *= 60;
    ybshear *= 60;

    this._referencePoints["p1"].setRotationAngles(-ytshear, -xtshear, 0);
    this._referencePoints["p2"].setRotationAngles(180 - ybshear, -xbshear, 0);

    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(0, 0, height/2));
    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(0, 0, -height/2));
};

//----------------------------------------------------------------------------------------------------------------------

SlopedCylinder.prototype.getDslParamString = function()
{
    return "(" + this.radius.get() + "," + this.height.get() + "," + this.xtshear.get()
        + "," + this.ytshear.get() +"," + this.xbshear.get() +"," + this.ybshear.get() + ")\n";
}

//----------------------------------------------------------------------------------------------------------------------

SlopedCylinder.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','').split(',');
    this.radius.set(dsl[0]);
    this.height.set(dsl[1]);
    this.xtshear.set(dsl[2]);
    this.ytshear.set(dsl[3]);
    this.xbshear.set(dsl[4]);
    this.ybshear.set(dsl[5]);
};

//----------------------------------------------------------------------------------------------------------------------

Nozzle.prototype = new Primitive();
Nozzle.prototype.constructor = Nozzle;

//TODO: The nozzle primitive has currently a wrong orientation, according to the PDMS manual
function Nozzle()
{
    Primitive.call(this);

    //setup primitive points
    var p1 = new ReferencePoint();
    p1.setName(this._name+"_p1");
    p1.setRotationAnglesAsVec(new x3dom.fields.SFVec3f(0,0,0));
    this.getMatrixTransformNode().appendChild(p1.getMatrixTransformNode());
    this._referencePoints["p1"] = p1;

    var p2 = new ReferencePoint();
    p2.setName(this._name+"_p2");
    p2.setRotationAnglesAsVec(new x3dom.fields.SFVec3f(180,0,0));
    this.getMatrixTransformNode().appendChild(p2.getMatrixTransformNode());
    this._referencePoints["p2"] = p2;

    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Nozzle.prototype.updatePrimitivePoints = function()
{
    var height = this.height.get();
    this._referencePoints["p1"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,height/2));
    this._referencePoints["p2"].setTranslationAsVec(new x3dom.fields.SFVec3f(0,0,-height/2));
};

//----------------------------------------------------------------------------------------------------------------------

Nozzle.prototype.getDslParamString = function()
{
    return "(" + this.height.get() + "," + this.rinside.get() + ","
        + this.routside.get() + "," + this["nozzle height"].get() +"," + this["nozzle radius"].get() + ")\n";
};

//----------------------------------------------------------------------------------------------------------------------

Nozzle.prototype.setDslParamString = function(dsl)
{
    var dsl = dsl.replace('(','').replace(')','').split(',');
    this.radius.set(dsl[0]);
    this.rinside.set(dsl[1]);
    this.routside.set(dsl[2]);
    this["nozzle height"].set(dsl[3]);
    this["nozzle radius"].set(dsl[4]);
};

//----------------------------------------------------------------------------------------------------------------------

CrossSection.prototype = new Primitive();
CrossSection.prototype.constructor = CrossSection;

function CrossSection()
{
    Primitive.call(this);
}

//----------------------------------------------------------------------------------------------------------------------

CrossSection.prototype.getDslParamString = function()
{
    return "# CrossSection types export not yet implemented";
};

//----------------------------------------------------------------------------------------------------------------------

CrossSection.prototype.setDslParamString = function(dsl)
{

};

//----------------------------------------------------------------------------------------------------------------------

CrossSection.prototype.setCrossSectionPoints = function(points)
{
    this._crossSectionPoints = points;
};

//----------------------------------------------------------------------------------------------------------------------

CrossSection.prototype.getCrossSectionPointCopy = function()
{
    function clone(points){
        var myObj = (points instanceof Array) ? [] : {};
        for (var i in points) {
            if (points[i] && typeof points[i] == "object" && i != "parent" && i != "opposite") {
                myObj[i] = clone(points[i]);
            } else {
                myObj[i] = points[i];
            }
        }
        return myObj;
    }

    return clone(this._crossSectionPoints);
};

//----------------------------------------------------------------------------------------------------------------------

CrossSection.prototype.assign = function(prim)
{
    Primitive.prototype.assign.call(this, prim);

    this.setCrossSectionPoints(prim.getCrossSectionPointCopy());

    this.rebuildGeometry(prim._pointsString);
};

//----------------------------------------------------------------------------------------------------------------------

CrossSection.prototype.rebuildGeometry = function(points)
{
    this._pointsString = points;
    this._visualization.setAttribute('crossSection',points);
    if(this._visualization._x3domNode)
        this._visualization._x3domNode.rebuildGeometry();
};

//----------------------------------------------------------------------------------------------------------------------


Extrusion.prototype = new CrossSection();
Extrusion.prototype.constructor = Extrusion;

function Extrusion()
{
    CrossSection.call(this);
    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};


//----------------------------------------------------------------------------------------------------------------------

SolidOfRevolution.prototype = new CrossSection();
SolidOfRevolution.prototype.constructor = SolidOfRevolution;

function SolidOfRevolution()
{
    CrossSection.call(this);
    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

Origin.prototype = new Primitive();
Origin.prototype.constructor = Origin;

function Origin()
{
    Primitive.call(this);
    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);
};

//----------------------------------------------------------------------------------------------------------------------

ReferencePoint.prototype = new Primitive();
ReferencePoint.prototype.constructor = ReferencePoint;

function ReferencePoint()
{
    Primitive.call(this);
    this.createFromDescription( g_editor.primitiveParameterMap[g_editor.primitiveNamesMap[this.constructor.name]]);

    //create x3d
    var shaftTransform = document.createElement('Transform');
    shaftTransform.setAttribute('translation','0 0.125 0');
    var shaftShape   = document.createElement('Shape');

    var material = document.createElement('Material');
    material.setAttribute('diffuseColor', "0.0 0.7 0.4");
    var appearance = document.createElement('Appearance');
    appearance.appendChild(material);
    shaftShape.appendChild(appearance);

    var cyl = document.createElement('Cylinder');
    cyl.setAttribute('radius', 0.005);
    cyl.setAttribute('height', 0.25);
    shaftShape.appendChild(cyl);

    shaftTransform.appendChild(shaftShape);
    this._matrixTransformNode.appendChild(shaftTransform);

    var headTransform = document.createElement('Transform');
    headTransform.setAttribute('translation','0 0.25 0');

    var headShape = document.createElement('Shape');
    headShape.appendChild(appearance.cloneNode(true));

    var cone = document.createElement('Cone');
    cone.setAttribute('bottomRadius', 0.025);
    cone.setAttribute('height', 0.1);
    headShape.appendChild(cone);

    headTransform.appendChild(headShape);
    this._matrixTransformNode.appendChild(headTransform);
};







