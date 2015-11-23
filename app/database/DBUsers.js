;(function(){
	'use strict';

	angular.module('cmms').factory('DBUsers', function($resource,ServerName){
		return $resource(ServerName+'/users/:id',{})
	})

})();