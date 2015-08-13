$.fn.viewConnector = (function () {

    var SFMatrix4f = x3dom.fields.SFMatrix4f;
    var SFVec3f = x3dom.fields.SFVec3f;

    return function (options, command) {


        var that = this,
            api = {
                connected : null,
                viewport  : 'both', // 'dest', 'origin'
                active    : null,
                resetActive : function() {
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
                    try {
                        var viewpoint = runtime.viewpoint(),
                            targetVp = target.viewpoint(),
                            targetCamera = target.viewpoint().getViewMatrix().inverse();

                        var upVector = targetVp.getViewMatrix().inverse().e1().normalize();

                        if( runtime.navigationType() == 'turntable') {
                            upVector = new SFVec3f(0,1,0);
                        }


                        var _vp = runtime.viewpoint();
                        var _VpPosition = _vp.getViewMatrix().inverse().e3()
                            distanceToCoR = _vp.getCenterOfRotation().subtract( _VpPosition ).length();

                        var pos;
                        var targetPos = targetCamera.e3().subtract( 
                                            targetVp.getCenterOfRotation()
                                        ).normalize().multiply(distanceToCoR)
                        console.log('+------------------------')
                        console.log(target)
                        console.log( upVector.normalize() )
                        // NOTE: when up vector changes should the we change and the targetPos and the forward vector???
                        pos = SFMatrix4f.lookAt( targetPos , new SFVec3f(0,0,0).cross(upVector), upVector); //new SFVec3f(0,1,0) );

                        _vp.setView( pos.inverse() )
                        runtime.triggerRedraw();

                    } catch(e) {
                        console.log(target)
                        console.error(e)
                    }
                },
                unbind : function() {
                }
            }

        if(this.data('viewConnector')) {
            api = this.data('viewConnector')
        } else {
            this.data('viewConnector', api)
        }

        // get the command;
        // if(typeof options == 'string' && _.include(_.keys(api), options) ) {
        //     command = options;
        //     return _.isFunction( api[command] ) ? api[command]() : api[command];
        // }

        //  _.extend(api, options);
        for(var k in options) {
            api[k] = options[k]
        }

        return api.bind()
    
    }

})()