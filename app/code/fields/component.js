/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

getComponentFields = function() {

	return [{
		name: 'component.Name',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Name',
			templateOptions: {
				type: 'text',
				label: 'Name',
			}
		}	
	},{
		name: 'component.Descr',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Descr',
			templateOptions: {
				type: 'text',
				label: 'Description',
			}
		}	
	},{
		name: 'component.PendingDescr',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'PendingDescr',
			templateOptions: {
				type: 'text',
				label: 'Description of Pending Maintenance',
			}
		}	
	},{
		name: 'component.AlertDescr',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'AlertDescr',
			templateOptions: {
				type: 'text',
				label: 'Condition of the Tool that needs attention',
			}
		}	
	},{
		name: 'component.HaltDescr',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'HaltDescr',
			templateOptions: {
				type: 'text',
				label: 'Reason for Halting the machine because of this tool',
			}
		}	
	},{
		name: 'component.ClearDescr',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'ClearDescr',
			templateOptions: {
				type: 'text',
				label: 'Comment on clearing the tool',
			}
		}	
	},{
		name: 'component.Qty',
		extends: 'lx-number',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Qty',
			templateOptions: {
				label: 'Qty',
			}
		}	
	},{
		name: 'component.Make',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Make',
			templateOptions: {
				type: 'text',
				label: 'Make',
			}
		}	
	},{
		name: 'component.Model',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Model',
			templateOptions: {
				type: 'text',
				label: 'Model',
			}
		}	
	},{
		name: 'component.Serialnum',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Serialnum',
			templateOptions: {
				type: 'text',
				label: 'Serial #',
				//required: true,
			}
		}	
	},{
		name: 'component.StockCode',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'StockCode',
			templateOptions: {
				type: 'text',
				label: 'Tool #',
				//required: true,
			}
		}	
	},{
		name: 'component.Position',
		extends: 'lx-number',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Position',
			templateOptions: {
				label: 'Position',
			}
		}	
	},{
		name: 'component.Site',
		extends: 'lx-select',
		defaultOptions: {
			key: 'Site',
			templateOptions: {
				placeholder: "Select Site",
				space: true,
				choice: "Name",
				selected: "Name",
				options: [],
				required: true,
			},
			controller: ['$scope','DBSite',function($scope, DBSite) {
				$scope.to.options = DBSite.query()

				if (angular.isDefined($scope.model.$promise)) {
					$scope.model.$promise.then(function(){
						$scope.model.Site = $scope.model.SiteName					
					})
				}

				$scope.$watch('model.Site', function(newVal,oldVal,vm) {
					//console.log('new site val set to',newVal,'and siteid is',vm.model.SiteId)
					if (angular.isDefined(newVal) && angular.isDefined(newVal.ID)) {
						vm.model.SiteId = newVal.ID
						vm.model.SiteName = newVal.Name
					}
				})

			}]
		}
	},{
		name: 'component.Machine',
		extends: 'lx-select',
		defaultOptions: {
			key: 'Machine',
			templateOptions: {
				placeholder: "Select Machine",
				space: true,
				choice: "Name",
				choice2: "SiteName",
				selected: "Name",
				options: [],
				required: true,
			},
			controller: ['$scope','DBMachine',function($scope, DBMachine) {
				$scope.machines = DBMachine.query()
				if (angular.isDefined($scope.model.$promise)) {
					$scope.model.$promise.then(function() {
						$scope.model.Machine = $scope.model.MachineName					
					})					
				}
				$scope.to.options = []

				$scope.$watch('model.Machine', function(newVal,oldVal,vm) {
					if (angular.isDefined(newVal) && angular.isDefined(newVal.ID)) {
						vm.model.MachineID = newVal.ID
						vm.model.MachineName = newVal.Name
					}
				})

				$scope.$watch('model.Site', function(newVal, oldVal, scopeV) {
					if (angular.isDefined(newVal)) {
						$scope.to.options = []
						angular.forEach($scope.machines, function(v,k){
							if (v.SiteId == newVal.ID) {
								$scope.to.options.push(v)
							}
						})						
					}
				})
			}]
		}
	}] // end fields

} // getcomponentFields

getComponentForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'component.StockCode'},
				{type: 'component.Serialnum'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "3"},
			fields: [
				{type: 'component.Site'},
				{type: 'component.Machine'},
				{type: 'component.Position'},
				{type: 'component.Qty'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "8"},
			fields: [
				{type: 'component.Name'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "12"},
			fields: [
				{type: 'component.Descr'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'component.Make'},
				{type: 'component.Model'},
			]
		}
	}] // end fields
}

getComponentWorkerForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "3"},
			fields: [
				{type: 'component.Machine'},
				{type: 'component.Position'},
				{type: 'component.Qty'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "8"},
			fields: [
				{type: 'component.Name'},
			]
		}
	}] // end fields
}

getComponentPendingForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'component.PendingDescr'},
			]
		}
	}] // end fields
}

getComponentAlertForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'component.AlertDescr'},
			]
		}
	}] // end fields
}

getComponentHaltForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'component.HaltDescr'},
			]
		}
	}] // end fields
}

getComponentClearForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'component.ClearDescr'},
			]
		}
	}] // end fields
}

})();

