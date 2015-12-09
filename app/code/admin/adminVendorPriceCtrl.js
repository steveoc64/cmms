;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'EditVendorPriceCtrl', 
		['$state','$stateParams','vendor','Session','$window','LxDialogService','parts','DBVendorPrices',
		function($state,$stateParams,vendor,Session,$window,LxDialogService,parts,DBVendorPrices){

		angular.extend(this, {
			session: Session,
			vendor: vendor,
			parts: parts,
			priceList: new DBVendorPrices(),
			formFields: getVendorPriceForm(),		
			logClass: logClass,
			submit: function() {
				console.log('Submitting a new price array')
				var newPriceArray = []
				angular.forEach(parts, function(v,k){
					// If nothing has been entered in the input field, then 
					// row.NewPrice will be undefined ... makes it easy to pick
					// out which fields have been modified
					if (angular.isDefined(v.NewPrice) && v.NewPrice > 0) {
						newPriceArray.push({
							PartID: v.ID,
							NewPrice: v.NewPrice,
							MinQty: v.MinQty,
							VendorCode: v.VendorCode
						})
					}
				})
				// Create a packet of data to send to the backend
				this.priceList.NewPriceArray = newPriceArray
				this.priceList._id = vendor.ID
				this.priceList.$insert(function() {
					$state.go(base+'.editvendor',{id: $stateParams.id})
				})
			},
			abort: function() {
				$window.history.go(-1)
			},
		})
	}])

})();