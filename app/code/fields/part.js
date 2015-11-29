/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

getPartFields = function() {

	return [{
		name: 'part.Name',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Name',
			templateOptions: {
				type: 'text',
				label: 'Part Name',
				minlength: 3,
				maxlength: 64,
				required: true,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			}
		}	
	},{
		name: 'part.Descr',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Descr',
			templateOptions: {
				type: 'text',
				label: 'Description',
				minlength: 6,
				maxlength: 128,
				requried: true,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			}
		}	
	},{
		name: 'part.StockCode',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'StockCode',
			templateOptions: {
				type: 'text',
				label: 'Stock Code',
				required: true,
				minlength: 6,
				maxlength: 64,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			}
		}	
	},{
		name: 'part.ReorderStocklevel',
		extends: 'lx-number',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'ReorderStocklevel',
			templateOptions: {
				label: 'Reorder Level',
				required: true,
			}
		}	
	},{
		name: 'part.ReorderQty',
		extends: 'lx-number',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'ReorderQty',
			templateOptions: {
				label: 'Reorder Qty',
				required: true,
			}
		}	
	},{
		name: 'part.LatestPrice',
		extends: 'lx-number',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'LatestPrice',
			templateOptions: {
				label: 'Latest Price',
				step: 'any',
				required: true,
			}
		}	
	},{
		name: 'part.QtyType',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'QtyType',
			templateOptions: {
				type: 'text',
				label: 'Qty Type (eg: each, meters, etc)',
				required: true,
			}
		}	
	},{
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
				selected: "ID",
				options: [],
			}
		}
	}] // end fields

} // getPartFields

getPartForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "4"},
			fields: [
				{type: 'part.StockCode'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'part.Name'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "12"},
			fields: [
				{type: 'part.Descr'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "4"},
			fields: [
				{type: 'part.QtyType'},
				{type: 'part.LatestPrice'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "4"},
			fields: [
				{type: 'part.ReorderStocklevel'},
				{type: 'part.ReorderQty'},
			]
		}
	}] // end fields

}

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

