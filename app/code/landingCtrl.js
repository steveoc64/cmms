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
				console.log("worker landing page", Session)
				if (Session.Sites.length == 1) {
					$state.go('worker.machines',{id: Session.Sites[0]})					
				} else {
					$state.go('worker.map')					
				}
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