;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'SkillCtrl', function($state, skills, Session, LxDialogService, logs){
	
		angular.extend(this, {
			skills: skills,
			session: Session,
			logs: logs,
			logClass: logClass,
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
			}
		})
	})

	app.controller(base+'NewSkillCtrl', function($state,Session,DBSkills,LxNotificationService){
	
		angular.extend(this, {
			session: Session,
			skill: new DBSkills(),
			formFields: getSkillForm(),
			logClass: logClass,
			submit: function() {
				console.log('here with skill',this.skill)
				if (this.form.$valid) {
					this.skill.$insert(function(newRecord) {
						$state.go(base+'.skills')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Skill - Cancelled')
				$state.go(base+'.skills')
			}
		})
	})

	app.controller(base+'EditSkillCtrl', function($state,$stateParams,skill,logs,Session,users){

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
					$state.go(base+'.skills')
				})					
			},
			abort: function() {
				$state.go(base+'.skills')
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})				
			}
		})
	})

})();