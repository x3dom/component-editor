ComponentEditor.prototype = new EditorBase();
ComponentEditor.prototype.constructor = ComponentEditor;

function ComponentEditor()
{
    EditorBase.call(this);

    this.readConfigFile("config.json");
}

//----------------------------------------------------------------------------------------------------------------------

ComponentEditor.prototype.setup = function()
{
    // disable default behavior which opens another context menu by itself
    document.getElementById('contextMenu').oncontextmenu = function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.returnValue = false;
        return false;
    };

    ReferenceSystem.setup(new x3dom.fields.SFMatrix4f.rotationX(Math.PI/2));

    //check if we should load a component
    var location = window.location;
    if(location.search)
    {
        this._storageManager.loadComponentFromSearch(location.search);
    }
};

