;(function(){
	'use strict';

	angular.module('cmms').factory('DBLogin', function($resource){
		return $resource('/login',{},{
			login: {method: 'POST'},
			logout: {method: 'DELETE'}
		})
			
		};
	})

})();