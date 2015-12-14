;(function() {
	'use strict';

	angular.module('cmms').controller('adminCtrl', 
		['Session','socket',
		function(Session,socket){
	
		angular.extend(this, {
			session: Session
		})
		
	}])

})();