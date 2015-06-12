/*
 * The EventCallbacks class serves controller for different editor events
 * it allows to add events and callbacks to the editor
 *
 */
EventSystem = function(eventList)
{
    this._callBackMap = {};

    this._addEvent = function(eventName)
    {
        if(this._callBackMap[eventName] == null)
        {
            var entry =
            {
                name : eventName,
                callbacks : []
            };

            this._callBackMap[eventName] = entry;
        }
    }


    for(var i = 0, n = eventList.length; i < n; ++i)
    {
        this._addEvent(eventList[i]);
    }
};

//----------------------------------------------------------------------------------------------------------------------

EventSystem.prototype.registerCallback = function(eventName, callback)
{
    if(this._callBackMap[eventName] != null)
        this._callBackMap[eventName].callbacks.push(callback);
};

//----------------------------------------------------------------------------------------------------------------------

EventSystem.prototype.triggerEvent = function(eventName)
{
    if(this._callBackMap[eventName] != null)
    {
        var callbacks = this._callBackMap[eventName].callbacks;
        for(var i = 0, n = callbacks.length; i < n; ++i)
        {
            callbacks[i]();
        }
    }
}