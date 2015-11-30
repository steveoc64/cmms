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

})();

