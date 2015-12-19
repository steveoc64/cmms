/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

getSiteFields = function() {

	return [{
		name: 'site.Name',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Name',
			templateOptions: {
				type: 'text',
				label: 'Site Name',
				icon: 'factory',
				minlength: 3,
				maxlength: 64,
				required: true,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			}
		}	
	},{
		name: 'site.Address',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Address',
			templateOptions: {
				type: 'text',
				label: 'Address',
				minlength: 6,
				maxlength: 128,
				requried: true,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			}
		}	
	},{
		name: 'site.Phone',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Phone',
			templateOptions: {
				type: 'text',
				label: 'Phone',
				icon: 'phone',
				required: true,
			}
		}	
	},{
		name: 'site.Fax',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Fax',
			templateOptions: {
				type: 'text',
				label: 'Fax',
				icon: 'fax',
				required: true,
			}
		}	
	},{
		name: 'site.ParentSite',
		extends: 'lx-select',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'ParentSiteSelection',
			templateOptions: {
				type: 'select',
				placeholder: 'Parent Site',
				icon: 'factory',
				selected: 'Name',
				choice: 'Name',
				allowClear: true,
			},
			controller: ['$scope','DBSite',function($scope,DBSite) {
				$scope.to.options = DBSite.query()
				$scope.model.$promise.then(function() {
					$scope.model.ParentSiteSelection = $scope.model.ParentSiteName					
				})

				$scope.$watch('model.ParentSiteSelection', function(newVal,oldVal,vm) {
					if (newVal && angular.isDefined(newVal) && angular.isDefined(newVal.ID)) {
						vm.model.ParentSite = newVal.ID
						vm.model.ParentSiteName = newVal.Name
					}
				})

			}]
		}	
	},{
		name: 'site.StockSite',
		extends: 'lx-select',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'StockSiteSelection',
			templateOptions: {
				type: 'select',
				placeholder: 'Stock Provider Site',
				icon: 'factory',
				selected: 'Name',
				choice: 'Name',
				allowClear: true,
			},
			controller: ['$scope','DBSite',function($scope,DBSite) {
				$scope.to.options = DBSite.query()
				$scope.model.$promise.then(function() {
					$scope.model.StockSiteSelection = $scope.model.StockSiteName					
				})

				$scope.$watch('model.StockSiteSelection', function(newVal,oldVal,vm) {
					if (newVal && angular.isDefined(newVal) && angular.isDefined(newVal.ID)) {
						vm.model.StockSite = newVal.ID
						vm.model.StockSiteName = newVal.Name
					}
				})
			}]
		}	
	}] // end fields

} // getUserFields

getSiteForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "4"},
			fields: [
				{type: 'site.Name'},
				{type: 'site.ParentSite'},
				{type: 'site.StockSite'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'site.Address'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "6"},
			fields: [
				{type: 'site.Phone'},
				{type: 'site.Fax'}
			]
		}
	}] // end fields

}

})();

