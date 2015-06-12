/**
 * Created by Timo on 17.11.13.
 */
(function($){

    function ViewConnector (scene, options)
    {
        var that = this;

        /**
         * Initialize the ViewConnector
         */
        this.init = function ()
        {
            //Set default options
            this._options = $.extend( {}, $.fn.viewConnector.defaults, options );

            //Check if we have a connected scene
            if (this._options.connected == null)
            {
                //Throw error
                console.error("[ViewConnector] No connected scene available!");
            }
            else
            {
                //Set scene
                this._scene = scene;

                //Set connected scene
                this._connectedScene = document.getElementById(this._options.connected);

                //Set viewpoint
                this._viewMatrix = this._scene.runtime.viewpoint()._viewMatrix;

                //Add viewpointChanged listeners
                this.addViewpointChangedListeners();
            }
        };

        /**
         * Add viewpointChanged listeners to all viewpoints that are bind to the connected scene
         */
        this.addViewpointChangedListeners = function()
        {
            var bindBag = this._connectedScene.runtime.viewpoint()._stack._bindBag;

            for (var i=0; i<bindBag.length; i++)
            {
                bindBag[i]._xmlNode.addEventListener("viewpointChanged", that.viewPointChangedHandler);
            }
        };

        /**
         * Handles viewpointChanged events from all viewpoints that are bind to the connected scene
         * @param event
         */
        this.viewPointChangedHandler = function(event)
        {
            //Update position
            if (that._options.connectPosition)
            {
                that._viewMatrix._03 = event.matrix._03;
                that._viewMatrix._13 = event.matrix._13;
                that._viewMatrix._23 = event.matrix._23;
            }

            //Update orientation
            if (that._options.connectOrientation)
            {
                that._viewMatrix._00 = event.matrix._00;
                that._viewMatrix._01 = event.matrix._01;
                that._viewMatrix._02 = event.matrix._02;

                that._viewMatrix._10 = event.matrix._10;
                that._viewMatrix._11 = event.matrix._11;
                that._viewMatrix._12 = event.matrix._12;

                that._viewMatrix._20 = event.matrix._20;
                that._viewMatrix._21 = event.matrix._21;
                that._viewMatrix._22 = event.matrix._22;

                that._viewMatrix._30 = event.matrix._30;
                that._viewMatrix._31 = event.matrix._31;
                that._viewMatrix._32 = event.matrix._32;
            }

            //Trigger redraw
            that._scene.runtime.triggerRedraw();
        };

        //Finally initialize the editor
        this.init();
    }

    $.fn.viewConnector = function(options) {
        var args = arguments;

        if (options === undefined || typeof options === 'object') {
            // Creates a new plugin instance, for each selected element, and
            // stores a reference within the element's data
            return this.each(function() {
                if (!$.data(this, 'ViewConnector')) {
                    $.data(this, 'ViewConnector', new ViewConnector(this, options));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            // Call a public plugin method (not starting with an underscore) for each
            // selected element.
            if (Array.prototype.slice.call(args, 1).length == 0 && $.inArray(options, $.fn.editor2D.getters) != -1) {
                // If the user does not pass any arguments and the method allows to
                // work as a getter then break the chainability so we can return a value
                // instead the element reference.
                var instance = $.data(this[0], 'ViewConnector');
                return instance[options].apply(instance, Array.prototype.slice.call(args, 1));
            } else {
                // Invoke the specified method on each selected element
                return this.each(function() {
                    var instance = $.data(this, 'ViewConnector');
                    if (instance instanceof ViewConnector && typeof instance[options] === 'function') {
                        instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                    }
                });
            }
        }
        return null;
    };

    // Plugin defaults – added as a property on our plugin function.
    $.fn.viewConnector.defaults = {
        connected: null,
        connectPosition: true,
        connectOrientation: true
    };
})(jQuery);