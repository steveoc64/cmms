;(function(){
	'use strict';

	angular.module('cmms').factory('DBUsers', function($resource,ServerName,Session){
		return $resource(ServerName+'/users/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

	angular.module('cmms').factory('DBUserlog', function($resource,ServerName,Session){
		return $resource(ServerName+'/userlog/:id',{id: '@_id'},{
			'query':    {method:'GET', isArray:true}
		})
	})

})();