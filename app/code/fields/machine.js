/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

getMachineFields = function() {

	return [{
		name: 'machine.Name',
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
		name: 'machine.Descr',
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
		name: 'machine.AlertDescr',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'AlertDescr',
			templateOptions: {
				type: 'text',
				label: 'Description of Alert',
			}
		}	
	},{
		name: 'machine.HaltDescr',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'HaltDescr',
			templateOptions: {
				type: 'text',
				label: 'Reason for Halting the Machine',
			}
		}	
	},{
		name: 'machine.Make',
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
		name: 'machine.Model',
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
		name: 'machine.Serialnum',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Serialnum',
			templateOptions: {
				type: 'text',
				label: 'Machine #',
				//required: true,
			}
		}	
	},{
		name: 'machine.Status',
		extends: 'lx-select',
		defaultOptions: {
			key: 'Status',
			templateOptions: {
				placeholder: 'Status',
				options: ['Running','Needs Attention','Stopped','Maintenance Pending','New'],
				allowClear: false,
			}
		}	
	},{
		name: 'machine.StatusImage',
		extends: 'lx-input',
		defaultOptions: {
			key: 'StatusImage',
			templateOptions: {
				type: 'text',
				placeholder: 'Add an image here to denote the status',
				disabled: true,
			}
		}	
	},{
		name: 'machine.IsRunning',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'IsRunning',
			templateOptions: {
				type: 'text',
				label: 'Is Running ?',
				disabled: true,
			}
		}	
	},{
		name: 'machine.StartedAt',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Started',
			templateOptions: {
				type: 'text',
				label: 'Started',
				disabled: true,
			},
			controller: ['$scope',function($scope) {
				if (!$scope.model.Started) {
					$scope.model.Started = 'N/A'
				}
			}]
		}	
	},{
		name: 'machine.AlertAt',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Alert',
			templateOptions: {
				type: 'text',
				label: 'Alert',
				disabled: true,
			},
			controller: ['$scope',function($scope) {
				if (!$scope.model.Alert) {
					$scope.model.Alert = 'N/A'
				}
			}]
		}	
	},{
		name: 'machine.StoppedAt',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Stopped',
			templateOptions: {
				type: 'text',
				label: 'Stopped',
				disabled: true,
			},
			controller: ['$scope',function($scope) {
				if (!$scope.model.Stopped) {
					$scope.model.Stopped = 'N/A'
				}
			}]
		}	
	},{
		name: 'machine.SiteName',
		extends: 'lx-input',
		defaultOptions: {
			key: 'SiteName',
			templateOptions: {
				type: 'text',
				disabled: true
			}
		}
	},{
		name: 'machine.Site',
		extends: 'lx-select',
		defaultOptions: {
			key: 'Site',
			templateOptions: {
				placeholder: "Select Site",
				space: true,
				choice: "Name",
				selected: "Name",
				options: [],
			},
			controller: ['$scope','DBSite',function($scope,DBSite) {
				$scope.to.options = DBSite.query()
				$scope.model.$promise.then(function() {
					$scope.model.Site = $scope.model.SiteName
				})
			}]
		}
	}] // end fields

} // getMachineFields

getMachineForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'machine.Name'},
				{type: 'machine.Serialnum'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "4"},
			fields: [
				{type: 'machine.Site'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "8"},
			fields: [
				{type: 'machine.Status'},
				{type: 'machine.StatusImage'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'machine.Descr'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'machine.Make'},
				{type: 'machine.Model'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "3"},
			fields: [
				{type: 'machine.IsRunning'},
				{type: 'machine.StartedAt'},
				{type: 'machine.AlertAt'},
				{type: 'machine.StoppedAt'},
			]
		}
	}] // end fields

}

getMachineWorkerForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'machine.Name'},
				{type: 'machine.SiteName'},			
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "8"},
			fields: [
				{type: 'machine.Status'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "3"},
			fields: [
				{type: 'machine.IsRunning'},
				{type: 'machine.StartedAt'},
				{type: 'machine.AlertAt'},
				{type: 'machine.StoppedAt'},
			]
		}
	}] // end fields

}

getMachineAlertForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'machine.AlertDescr'},
			]
		}
	}] // end fields

}

getMachineHaltForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'machine.HaltDescr'},
			]
		}
	}] // end fields

}

})();

