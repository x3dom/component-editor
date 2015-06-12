function StorageManager(){}

//----------------------------------------------------------------------------------------------------------------------

StorageManager.prototype.saveScene = function(objectMatrixArray, primitivePointMatrixArray)
{
    var sceneObjects = g_editor.getScene().getRegisteredSceneObjects();

    var storageObj = {};
    var jsObj;

    for(var key in sceneObjects)
    {
        jsObj = {};
        storageObj[key] = jsObj;
        sceneObjects[key].storeRepresentation(jsObj);
    }

    var dataStr = "data:text/json;charset=utf-8," + JSON.stringify(storageObj);

    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "scene.json");
    dlAnchorElem.click();
};

//----------------------------------------------------------------------------------------------------------------------

StorageManager.prototype.loadScene = function(input)
{
    if (input.files && input.files.length > 0)
    {
        var file = input.files[0];

        var filename = file.name;

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e){

                g_editor.getScene().removeAllSceneObjects();

                var jsonData = JSON.parse(e.target.result);

                for (var i in jsonData) {
                    var data = jsonData[i];

                    if (data.type) {
                        //Create object
                        var constructor = window[data.type];

                        var object = new constructor();
                        object.loadRepresentation(data);

                        g_editor.getScene().addSceneObject(object);
                    }
                }

                g_editor.getSceneExplorer().setSceneGroupName("id: " + filename);
            };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsText(file);
    }
};

//----------------------------------------------------------------------------------------------------------------------
