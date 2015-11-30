;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'SkillCtrl', 
		['$state','skills','Session','LxDialogService','logs','LxNotificationService',
		function($state, skills, Session, LxDialogService, logs,LxNotificationService){
	
		angular.extend(this, {
			skills: skills,
			session: Session,
			logs: logs,
			logClass: logClass,
			sortField: 'Name',
			sortDir: false,
			setSort: function(field) {
				if (this.sortField == field) {
					this.sortDir = !this.sortDir
				}
				this.sortField = field
			},		
			getClass: function(row) {
				if (row.selected) {
					return "data-table__selectable-row--is-selected"
				}
			},
			clickedRow: function(row) {
				if (!angular.isDefined(row.selected)) {
					row.selected = false
				}
				row.selected = !row.selected
			},
			clickEdit: function(row) {
				$state.go(base+'.editskill',{id: row.ID})
			},
			showLogs: function() {
				LxDialogService.open('skillLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.skills, function(vv,kk){
						if (vv.selected && v.RefID == vv.ID) {
							l.push(v)
						}
					})
				})
				// l now contains filtered logs
				return l
			},
			deleteSelected: function() {
				var vm = this
				LxNotificationService.confirm('Delete Skills',
					'Do you want to delete all the selected skills ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.skills, function(v,k){
								if (v.selected) {
									v.$delete({id: v.ID})
								}
							})
							// Now refresh the users list
							$state.reload()
						}
					})
			}

		})
	}])

	app.controller(base+'NewSkillCtrl', 
		['$state','Session','DBSkills','LxNotificationService','$window',
		function($state,Session,DBSkills,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			skill: new DBSkills(),
			formFields: getSkillForm(),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.skill.$insert(function(newRecord) {
						$state.go(base+'.skills')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Skill - Cancelled')
				$window.history.go(-1)
				//$state.go(base+'.skills')
			}
		})
	}])

	app.controller(base+'EditSkillCtrl', 
		['$state','$stateParams','skill','logs','Session','users','$window',
		function($state,$stateParams,skill,logs,Session,users,$window){

		angular.extend(this, {
			session: Session,
			skill: skill,
			users: users,
			logs: logs,
			formFields: getSkillForm(),		
			logClass: logClass,
			submit: function() {
				this.skill._id = $stateParams.id
				this.skill.$update(function(newskill) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})				
			}
		})
	}])

})();