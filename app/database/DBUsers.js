;(function(){
	'use strict';

	angular.module('cmms').factory('DBUsers', function($resource,ServerName){
		return $resource(ServerName+'/users/:id',{},{
			'get':    {method:'GET'},
  		'save':   {method:'PATCH'},
  		'new':   {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})

})();