/**
 * Structure for reference units, holding each unit's respective information.
 */
ReferenceUnit = function(name, abbreviation, factorFromMeters)
{
    //long name of the unit (e.g., "meters")
    this.name             = name;

    //abbreviation of the unit (e.g., "m" for meters)
    this.abbreviation     = abbreviation;

    //scale factor to compute this unit from meters
    //(e.g., for millimeters this would be 1000, for kilometers it would be 0.001)
    this.factorFromMeters = factorFromMeters;

    this.getName = function()
    {
        return this.name;
    };

    this.getAbbreviation = function()
    {
        return this.abbreviation;
    };

    this.fromMeters = function(val)
    {
        return val * this.factorFromMeters;
    };

    this.toMeters = function(val)
    {
        return val / this.factorFromMeters;
    };
};


//global object that holds all available reference units
ReferenceUnits = {};


//available reference units
ReferenceUnits.meters      = new ReferenceUnit("meters",      "m",  1.0);

ReferenceUnits.decimeters  = new ReferenceUnit("decimeters",  "dm", 10.0);

ReferenceUnits.centimeters = new ReferenceUnit("centimeters", "cm", 100.0);

ReferenceUnits.millimeters = new ReferenceUnit("millimeters", "mm", 1000.0);

ReferenceUnits.inches      = new ReferenceUnit("inches",      "\"", 39.370079);

//TODO: Find a way to "flag" global variables: where do they belong, and how can I recognize them?
//      Maybe use a C-Style prefix, like "g_myVar"? Or put them as members to a global object?

//global access to the scene size along X and Y
var gridSizeInCells    = new x3dom.fields.SFVec2f(23.0, 42.0);
//size of the grid cells in meters
var gridCellSizeInMeters = 1.0;

//global access to the current reference unit
var currentReferenceUnit = ReferenceUnits.meters;
var lastReferenceUnit = ReferenceUnits.meters;


/*
 * Callback which is invoked as soon as the current reference unit changes.
 */
ReferenceUnits.referenceUnitChanged = function(value)
{
    lastReferenceUnit = currentReferenceUnit;
    var unitHash;
    var unit;

    for (unitHash in ReferenceUnits)
    {
        unit = ReferenceUnits[unitHash];

        if (unit.name == value)
        {
            currentReferenceUnit = unit;

            g_editor.eventSystem.triggerEvent("scenePropertiesChanged");

            //update the actual values
            g_editor.eventSystem.triggerEvent("selectionTransformChanged");
            break;
        }
    }
};