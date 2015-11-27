;(function() {
	'use strict';

	angular.module('cmms').controller('adminCtrl', function(Session){
	
		angular.extend(this, {
			session: Session
		})
		
	})

})();