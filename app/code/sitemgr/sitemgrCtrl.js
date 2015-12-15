;(function() {
	'use strict';

	angular.module('cmms').controller('sitemgrCtrl', ['Session',function(Session){
	
		angular.extend(this, {
			session: Session
		})
		
	}])

})();