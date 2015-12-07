;(function(){
	'use strict';

	angular.module('cmms').factory('DBVendor', function($resource,ServerName,Session){
		return $resource(ServerName+'/vendor/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

})();