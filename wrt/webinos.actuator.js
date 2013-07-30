/*******************************************************************************
*  Code contributed to the webinos project
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*  
*     http://www.apache.org/licenses/LICENSE-2.0
*  
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* 
* Copyright 2012 Andre Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {

	var actuatorListeners = new Array();
	
	
	/**
	 * Webinos Actuator service constructor (client side).
	 * @constructor
	 * @param obj Object containing displayName, api, etc.
	 */
	ActuatorModule = function(obj) {
		this.base = WebinosService;
		this.base(obj);
	};
	
	ActuatorModule.prototype = new WebinosService();

	/**
	 * To bind the service.
	 * @param bindCB BindCallback object.
	 */
	ActuatorModule.prototype.bind = function(bindCB) {
			var self = this;
			var rpc = webinos.rpcHandler.createRPC(this, "getStaticData", []);
			webinos.rpcHandler.executeRPC(rpc,
				function (result){
			
					self.range = result.range;
					self.unit = result.unit;
					self.vendor = result.vendor;
					self.version = result.version;
					if (typeof bindCB.onBind === 'function') {
						bindCB.onBind(self);
					}
				},
				function (error){
					
				}
			);
    };
	
	/**
	 * Launches an application.
	 * @param successCallback Success callback.
	 * @param errorCallback Error callback.
	 * @param applicationID Application ID to be launched.
	 * @param params Parameters for starting the application.
	 */
	ActuatorModule.prototype.setValue = function (value, successCB, errorCallback){
		var rpc = webinos.rpcHandler.createRPC(this, "setValue", value);		
		rpc.onEvent = function (actuatorEvent) {
        	successCB(actuatorEvent);
    	};
    	webinos.rpcHandler.registerCallbackObject(rpc);
    	webinos.rpcHandler.executeRPC(rpc);        
	};
    
    ActuatorModule.prototype.addEventListener = function(eventType, eventHandler, capture) {
        var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", eventType);
        actuatorListeners.push([rpc.id, eventHandler, this.id]);
        rpc.onEvent = function (actuatorEvent) {
            eventHandler(actuatorEvent);
        };
        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);
    };

    ActuatorModule.prototype.removeEventListener = function(eventType, eventHandler, capture) {
        for (var i = 0; i < actuatorListeners.length; i++) {
            if (actuatorListeners[i][1] == eventHandler && actuatorListeners[i][2] == this.id) {
                var arguments = new Array();
                arguments[0] = actuatorListeners[i][0];
                arguments[1] = eventType;
                var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
                webinos.rpcHandler.executeRPC(rpc);
                actuatorListeners.splice(i,1);
                break;
            }
        }
    };
}());