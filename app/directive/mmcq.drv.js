(function(){
	angular.module("directive_module").directive("mmcqView",function(){
		return {
			restrict : 'E',
			templateUrl : 'app/templ/mmcq.templ.html'
		}
	})
})();