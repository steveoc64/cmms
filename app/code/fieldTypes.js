/////////////////////////////////////////////////////
// Field definitions for use in formly

;(function(){

loadFieldDefinitions = function(formlyConfig) {

	// Define lx-number, which handles decimals in numeric input
  formlyConfig.setType({
    name: 'lx-number',
    templateUrl: './html/includes/lx-number.html'
  });

	angular.forEach(getUserFields(), function(v,k) {
		formlyConfig.setType(v)
	})

	angular.forEach(getSiteFields(), function(v,k) {
		formlyConfig.setType(v)
	})

	angular.forEach(getPartFields(), function(v,k) {
		formlyConfig.setType(v)
	})

} // loadFieldDefintions


})();

