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
				required: true,
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
			key: 'StartedAt',
			templateOptions: {
				type: 'text',
				label: 'Started At',
				disabled: true,
			}
		}	
	},{
		name: 'machine.StoppedAt',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'StoppedAt',
			templateOptions: {
				type: 'text',
				label: 'Stopped At',
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
			flex: {container: "row", item: "4"},
			fields: [
				{type: 'machine.IsRunning'},
				{type: 'machine.StoppedAt'},
				{type: 'machine.StartedAt'},
			]
		}
	}] // end fields

}

})();

