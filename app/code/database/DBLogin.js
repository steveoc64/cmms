;(function(){
	'use strict';

	angular.module('cmms').factory('DBLogin', function($resource,ServerName){
		return $resource(ServerName+'/login',{},{
			login: {method: 'POST'},
		})
	})

	angular.module('cmms').factory('DBLogout', function($resource,ServerName){
		return $resource(ServerName+'/logout',{},{
			logout: {method: 'GET'},
		})
	})

})();