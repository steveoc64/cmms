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
				label: 'Serial #',
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
			}
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
			}
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
			}
		}
	}] // end fields

} // getMachineFields

getMachineForm = function(sites) {

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
				{
					type: 'machine.Site',
					templateOptions: {options: sites},
				},
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

})();

