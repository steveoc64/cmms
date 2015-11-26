;(function() {
	'use strict';

	angular.module('cmms').controller('sitemgrCtrl', function(Session){
	
		console.log('.. sitemgrCtrl')

		angular.extend(this, {
			session: Session
		})
		
	})

})();