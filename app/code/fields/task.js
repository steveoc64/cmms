/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

getTaskFields = function() {

	return [{
		name: 'task.Freq',
		extends: 'lx-select',
		defaultOptions: {
			key: 'Freq',
			templateOptions: {
				placeholder: 'Frequency',
				options: ['Monthly','Weekly','Days','Yearly','Relative'],
				allowClear: false,
			}
		}
	},{
		name: 'task.Days',
		extends: 'lx-number',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Days',
			templateOptions: {
				label: 'Days',
				//required: true,
			}
		}			
	}] // end fields
} // getTaskFields

getTaskForm = function() {

	console.log("generating task form")
	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'task.Freq'},
				{type: 'task.Days'},
			]
		}
	}] // end fields
}

})();

