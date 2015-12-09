;(function(){
	
// Log browser to go at the top of a lister page

angular.module('cmms').directive('logger', function() {
	return {
		restrict: 'AE',
		replace: 'true',
		template: '<!-- added logger -->'
	}
})
/*
<lx-dialog class="dialog dialog__scrollable dialog--l bgc-light-gradient" id='partLogDialog' escape-close="true">
    <div class="dialog__header">
        <div class="toolbar bgc-indigo-800 pl++">
            <span class="toolbar__label tc-white fs-title">
                Recent Parts Activity
            </span>       
            <span lx-dialog-close class="white">X</span>     
        </div>
    </div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th> Event</th>
            <th> Date</th>
            <th> Description</th>
            <th> IP Address</th>
            <th> By</th>
          </tr>
        </thead>
        <tbody>
          <tr class="data-table"
              ng-class="Parts.logClass(l)"        
              ng-click="Parts.goAudit(l)"
              ng-repeat="l in Parts.getSelectedLogs()">
                <td>{{l.Type}}</td>
                <td>{{l.Logdate}}</td>
                <td>{{l.Descr}}</td>
                <td>{{l.IP}}</td>
                <td>{{l.Username}}</td>
          </tr>
        </tbody>
      </table>
    </div>
</lx-dialog>
*/

})()