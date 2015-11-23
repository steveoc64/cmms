;(function() {
	'use strict';

	angular.module('cmms').controller('landingCtrl',
	 function(Session, $state){
	
		console.log('.. landingCtrl')
		
		//console.log('Entering landingCtrl with session',Session)
		switch(Session.role) {
			case 'admin':
				console.log('redirect to admin.dashboard')
				$state.go('admin.dashboard')
				break
			case 'worker':
				$state.go('worker.dashboard')
				break
			case 'vendor':
				$state.go('vendor.dashboard')
				break
			default:
				console.log('Unknown Role',Session.role)
				Session.logout()
				$state.go('/')
				break
		}
	})

})();