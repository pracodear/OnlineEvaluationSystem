(function() {
	var app = angular.module("user_module",["directive_module","user_srv_module","authentication_module","ngCookies"]);

	app.controller("UpcomingAssessmentController",function($scope,$rootScope,AuthenticationService,UserService,$location) {
		user_id = AuthenticationService.getCredentials().id;
		$scope.upcoming_assessments = [];
		$scope.upa = true;
		UserService.getUser(user_id).then(function(result) {
				assessments = result.data[0].registered_tests;
				for(i = 0; i < assessments.length;i++) {
					$scope.upa = false;
					UserService.getExamDetails(assessments[i],i).then(function(result) {
						
						var dt = new Date(result.data[0].date);
						var dt1 = new Date(Date.now());
						dt1.setHours(0,0,0,0);
						if(dt.getTime() >= dt1.getTime()) {
							var dateString = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
							$scope.upcoming_assessments[result.i] = {exam_id: result.data[0].id, name:result.data[0].name, date: dt, dateString:dateString, duration:result.data[0].timelimit, questions: result.data[0].questions};
						}
					}, function(result) {

					});
				}
		},function(result){
			console.log("Could not retrieve Taken Assessments");
		});	
		$scope.openAssessment = function(test) {
			var dt = new Date(Date.now());
			dt.setHours(0,0,0,0);
			if(test.date.getTime() === dt.getTime()){
				$rootScope.paper = test;
				console.log($rootScope.paper);
				$location.path("/papers");
			}
			else {
				alert("Test is due on date "+test.dateString);
			}
			
		}
	});

	app.controller("TakenAssessmentController", function($scope,AuthenticationService,UserService) {

		user_id = AuthenticationService.getCredentials().id;
		$scope.taken_assessments = [];
		$scope.taa = true;

		UserService.getTakenAssessment(user_id).then(function(result) {
				taken_assessments = result.data;
				for(i = 0; i < taken_assessments.length;i++) {
					UserService.getExamDetails(taken_assessments[i].exam_id,i).then(function(result) {
						$scope.taa = false;
						var dt = new Date(result.data[0].date);
						var dateString = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
						$scope.taken_assessments[result.i] = {exam_id: result.data[0].id, name:result.data[0].name, date: dateString, questions:taken_assessments[result.i].questions};
						
					}, function(result) {

					});
				}
			},function(result){
				console.log("Could not retrieve Taken Assessments");
		});

		$scope.sortTable = function(n) {
			console.log("sortTable" +n);
			var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
			table = document.getElementById("myTable");
			switching = true;
			dir = "asc"; 
			while (switching) {
				
				switching = false;
				rows = table.getElementsByTagName("TR");
				
				for (i = 1; i < (rows.length - 1); i++) {
					
					shouldSwitch = false;
					
					x = rows[i].getElementsByTagName("TD")[n];
					y = rows[i + 1].getElementsByTagName("TD")[n];
					
					if (dir == "asc") {
						if(n === 2){
							var aa = x.innerHTML.split('/').reverse().join();
						    var bb = y.innerHTML.split('/').reverse().join();
						    if(aa > bb) {
						    	shouldSwitch= true;
								break;
						    } 
						}
						else {
							if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
						
								shouldSwitch= true;
								break;
							}
						}
						
					} 
					else if (dir == "desc") {
						if(n === 2){
							var aa = x.innerHTML.split('/').reverse().join();
						    var bb = y.innerHTML.split('/').reverse().join();
						    if(aa <= bb) {
						    	shouldSwitch= true;
								break;
						    } 
						}
						else {
							if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
								shouldSwitch= true;
								break;
							}
						}
					}		
				}
				if (shouldSwitch) {
					rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
					switching = true;
					switchcount ++;      
				} 
				else {
					if (switchcount == 0 && dir == "asc") {
						dir = "desc";
						switching = true;
					}
				}
			}
		}

		$scope.viewReport = function(report) {
			$scope.report = report;
			var modal = document.getElementById('myModal');
			modal.style.display = "block"; 
		}
		$scope.closeReport = function() {
			var modal = document.getElementById('myModal');
			modal.style.display = "none";
		}
	});
})();