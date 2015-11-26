/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

getUserFields = function() {

	return [{
		name: 'user.Username',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Username',
			templateOptions: {
				type: 'text',
				label: 'Username',
				icon: 'mdi-account',
				minlength: 3,
				maxlength: 16,
				required: true,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			}
		}	
	},{
		name: 'user.Password',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Passwd',
			templateOptions: {
				type: 'text',
				label: 'Password',
				icon: 'mdi-barcode',
				minlength: 6,
				maxlength: 12,
				requried: true,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			}
		}	
	},{
		name: 'user.Name',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Name',
			templateOptions: {
				type: 'text',
				label: 'Name',
				required: true,
			}
		}	
	},{
		name: 'user.Email',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Email',
			templateOptions: {
				type: 'email',
				label: 'Email',
				icon: 'email',
				required: true,
			}
		}	
	},{
		name: 'user.Address',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'Address',
			templateOptions: {
				type: 'text',
				label: 'Address',
				icon: 'home',
			}
		}	
	},{
		name: 'user.SMS',
		extends: 'lx-input',
		wrapper: 'lx-wrapper-errors',
		defaultOptions: {
			key: 'SMS',
			templateOptions: {
				type: 'text',
				label: 'SMS',
				icon: 'cellphone-basic',
				numeric: true,
				minlength: 10,
				maxlength: 10,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			}
		}
	},{
		name: 'user.Role',
		extends: 'lx-select',
		defaultOptions: {
			key: 'Role',
			templateOptions: {
				placeholder: "Select Role",
				options: ['Public','Worker','Vendor','Service Contractor','Site Manager','Admin'],	
				required: true,
			}
		}
	},{
		name: 'user.RoleDisplay',
		extends: 'lx-input',
		defaultOptions: {
			key: 'Role',
			templateOptions: {
				type: 'text',
				disabled: true,
			}
		}

	}]

} // getUserFields

getUserForm = function() {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'user.Username'},
				{type: 'user.Password'}
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'user.Name'},
				{type: 'user.Email'}
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: {container: "row", item: "12"},
			fields: [
				{type: 'user.Address'}
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'user.SMS'},
				{type: 'user.Role'},
			]
		}
	}]

}

})();

