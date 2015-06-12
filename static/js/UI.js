//TODO: this stuff doesn't belong here
// default color of all ui elements
var defColor = "gray";
// highlight color of all ui elements
var highlightColor = "#fff";


/*
 * The UI object handles the getter and setter function for all GUI elements
 * @returns {UI}
 */
function UI(){

    // specifies whether we are in "group mode"
    // this means that no single primitive, but a group is being transformed etc.
    var groupMode = false;

    var that = this;


    /*
     * Indicates whether the group mode is currently active (i.e., if we currently handle a group or a single primitive)
     * @returns {boolean}
     */
    this.groupModeActive = function(){
        return groupMode;
    };


    /*
     * Indicates whether the group mode is currently active (i.e., if we currently handle a group or a single primitive)
     * @returns {null}
     */
    this.toggleGroupMode = function(val){
        groupMode = val;

        if (val){
            g_editor.getObjectTransformation().enableUI(true);
            g_editor.getPrimitiveManager().updateTransformUIFromCurrentObject();
            g_editor.getPrimitiveManager().highlightCurrentBoundingVolume(true);
        }

        //change the label of the corresponding button in the UI
        document.getElementById('groupingButtonLabel').innerText = val ? 'Ungroup' : 'Group';
    };

    /*
     * Sets all parameters of a material to the material editor on the right bar
     * @param {material} material includes diffuse, specular, emissive color,
     * shininess and transparency
     * @returns (Null)
     */
    this.setMaterial = function (material) {
        if ($("#accordeon-oben").accordion("option", "active") === 1) {
            var colorfield = document.getElementById("diffuse");
            var color = material.getAttribute("diffuseColor");
            colorfield.focus();
            farbtasticPicker.setColor(color);

            colorfield = document.getElementById("specular");
            color = material.getAttribute("specularColor");
            colorfield.focus();
            farbtasticPicker.setColor(color);

            colorfield = document.getElementById("emissive");
            color = material.getAttribute("emissiveColor");
            colorfield.focus();
            farbtasticPicker.setColor(color);

            document.getElementById("transparency").value = material.getAttribute("transparency");
            document.getElementById("shininess").value = material.getAttribute("shininess");

            document.getElementById("diffuse").focus();
        }
    };
}

/*
 * Clamps value on min and max if required
 * @param {string} min minimal range of value
 * @param {string} max maximum range of value
 * @param {string} value param that should be clamped
 * @returns (clamped value)
 */
function clamp(min, max, value) {
    min = parseFloat(min);
    max = parseFloat(max);
    if (min !== null && !isNaN(min) && value < min)
        return min;
    else if (max !== null && !isNaN(max) && value > max)
        return max;

    return value;
}

/*
 * Creates a new text field property with getter and setter of function
 * @param {id} identifier in the html document where the value should be get/set
 * @returns {property with getter and setter}
 */
newSpinnerProperty = function(id, callback)
{
    var obj = {};

    obj.callback = callback;

    obj.get = function(){
        return $("#" + id).spinner("value");
    };

    obj.set = function(value){
        $("#" + id).spinner("value", value);
    };

    obj.disable = function(bool){
        $("#" + id).spinner( "option", "disabled", bool );
    };

    obj.step = function(step){
        if (typeof step === 'undefined')
        {
            return $("#" + id).spinner( "option", "step");
        }
        else
        {
            return $("#" + id).spinner( "option", "step", step );
        }
    };

    obj.min = function(min){
        $("#" + id).spinner( "option", "min", min );
    };

    obj.max = function(max){
        $("#" + id).spinner( "option", "max", max );
    };


    function setClampedValue()
    {
        var clampedValue = clamp($("#" + id).min,
            $("#" + id).max,
            $("#" + id).get());
        if (clampedValue > 0 || clampedValue < 0)
            $("#" + id).set(clampedValue);

        if(obj.callback != null)
            obj.callback();
    }

    $("#" + id).spinner({
        step: 0.001,
        min: 0.00,
        spin:function(e,ui)
        {
            setClampedValue();
        },
        stop:function(e,ui)
        {
            setClampedValue();
        }
    });

    return obj;
};


/*
 * Creates a new text field property with getter and setter of function
 * @param {id} identifier in the html document where the value should be get/set
 * @returns {property with getter and setter}
 */
newTextProperty = function(id, toolTip){
    var obj = {};

    obj.get = function(){
        return document.getElementById(id).value;
    };

    obj.set = function(value){
        document.getElementById(id).value = value;
    };

    obj.disable = function(bool){
        var o = document.getElementById(id);
        if (bool)
            o.style.opacity="0.5";
        else
            o.style.opacity="1.0";
        o.disabled = bool;
    };

    if (toolTip)
        $("#"+id).tooltip();

    return obj;
};


/*
 * Creates a new label property with getter and setter of function
 * @param {id} identifier in the html document where the value should be get/set
 * @returns {property with getter and setter}
 */
newLabelProperty = function(id){
    var obj = {};

    obj.get = function(){
        return document.getElementById(id).textContent;
    };

    obj.set = function(value){
        document.getElementById(id).textContent = value;
    };

    return obj;
};


/*
 * Creates a new image property with getter and setter of function
 * @param {id} identifier in the html document where the value should be get/set
 * @returns {property with getter and setter}
 */
createElementCatalogueButton = function(id, toolTip)
{
    var obj = {};
    obj.highlighted = false;

    obj.get = function(){
        return document.getElementById(id).value;
    };

    obj.set = function(value){
        document.getElementById(id).textContent = value;
    };

    obj.setImage = function(url){
        document.getElementById(id).src = url;
    };

    obj.highlight = function(){
        document.getElementById(id).style.border = "solid 1px " + highlightColorButton;
        obj.highlighted = true;
    };

    obj.dehighlight = function(){
        document.getElementById(id).style.border = "solid 1px " + defColor;
        obj.highlighted = false;
    };


    obj.disable = function(bool){
        var obj = document.getElementById(id);
        if (bool)
            obj.style.opacity="0.5";
        else
            obj.style.opacity="1.0";
        obj.disabled = bool;
    };

    if (toolTip)
        $("#"+id).tooltip();

    return obj;
};


/*
 * Creates a new combo box property with getter and setter of function
 * @param {id} identifier in the html document where the value should be get/set
 * @returns {property with getter and setter}
 */
newComboBoxProperty = function(id, toolTip)
{
    var obj = {};

    obj.get = function(index){
        return document.getElementById(id)[index];
    };

    obj.set = function(index, value){
        document.getElementById(id)[index].text = value;
    };

    obj.disable = function(bool){
        var obj = document.getElementById(id);
        if (bool)
            obj.style.opacity="0.5";
        else
            obj.style.opacity="1.0";
        obj.disabled = bool;
    };

    obj.idMap = function(index){
        return document.getElementById(id)[index].primitive.idMap(index);
    };

    obj.selectedIndex = function(){
        return document.getElementById(id).selectedIndex;
    };

    obj.selectIndex = function(index){
        document.getElementById(id).selectedIndex = index;
    };

    obj.add = function(option){
        document.getElementById(id).add(option,null);
    };

    obj.remove = function(index){
        document.getElementById(id).remove(index);
    };

    if (toolTip)
        $("#"+id).tooltip();

    return obj;
};
