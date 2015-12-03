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
				icon: 'account',
				minlength: 3,
				maxlength: 16,
				required: true,
				autoGenUsername: false,
			},
			ngModelAttrs: {
				maxlength: { attribute: "maxlength"}
			},
			controller: ['$scope',function($scope) {

				angular.extend($scope, {
					camelize:  function(str) {
					  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
					  	return match.toUpperCase()
					  });
					}
				})

				if ($scope.to.autoGenUsername) {
					$scope.$watch('model.Username', function(newV,oldV,vm){
						if (angular.isDefined(newV)) {
							vm.model.Passwd = newV.replace('.','').substring(0,6) + '123'
							vm.model.Email = newV.replace(' ','.')+'@sbsinternational.com.au'
							vm.model.Name = $scope.camelize(newV.replace('.',' '))
						}
					})
				}
			}]
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
				options: ['Public','Floor','Worker','Vendor','Service Contractor','Site Manager','Admin'],	
				required: true,
			},
			controller: ['$scope',function($scope) {
				if ($scope.to.autoGenUsername) {
					$scope.model.Role = 'Worker'
				}
			}]
		}
	},{
		name: 'user.Site',
		extends: 'lx-select',
		defaultOptions: {
			key: 'Sites',
			templateOptions: {
				placeholder: "Select Sites",
				space: true,
				multiple: true,
				choice: "Name",
				selected: "Name",
				options: [],
			},
			controller: ['$scope','DBSite',function($scope,DBSite) {
				$scope.to.options = DBSite.query()
			}]
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
	},{
		name: 'user.Skills',
		extends: 'lx-select',
		defaultOptions: {
			key: 'Skills',
			templateOptions: {
				placeholder: "Select Skills",
				space: true,
				multiple: true,
				choice: "Name",
				selected: "Name",
				options: [],
			},
			controller: ['$scope','DBSkill',function($scope,DBSkill) {
				$scope.to.options = DBSkill.query()
			}]
		}
	},{
		name: 'skill.Name',
		extends: 'lx-input',
		defaultOptions: {
			key: 'Name',
			templateOptions: {
				type: 'text',
				label: 'Name',
			}
		}

	}] // end fields

} // getUserFields

getUserForm = function(autoGenUsername) {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'user.Username', 
				 templateOptions: {
				 	autoGenUsername: autoGenUsername
				 }
				},
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
			flex: {container: "row", item: "6"},
			fields: [
				{type: 'user.Address'},
				{type: 'user.SMS'},
			]
		}
	},{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "4"},
			fields: [
				{type: 'user.Site'},
				{type: 'user.Skills'},
				{type: 'user.Role'},
			]
		}
	}]
} // getUserForm

getSkillForm = function(fixedLabels) {

	return [{
		type: 'lx-flex',
		templateOptions: {
			flex: { container: "row", item: "6"},
			fields: [
				{type: 'skill.Name'},
			]
		}
	}]
} // getSkillsForm

})();

