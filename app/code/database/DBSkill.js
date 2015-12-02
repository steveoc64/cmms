;(function(){
	'use strict';

	angular.module('cmms').factory('DBSkill', function($resource,ServerName,Session){
		return $resource(ServerName+'/skills/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

})();