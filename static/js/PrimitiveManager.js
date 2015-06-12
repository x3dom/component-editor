/*

 // Shows if origin point and refPoints are added to scene
 var origin_refPoints_added = [0, 0];

//TODO: actually, this is UI stuff
function updateWarningSymbols()
{
    if (document.getElementById("referencePointsMissingWarning"))
    {
        if (origin_refPoints_added[0] > 0) {
            document.getElementById("referencePointsMissingWarning").style.visibility = "hidden";
        }
        else {
            document.getElementById("referencePointsMissingWarning").style.visibility = "visible";
        }
    }

    if (document.getElementById("referencePointsMissingWarning"))
    {
        if (origin_refPoints_added[1] > 0) {
            document.getElementById("originMissingWarning").style.visibility = "hidden";
        }
        else {
            document.getElementById("originMissingWarning").style.visibility = "visible";
        }
    }
}
*/

    

/*
 * Sets the name of a primitive to the users defined value
 * @returns {null}
 */
/*
//@todo: this function is not very beautiful at the moment:
//          - actually, some of this is UI functionality
this.setObjectName = function() {
    if (g_editor.getUI().groupModeActive())
    {
        this.groupList[currentObjectID].setName(g_editor.getUI().BBPrimName.get());
    }
    else
    {
        this.primitiveList[currentObjectID].setName(g_editor.getUI().BBPrimName.get());
        g_editor.getSceneExplorer().getTreeView().rename(currentObjectID, g_editor.getUI().BBPrimName.get());
    }
};
*/


/**
 * Writes all primitives and reference points / vectors to the given arrays. Groups are resolved.
 * This also uses a coordinate system which has the z axis pointing upwards,
 * which is the X3DOM coordinate system rotated around the X-axis by -90 degrees.
 */
/*
this.getComponentData = function (primitivesJSON, referencePointsJSON)
{
    var p;
    var g;

    this.clearSelection();

    //resolve groups
    for (g in this.groupList) {
        this.groupList[g].releaseAllPrimitives();
    }

    this.groupList =[];

    //export primitives
    for (p in this.primitiveList) {
        //TODO: this is bad, bad, bad...: "IndexedLineSet" indicates that we have a "reference point"...
        if (this.primitiveList[p].primType != "IndexedLineSet")
        {
            primitivesJSON.push(this.primitiveList[p].toJSON());
        }
    }

    //export reference points
    this.getAllReferencePoints(referencePointsJSON);
}*/
