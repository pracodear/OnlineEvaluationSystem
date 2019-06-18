(function(){
	var app = angular.module("admin_ctrl_module",["admin_srv_module","authentication_module","chart.js"]);

 	app.controller("AdminMainController",function($scope){
 		$scope.tab1 = true;
 		$scope.tab2 = false;
 		$scope.tab3 = false;
 		$scope.tab4 = false;
 		$scope.tab5 = false;
 		$scope.fun1 = function() {
 			$scope.tab1 = true;
	 		$scope.tab2 = false;
	 		$scope.tab3 = false;
	 		$scope.tab4 = false;
	 		$scope.tab5 = false;
 		}
 		$scope.fun2 = function() {
 			$scope.tab1 = false;
	 		$scope.tab2 = true;
	 		$scope.tab3 = false;
	 		$scope.tab4 = false;
	 		$scope.tab5 = false;
 		}
 		$scope.fun3 = function() {
 			$scope.tab1 = false;
	 		$scope.tab2 = false;
	 		$scope.tab3 = true;
	 		$scope.tab4 = false;
	 		$scope.tab5 = false;
 		}
 		$scope.fun4 = function() {
 			$scope.tab1 = false;
	 		$scope.tab2 = false;
	 		$scope.tab3 = false;
	 		$scope.tab4 = true;
	 		$scope.tab5 = false;
 		}
 		$scope.fun5 = function() {
 			$scope.tab1 = false;
	 		$scope.tab2 = false;
	 		$scope.tab3 = false;
	 		$scope.tab4 = false;
	 		$scope.tab5 = true;
 		}
 	});

	app.controller("ManageUsersController",function($scope, $http, AdminService){
			AdminService.getUsers().then(function(result){
				$scope.users = result.data;
			},function(result){
				console.log("Could not retrieve users");
			});

			$scope.deleteUser = function(id){
				if(confirm("Are you sure you want to delete user with id " + id+ "?")){
					AdminService.deleteUser(id);
					$scope.users = $.grep($scope.users, function(e){
						return e.id!=id;
					});
				}
				
			}	

			$scope.upgradeUser = function(user){
				if(confirm("Are you sure you want to make user with id "+user.id+" admin?")){
					user.type = "admin";
					AdminService.upgradeUser(user);
					$scope.users = $.grep($scope.users, function(e){
						return e.id!=user.id;
					});
				}
				
			}
	});
	
	app.controller("CreateUserController",function($scope, AdminService){
		$scope.make_admin = false;
		$scope.createUser = function(){

			AdminService.getUser($scope.username).then(function(result){
				var user = result.data;
				if(!angular.equals(user,{})){
					$scope.error = "Username already exists";
				}else if($scope.email===undefined){
					$scope.error = "Please provide correct email";
				}else{
					
					AdminService.createUser($scope.username, $scope.firstname, $scope.lastname, $scope.password, $scope.email, $scope.make_admin).then(function(result){
						alert("User successfully created");
					},function(result){
						alert("Something went wrong!");
					});
					
				}
			},function(result){
					alert("Something went wrong!");
			})
		}

		$scope.generatePassword = function(){
			$scope.password = Math.random().toString(36).slice(-8);
		}
	});


	app.controller("UploadQuestionSet",function($scope, AdminService){
		$scope.addFile = function() {
		    AdminService.uploadFile($scope.file).then(function(resp){
	        	 if(resp.data.error_code === 0){ //validate success
	                    alert('Success ' + resp.config.data.file.name + ' uploaded. Response: ');
	                    AdminService.createQuestionSet($scope.qs_name, resp.data.questions).then(function(response){
	                    	$scope.success_message = "Question Set added successfully";
	                    },function(response){
	                    	alert("Oops!! Something went wrong. May be the provided question set name has been used before.");
	                    })
	                } else {
	                    alert('an error occured');
	                }
	        }, function (resp) { //catch error
                
                alert('Error status: ' + resp.status);
            }, function (evt) { 
                console.log(evt);
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                $scope.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
            });
		}
	});

	app.controller("ExaminationReportController",function($scope,AdminService,AuthenticationService){
		$scope.schExams = {};
		$scope.report = [];
		$scope.labels = [];
		$scope.datasets = [];
		// var ctx = document.getElementById("myChart");
		// $scope.myChart = new Chart(ctx);
		user_id = AuthenticationService.getCredentials().id;
		AdminService.getScheduledExams(user_id).then(function(result){
			$scope.schExams = result.data;
			for(i=0;i<$scope.schExams.length;i++) {
				AdminService.getTakenAssessments($scope.schExams[i].id,i).then(function(result){
					var temp = result.data;
					
					var x = {exam_id:$scope.schExams[result.i].id, user_id:[], total:[]};
					for(j=0;j<temp.length;j++) {
						var total = 0;
						for(k=0;k<temp[j].questions.length;k++) {
							total += temp[j].questions[k].marks;
						}
						x.user_id[j] = temp[j].user_id;
						x.total[j] = total;
					}
					$scope.report[result.i] = x;
				},function(result) {

				});
			}
		},function(result){
			
		});
		$scope.getDate = function(x) {
			if(x === undefined)
				return "";
			dt = new Date(x);
			return dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
		}
		
		$scope.graph = function(s){
			
			var x = $scope.report.filter(function(temp) {
				return temp.exam_id === s.id;
			});
			
			$scope.labels = x[0].user_id;
			$scope.datasets = x[0].total;
	
		}

	});


	app.controller("ManageQuestionSetsController",function($rootScope, $scope, $cookieStore, AdminService){
		author = $cookieStore.get('username');
		$scope.error = false;
		AdminService.getQuestionSets(author).then(function(result){
			var question_sets = $scope.QuestionSets = result.data;
			if(question_sets.length === 0){
				$scope.error = true;
				$scope.message = "No private question sets to show";
			}
		},function(result){
			$scope.error = true;
			$scope.message = "Some problem occured";
		})

		$scope.deleteQuestionSet = function(qs_id){
			
			if(confirm("Are you sure you want to delete question set with id " + qs_id+ "?")){
				AdminService.deleteQuestionSet(qs_id).then(function(result){
					$scope.QuestionSets = $.grep($scope.QuestionSets, function(e){
						return e.id!=qs_id;
					});
					$scope.success_message = "Question Set deleted successfully";
				},function(result){
					alert("Some problem occurred. Try again!");
				});
			}
			
		}

		$scope.make_public = function(qs){
			if(confirm("Are you sure you want to make the question set \"" + qs.name+ "\" public?")){
				AdminService.makeQSPublic(qs).then(function(result){
					
					$scope.success_message = "Question Set has been made public.";
				},function(result){
					alert("Some problem occurred. Try again!");
				});


			}
		}

	});


	app.controller("ScheduleExamController",function($rootScope, $scope, $cookieStore, AdminService){
	
		
		
		$scope.QuestionSets = [];
		$scope.exam_question_set = [];
		$scope.error = false;
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
		    dd = '0'+dd
		} 

		if(mm<10) {
		    mm = '0'+mm
		} 

		$scope.today = yyyy + '-' + mm + '-' + dd;
		$scope.loadPrivateQuestionSets = function(){
			if($scope.QuestionSets.length === 0){
				author = $cookieStore.get('username');
				$scope.error = false;
				AdminService.getQuestionSets(author).then(function(result){
					var question_sets = $scope.QuestionSets = result.data;
					if(question_sets.length === 0){
						$scope.error = true;
						$scope.error_message = "No private question sets to show";
					}
				},function(result){
					$scope.error = true;
					$scope.error_message = "Some problem occured";
				})
			}
		}


		function getRandomSubarray(arr, size) {
		    var shuffled = arr.slice(0), i = arr.length, temp, index;
		    while (i--) {
		        index = Math.floor((i + 1) * Math.random());
		        temp = shuffled[index];
		        shuffled[index] = shuffled[i];
		        shuffled[i] = temp;
		    }
		    return shuffled.slice(0, size);
		}

		$scope.getQuestionsFromPrivateSet = function(){
			
				$scope.exam_question_set = JSON.parse($scope.private_question_set).questions;
		}

		$scope.getQuestionsFromPublicSet = function(){
			public_question_set = []
			AdminService.getQuestionsFromPublicSet().then(function(response){
				public_question_set = response.data;
				if(public_question_set.length < $scope.number_of_questions){
					alert("Public database does not contain enough questions");
				}else{
					$scope.exam_question_set = getRandomSubarray(public_question_set, $scope.number_of_questions);
				}
			},function(response){
				alert("Could not fetch questions from public question set");
			});
		}
		$scope.scheduleExam = function(){
			
			if($scope.exam_question_set.length == 0){
				alert("Exam cannot be scheduled without enough questions. Try again!");
			}else if($scope.error === true){
				alert("Exam cannot be scheduled. Please resolve the errors and try again!");
			}else{
				AdminService.createExam($scope.testname, $scope.date, $scope.timelimit, $scope.examinees_list, $scope.exam_question_set).then(function(response){
					var exam = response;
					AdminService.addExamToExaminees(exam.id, $scope.examinees_list).then(function(result){
							if(result.invalidUsernames.length>0){
								alert("Usernames : "+result.invalidUsernames.join(", ")+" are invalid. Rest of the users are added");
								AdminService.updateExam(exam, result.invalidUsernames).then(function(response){

								},function(response){
									alert("Some problem occurred while updating exam");
								});
							}
							$scope.success_message = "Exam Scheduled successfully";
						},function(result){
							alert("Exam has been created but some examinees could not be added.")
					});
					
				},function(){
					alert("Some problem occurred. Exam could not be scheduled. Try again!");
				});
			}
		}

		$scope.validateTime = function(){
			var time_list = $scope.timelimit.split(":");
			if(time_list.length!=3){
				$scope.time_error = "Time format is wrong";
				$scope.error = true;
			}else {
				var hh = parseInt(time_list[0]);
				var mm = parseInt(time_list[1]);
				var ss = parseInt(time_list[2]);

				if(!(hh>=0 && mm>=0 && mm<60 && ss>=0 && ss<60)){
					$scope.time_error = "Time format is wrong";
					$scope.error = true;
				}else{
					$scope.time_error = "";
					$scope.error=false;
				}

			}
			$scope.$apply();
		}

		$scope.loadFile = function(o){
			var fr = new FileReader();
			fr.onload = function(e)
			    {
			        $scope.examinees_list=e.target.result.split("\n");
			       
			        // console.log(nameArray);

			    };
			fr.readAsText(o.files[0]);
		}	
	});
 
})();

