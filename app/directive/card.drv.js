(function(){
	angular.module("directive_module").directive("cardView",function(){
		return {
			restrict : 'E',
			templateUrl : 'app/templ/card.templ.html',//some browsers don't support cross origin so in chrome u have to load it onto serve and then extract it
			scope : {
				name : '=',//states
				duration : '=',
				date : '=',
				openAssessment : '&'//behaviours &
			}
		}
	})
})();