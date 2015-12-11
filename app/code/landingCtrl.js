;(function() {
	'use strict';

	angular.module('cmms').controller('landingCtrl',
	 function(Session, $state){
	
		//console.log('Entering landingCtrl with session',Session)
		switch(Session.Role) {
			case 'Admin':
				$state.go('admin.dashboard')
				break
			case 'Site Manager':
				$state.go('sitemgr.dashboard')
				break
			case 'Worker':
				$state.go('worker.machines')
				break
			case 'Vendor':
				$state.go('vendor.dashboard')
				break
			case 'Service Contractor':
				$state.go('svcContractor.dashboard')
				break
			case 'Floor':
				$state.go('floor')
				break
			default:
				console.log('Unknown Role',Session.Role)
				Session.logout()
				$state.go('/')
				break
		}
	})

})();