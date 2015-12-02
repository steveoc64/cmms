;(function(){
	'use strict';

	angular.module('cmms').factory('DBMachine', function($resource,ServerName,Session){
		return $resource(ServerName+'/machine/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

	angular.module('cmms').factory('DBComponents', function($resource,ServerName,Session){
		return $resource(ServerName+'/component/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

	angular.module('cmms').factory('DBMachineComponents', function($resource,ServerName,Session){
		return $resource(ServerName+'/machine/components/:id',{id: '@_id'},{
  		'query':  {method:'GET', isArray:true},
		})
	})

})();