;(function() {
	'use strict';

	angular.module('cmms').controller('adminCtrl', 
		['Session',
		function(Session){
	
		angular.extend(this, {
			session: Session
		})
		
	}])

})();