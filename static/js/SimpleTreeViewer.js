/*
 * Class for managing a tree view.
 * The optional elementsCheckable flag indicates whether the tree nodes should be checkable (default: true).
 */
SimpleTreeViewer = function(treeElementID, settings){
    this.checkable = settings.checkable != null ? settings.checkable : true;

    this.treeID = treeElementID;
    this.treeSettings = settings;

    // Initialization of the treeview
    $("#"+treeElementID).dynatree(this.treeSettings);
};

/*
 * Adds a node to a group of the tree.
 * @param {String} id ID of the new node
 * @param {String} text Label of the new node
 * @param {String} group Label of the group where the node should be added - can be omitted to attach node to root
 *
 */
SimpleTreeViewer.prototype.addNode = function (id, text, group) {
    var groupNode;

    if (arguments.length >= 3)
    {
        groupNode = this.getNode(group);
    }
    else
    {
        groupNode = $("#" + this.treeID).dynatree("getRoot");
    }

    groupNode.addChild({
        title: text,
        key: id,
        //icon: "primitives.jpg",
        select: true,
        activate: true,
        hideCheckbox: !this.checkable
    });
};


SimpleTreeViewer.prototype.addGroup = function (id, text) {

    var rootNode = $("#" + this.treeID).dynatree("getRoot");

    var childNode = rootNode.addChild({
        title: text,
        key: id,
        isFolder: true,
        select: true,
        selectMode: 3,
        expand: true,
        hideCheckbox: !this.checkable
    });

    return childNode;
};


SimpleTreeViewer.prototype.collapseGroup = function(id)
{
    var node = $("#" + this.treeID).dynatree("getTree").getNodeByKey(id);

    if (node)
    {
        node.expand(false);
    }
};


SimpleTreeViewer.prototype.expandGroup = function(id)
{
    var node = $("#" + this.treeID).dynatree("getTree").getNodeByKey(id);

    if (node)
    {
        node.expand(true);
    }
};


SimpleTreeViewer.prototype.moveExistingNodeToGroup = function (node, group) {
    var node  = this.getNode(node);
    var group = this.getNode(group);

    node.move(group);
};


SimpleTreeViewer.prototype.getNode = function (id) {
    return $("#" + this.treeID).dynatree("getTree").getNodeByKey(id);
};


SimpleTreeViewer.prototype.removeNode = function (id) {
    var node = this.getNode(id);

    if (node)
        node.remove();
};


SimpleTreeViewer.prototype.rename = function (id, name) {
    var node = this.getNode(id);
    node.data.title = name;
    node.render();
};


SimpleTreeViewer.prototype.activate = function (id) {
    var tree = $("#" + this.treeID).dynatree("getTree");
    tree.activateKey(id);
};

SimpleTreeViewer.prototype.clear = function()
{
    var rootNode = $("#" + this.treeID).dynatree("getRoot");
    rootNode.removeChildren();
}


/* OLD recursive selection

 /*function recursiveSelection(tempNode){
 if (tempNode.data.isFolder){
 for (var i = 0; i < tempNode.childList.length; i++){
 recursiveSelection(tempNode.childList[i]);
 }
 }
 else {
 g_editor.getPrimitiveManager().setPrimitiveVisibility(tempNode.data.key, tempNode.isSelected());

 if (tempNode.isActive()){
 if (tempNode.isSelected())
 g_editor.getPrimitiveManager().highlightCurrentObject(true);
 }
 }

 }

 recursiveSelection(node);
 //if (!node.data.isFolder)
 //    g_editor.getPrimitiveManager().setPrimitiveVisibility(node.data.key, select);
 */
