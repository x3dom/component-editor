//TODO: move as much as possible to a shared init file

// primType counter
var primType_counter = {};


var g_editor = null;

/*
 * Initializes the entire application
 * @returns {undefined}
 */
document.onload = function(){

    g_editor = new ComponentEditor();
};



/*
 * This function monitors the closing of a tab or the browser. If the work isn't
 * completed this function will react by a closing dialog
 * @returns {null}
 */
//window.onbeforeunload = onBeforeUnload;
function onBeforeUnload(oEvent) {
    // return a string to show the warning message (not every browser will use this string in the dialog)
    // or run the code you need when the user closes your page  
    if (origin_refPoints_added[0] === 0 ||
        origin_refPoints_added[1] === 0)
        return "You are closing the application without a complete work.\n" +
               "You have to define an 'Origin' and the 'Reference Points'.\n" +
               "Do you really want to exit the application?";       
}
