
/* if a widget is created it adds itself (including the respective get function) to the editor automatically */
function EditorWidget (widgetName)
{
    var that = this;
    if(g_editor._widgets[widgetName] === undefined)
    {
        g_editor._widgets[widgetName] = this;
        g_editor["get"+widgetName] = function()
        {
            return that;
        }
    }
}

//----------------------------------------------------------------------------------------------------------------------
/*
 * The EditorBase is the base class for different editors
 * it allows to load  *
 *
 * @returns {SceneBase}
 */
function EditorBase()
{
    this._config = {};
    this._views  = [];
    this._activeViewIdx = 0;

    this._scene = null;

    // initialize event system
    this.eventSystem = new EventSystem([
        "scenePropertiesChanged",
        "selectionChanged",
        "selectionTransformChanged",
        "selectionPropertiesChanged",
        "elementAddedToScene",
        "elementRemovedFromScene",
        "enterFrame"]);

    // widgets are loaded as html/js fragments
    this._widgets = {};
    this._widgetsLoading = 0;

    // controls input
    this._selectionController = new SelectionController(this);

    // controls dragging of objects
    this._dragController = new DragController();

    // GizmoController handles all gizmos in the scene
    this._gizmoController = null;

    // Controller that handles the activation of the transformation modes
    this._controller = new Controller(this._ui);

    //handles server communication
    this._storageManager = new StorageManager();

    // primitive parameter map to synchronize names between editor and x3dom
    this.primitiveParameterMap = this.createParameterMap("../static/xml/PrimitiveParameterMap.xml");
    this.primitiveNamesMap = {};
    for(var key in this.primitiveParameterMap)
    {
        this.primitiveNamesMap[this.primitiveParameterMap[key].className] = key;
    }
}

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.readConfigFile = function (filename)
{
    var that = this;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', filename, false);

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState == 4)
        {
            try
            {
                that._config = JSON.parse(xhr.responseText);
            }
            catch (err)
            {
                alert("Parsing error when reading config file \"" + filename + "\":\n", JSON.stringify(err));
            }
            if(that._config != null)
                that.loadWidgets();
        }
    };

    xhr.send(null);
};

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.loadWidgets = function()
{
    var that = this;

    for(var i = 0, n = this._config.Widgets.length; i < n; ++i)
    {
        var definition = this._config.Widgets[i];

        var containerDiv = document.createElement('div');
        containerDiv.id = definition.name;
        document.getElementById(definition.target).appendChild(containerDiv);

        $(containerDiv).load(definition.filePath,
        function()
        {
            that._widgetsLoading--;
            that.init();

            //instantiate widget
            console.log("Creating widget: "+this.id);
            var instance = eval("new "+this.id+"()");
        });
        this._widgetsLoading++;
    }
}
//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.init = function()
{
    if(this._widgetsLoading == 0)
    {
        this._scene = new EditorScene(this._config['Identifiers'].value["Root"]);

        this._gizmoController = new GizmoController();

        this.applyConfigFile();


        //ui specific commands for styling etc
        $(".webedit-ui-button").button();

        //finish setup

        // Initialize orientation indicator
        $("#x3domOrientationSceneView").viewConnector({connected: "x3domCentralSceneView",
            connectPosition: false});

        // Initialize axis indicator
        $("#x3domAxisSceneView").viewConnector({connected: "x3domCentralSceneView",
            connectPosition: false});


        this._controller.Activate("hand");
        this._selectionController.clearSelection();

        this.setup();
    }
}

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.setup = function()
{
    console.log("not defined: setup")
}


//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.getActiveView = function()
{
    return this._views[this._activeViewIdx];
}

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.getScene = function()
{
    return this._scene;
}

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.getDragController = function()
{
    return this._dragController;
}

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.getSelectionController = function()
{
    return this._selectionController;
}

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.getGizmoController = function()
{
    return this._gizmoController;
}

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.getController = function()
{
    return this._controller;
}

//----------------------------------------------------------------------------------------------------------------------


EditorBase.prototype.getStorageManager = function()
{
    return this._storageManager;
}

//----------------------------------------------------------------------------------------------------------------------

EditorBase.prototype.applyConfigFile = function()
{
    var editorViews;
    var i;

    if (this._config["DefaultGridCellSize"] && this._config["DefaultSceneSize"])
    {
        this._gizmoController.updateGridSize(this._config["DefaultSceneSize"].value[0], this._config["DefaultSceneSize"].value[1], this._config["DefaultGridCellSize"].value);
    }

    if (editorViews = this._config["EditorViews"])
    {
        for (i = 0; i < editorViews.length; ++i)
        {
            this._views[i] = new EditorView(editorViews[i].x3dTag);
            this._views[i].setName(editorViews[i].name);
        }
    }
    else
    {
        console.log("ERROR: Config file contains no view definitions.");
    }
};

//----------------------------------------------------------------------------------------------------------------------

/*
 * Creates an array with primitives an their parameters, including
 * a mapping between the x3dom names and editor names and a default value
 * @param {string} file path to map source file (XML)
 * @returns {Array}
 */
EditorBase.prototype.createParameterMap = function(file)
{
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", file, false);
    xhttp.send();

    var xmlDoc = xhttp.responseXML.childNodes[0];
    var primitives = xmlDoc.getElementsByTagName("Primitive");

    var primitiveParameterMap = [];
    for (var i = 0; i < primitives.length; i++)
    {
        var currPrim = primitives[i];
        primitiveParameterMap[currPrim.getAttribute("editorName")] =
        {
            editorName: currPrim.getAttribute("editorName"),
            shape: currPrim.getElementsByTagName('Shape')[0],
            className: currPrim.getAttribute("className"),
            x3domName: currPrim.getAttribute("x3domName"),
            image: currPrim.getAttribute("image"),
            editorInput: currPrim.getAttribute("editorInput"),
            parameters : []
        };

        var parameters = currPrim.getElementsByTagName("Parameter");
        for (var j = 0; j < parameters.length; j++){
            var currParam = parameters[j];
            primitiveParameterMap[currPrim.getAttribute("editorName")].parameters.push(
                {
                    editorName: currParam.getAttribute("editorName"),
                    x3domName: currParam.getAttribute("x3domName"),
                    value: currParam.textContent,
                    min: currParam.getAttribute("min"),
                    max: currParam.getAttribute("max"),
                    type: (currParam.getAttribute("type") !== null) ? currParam.getAttribute("type") : "spinner",
                    render: (currParam.getAttribute("render") !== null) ? currParam.getAttribute("render") : "true",
                    step: (currParam.getAttribute("step") !== null) ? currParam.getAttribute("step") :
                        (currParam.getAttribute("type") !== "angle") ? 0.1 : 1.0
                }
            );
        }
    }

    return primitiveParameterMap;
};

