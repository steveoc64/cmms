;(function() {
	'use strict';

	angular.module('cmms').controller('adminCtrl', function(Session){
	
		console.log('.. adminCtrl')

		angular.extend(this, {
			session: Session
		})
		
	})

})();