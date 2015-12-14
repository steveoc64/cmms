;(function(){
	'use strict';

	angular.module('cmms').factory('DBRaiseMachineEvent', function($resource,ServerName){
		return $resource(ServerName+'/event/raise/machine',{}, {
			raise: {method: 'POST'},
		})
	})

	angular.module('cmms').factory('DBRaiseToolEvent', function($resource,ServerName){
		return $resource(ServerName+'/event/raise/tool',{}, {
			raise: {method: 'POST'},
		})
	})


})();