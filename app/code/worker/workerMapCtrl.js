;(function() {
	'use strict';

	var base = 'worker'
	var app = angular.module('cmms')

	app.controller(base+'MapCtrl', 
		['$scope','$state','sites','siteStatus',
		function($scope,$state, sites, siteStatus){

		angular.extend(this, {
			sites: sites,
			siteStatus: siteStatus,
			goSite: function(row) {
				$state.go(base+'.machines',{id: row.ID})
			}
		})

	}])

})();