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
			}
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
				selected: "Name",
				options: [],
			}
		}
	}] // end fields

} // getcomponentFields

getComponentForm = function(sites,machines) {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'machine.StockCode'},
				{type: 'machine.Serialnum'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "6"},
			fields: [
				{
					type: 'machine.Site',
					templateOptions: {options: sites},
				},
				{
					type: 'machine.Machine',
					templateOptions: {options: machines},
				},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "8"},
			fields: [
				{type: 'machine.Name'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "12"},
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
	}] // end fields
}

})();

