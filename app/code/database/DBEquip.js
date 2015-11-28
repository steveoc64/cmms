;(function(){
	'use strict';

	angular.module('cmms').factory('DBEquip', function($resource,ServerName,Session){
		return $resource(ServerName+'/equip/:id',{id: '@_id'},{
			'get':    {method:'GET'},
  		'update': {method:'PUT'},
  		'insert': {method:'POST'},
  		'query':  {method:'GET', isArray:true},
		  'delete': {method:'DELETE'}
		})
	})


})();