;(function(){
	'use strict';

	angular.module('cmms').factory('DBLogin', function($resource,ServerName){
		return $resource(ServerName+'/login/:id',{},{
			login: {method: 'POST'},
			logout: {method: 'DELETE', params:{id: '@id'}}
		})
	})

})();