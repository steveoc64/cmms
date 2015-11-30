;(function() {
	'use strict';

	angular.module('cmms').controller('floorCtrl', 
		['Session','machines',
		function(Session,machines){
	
		console.log('.. floorCtrl')
		angular.extend(this, {
			session: Session,
			machines: machines,
			getClass: function(row) {
				console.log('Getting class for',row.Status)
				switch (row.Status) {
					case 'Running':
						return "machine__running"
						break
					case 'Needs Attention':
						return "machine__attention"
						break
					case 'Stopped':
						return "machine__stopped"
						break
					case 'Maintenance Pending':
						return "machine__pending"
						break
					case 'New':
						return "machine__new"
						break
				}
			},

		})
		
	}])

})();