;(function(){
	'use strict';

	angular.module('cmms').factory('DBEvent', function($resource,ServerName){
		return $resource(ServerName+'/events/:id', {id:'@_id'}, {
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

	angular.module('cmms').factory('DBRaiseMachineEvent', function($resource,ServerName){
		return $resource(ServerName+'/event/raise/machine',{}, {
			'raise': {method: 'POST'},
		})
	})

	angular.module('cmms').factory('DBEventCost', function($resource,ServerName){
		return $resource(ServerName+'/event/cost',{}, {
			'add': {method: 'POST'},
		})
	})

	angular.module('cmms').factory('DBRaiseToolEvent', function($resource,ServerName){
		return $resource(ServerName+'/event/raise/tool',{}, {
			'raise': {method: 'POST'},
		})
	})

	angular.module('cmms').factory('DBMachineEvents', function($resource,ServerName,Session){
		return $resource(ServerName+'/machine/events/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

	angular.module('cmms').factory('DBComponentEvents', function($resource,ServerName,Session){
		return $resource(ServerName+'/tool/events/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

})();