;(function() {
	'use strict';

	angular.module('cmms').controller('sitemgrCtrl', ['Session','socket',function(Session,socket){
	
		angular.extend(this, {
			session: Session
		})
		
	}])

})();