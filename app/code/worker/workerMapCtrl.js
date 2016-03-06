;(function() {
	'use strict';

	var base = 'worker'
	var app = angular.module('cmms')

	app.controller(base+'MapCtrl', 
		['$scope','$state','sites',
		function($scope,$state, sites){


		angular.extend(this, {
			sites: sites,
			goSite: function(row) {
				$state.go(base+'.machines',{id: row.ID})
			}
		})

	}])

})();