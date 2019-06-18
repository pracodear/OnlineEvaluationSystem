(function() {
	var app = angular.module("paper_module",["directive_module","user_srv_module","authentication_module","ngRoute","ngCookies"]);
	var temp;
	var testAllQuestions;
	app.controller("QuestionLinkController", function($rootScope,$scope) {
		$scope.questions = testAllQuestions.questions;
		unansweredFilter = function(testQuestion) {
			return testQuestion.selected === undefined;
		}

		answeredFilter = function(testQuestion) {
			return testQuestion.selected !== undefined;
		}

		$scope.$on('filter_question',function(evt,value) {
			if(value === "all")
				$scope.questions = testAllQuestions.questions;
			else if(value === "ua")
				$scope.questions = testAllQuestions.questions.filter(unansweredFilter);
			else 
				$scope.questions = testAllQuestions.questions.filter(answeredFilter);
		});
		$scope.setIndex = function(idx) {
			$rootScope.$broadcast("set_index",idx-1);
		}
	});

	app.controller("QuestionListController", function($rootScope,$scope) {
		$scope.questions = testAllQuestions.questions;
		$scope.index = 0;
		$scope.selectValue = "";
		$scope.mcqBool = false;
		$scope.mmcqBool = false;

		$scope.previousIndex = function() {
			$scope.index --;
			if($scope.index < 0)
				$scope.index = $scope.questions.length - 1;
			$scope.setType();
		}
		$scope.nextIndex = function() {
			$scope.index ++;
			if($scope.index > $scope.questions.length - 1)
				$scope.index = 0;
			$scope.setType();
		}
		$scope.$on("set_index", function(event,idx) {
			$scope.index = idx;
			$scope.setType();
		});
		$scope.setType = function() {
			questionDisp = $scope.questions[$scope.index];
			$scope.selectValue = $scope.questions[$scope.index].selected;//setting selectedValue for the question
			
			if(questionDisp.type == 'MCQ')
			{
				$scope.mcqBool = true;
				$scope.mmcqBool = false;
			}
			else
			{
				$scope.mmcqBool = true;
				$scope.mcqBool = false;
			}
		}
		$scope.selectChange = function(val) {
			$scope.selectValue = val;
			$scope.questions[$scope.index].selected = testAllQuestions.questions[$scope.index].selected = $scope.selectValue;
			$rootScope.$broadcast("answer_question");
		}
		$scope.setType();
	});

	app.controller("QuestionFilterController", function($rootScope,$scope) {
		
		temp = $rootScope.paper;
		testAllQuestions = {
			id : temp.exam_id,
		};
		var iter = 1;
		testAllQuestions.questions = temp.questions.map(function(el) {
			  var o = Object.assign({}, el);
			  o.serial = iter++;
			  o.selected = undefined;
			  return o;
		});
		$scope.filterValue = "all";
		$scope.$on('answer_question',function(evt) {
			$scope.filterChange($scope.filterValue);
		});
		$scope.filterChange = function(val) {
			$scope.filterValue = val;
			$rootScope.$broadcast("filter_question",$scope.filterValue);
		}
	});

	app.controller("TimeOutController", function($scope,$timeout,AuthenticationService,UserService,$location,$route) {
		
		$scope.name = temp.name;
		$scope.time = {
			hours : "",
			minutes : "",
			seconds : ""
		};
	    $scope.onTimeout = function(){
	        $scope.counter--;
	        evalTime($scope.counter);
	        if($scope.counter == 0)
	        	$scope.stop();
	        else
	        	mytimeout = $timeout($scope.onTimeout,1000);
	    }
	    var mytimeout = $timeout($scope.onTimeout,1000);

	    $scope.stop = function(){
	        $timeout.cancel(mytimeout);
	        $location.path('/');
	    }

	    $scope.$on('submit_paper',function(evt) {
			$scope.stop();
		});
 
 		checkTime = function(i) {
	        return (i < 10) ? "0" + i : i;
	    }
	    evalCounter = function(time_limit) {
			var a = time_limit.split(':');
			var sec = 0;
			var sec = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
			return sec;
		}
		evalTime = function(ctr) {
			$scope.time.hours = checkTime(Math.floor(ctr/3600));
			ctr = ctr%3600;
			$scope.time.minutes = checkTime(Math.floor(ctr/60));
			ctr = ctr%60;
			$scope.time.seconds = checkTime(ctr);
		}
		$scope.$on('$routeChangeStart', function(event, next, current) {
	    	var evaluatedQuestions = {};
			evaluatedQuestions.exam_id = testAllQuestions.id;
			evaluatedQuestions.questions = [];
			for(i=0; i<testAllQuestions.questions.length ;i++) {
				var x = {};
				x.serial =  testAllQuestions.questions[i].serial;
				x.question = testAllQuestions.questions[i].question;
				if(testAllQuestions.questions[i].selected === testAllQuestions.questions[i].answer)
					x.marks = testAllQuestions.questions[i].marks;
				else
					x.marks = 0;
				evaluatedQuestions.questions[i] = x;
			}
			evaluatedQuestions.user_id = AuthenticationService.getCredentials().id;
			UserService.createTakenAssessment(evaluatedQuestions).then(function(result){
            	UserService.getUser(evaluatedQuestions.user_id).then(function(result){
            		user = result.data[0];
            		user.registered_tests = result.data[0].registered_tests.filter(function(x) {
            			return x !== evaluatedQuestions.exam_id;
            		});

            		UserService.updateUser(user).then(function(result){
		            	alert("Evaluation Done !! You can now view the result");
		  				$route.reload();
		            });
	            });
            },function(response){
            	alert("Oops!! Something went wrong.");
            });
		});
		$scope.counter = evalCounter(temp.duration);
		evalTime($scope.counter);
	});

	app.controller("SubmitController", function($rootScope,$scope) {
		
	    $scope.submit = function(){
	        $rootScope.$broadcast("submit_paper");
	    }
	});
})();
