$.fn.viewConnector = (function () {

    var SFMatrix4f = x3dom.fields.SFMatrix4f;
    var SFVec3f = x3dom.fields.SFVec3f;

    return function (options, command) {


        var that = this,
            api = {
                connected : null,
                viewport : 'both', // 'dest', 'origin'
                active:null,
                resetActive: function() {
                    api.active = null;
                    clearTimeout(api._reset)
                },
                bind : function() {
                    var $dest = $( typeof api.connected == 'string' ? '#' + api.connected : api.connected),
                        $origin = $(that);

                    if(api.viewport != 'origin') {
                        try {
                            $dest.find('viewpoint,orthoviewpoint').on('viewpointChanged', function(event) {

                                if($dest != api.active && api.active != null) return;
                                api.active = $dest;
                                clearTimeout(api._reset)
                                api._reset = setTimeout(api.resetActive, 60)

                                var e = event.originalEvent;
                                api.setOrientation($origin[0].runtime, $dest[0].runtime, e)
                            })
                        } catch(e) {
                            console.error(e)
                        }
                        
                    }

                    if(api.viewport != 'dest') {
                        try {
                            $origin.find('viewpoint,orthoviewpoint').on('viewpointChanged', function(event) {
                                if($origin != api.active && api.active != null) return;
                                api.active = $origin;
                                clearTimeout(api._reset)
                                api._reset = setTimeout(api.resetActive, 60)

                                var e = event.originalEvent;
                                api.setOrientation($dest[0].runtime, $origin[0].runtime, e)
                            })
                        } catch(e) {
                            console.error(e)   
                        }
                    }

                    return that;
                },
                setOrientation : function(runtime, target, event) {
                    


                    var viewpoint = runtime.viewpoint(),
                        _xmlNode = viewpoint._xmlNode,
                        position,
                        orientation;

                    
                    if( target.canvas.doc._viewarea.isAnimating() ) return;
                    

                    if(!_xmlNode) {
                        
                        throw "No <viewpoint> set";
                    }

                    try {
                        _xmlNode = $(_xmlNode);

                        var position = SFVec3f.parse( _xmlNode.attr('position') || "0,0,0" )
                        var vpLength = SFVec3f.parse( _xmlNode.attr('position') || "0,0,0" ).subtract( viewpoint.getCenterOfRotation() ).length();

                        // Pos(t1) = CoR(t1) + dist( CoR(t2) - Pos(t2)  )
                        // normalize returns the unit vector ( direction vector )
                        position = viewpoint.getCenterOfRotation()
                            .add( 
                                //distance between CoR and the target viewpoint
                                event.position
                                .subtract( 
                                    target.viewpoint().getCenterOfRotation()
                                )
                            .normalize()
                            .multiply(vpLength) 
                        );
                         _xmlNode.attr('orientation', event.orientation)
                            .attr('position', position )

                    } catch(e) {
                        console.error(e)
                    }
                   
                    // Disable the mouse button pan - but it has some issues when rotating with CoR != [0,0,0]
                    // viewpoint._viewMatrix._03 =
                    // viewpoint._viewMatrix._13 = 0;
                    // viewpoint._viewMatrix._23 = -vpLength;

                    // runtime.triggerRedraw();
                },
                unbind : function() {
                }
            }

        if(this.data('x3dsync')) {
            api = this.data('x3dsync')
        } else {
            this.data('x3dsync', api)
        }

        // get the command;
        if(typeof options == 'string' && _.include(_.keys(api), options) ) {
            command = options;
            return _.isFunction( api[command] ) ? api[command]() : api[command];
        }

//        _.extend(api, options);
        for(var k in options) {
            api[k] = options[k]
        }

        return api.bind()
    
    }

})()