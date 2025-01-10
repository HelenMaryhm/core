'use strict';

/**
 * @ngdoc function
 * @name commentsApp.controller:CommentsCtrl
 * @description
 * # MainCtrl
 * Controller of the commentsApp
 */

var commentsApp = angular.module('commentsApp', []);

commentsApp.directive('commentList', [
  function () {
    return {
      restrict: 'E',
      scope: {
        contentId: '=',
        contentTitle: '='
      },
      templateUrl: '/application/comments/angular/comments-list.html',
      controller: 'CommentsCtrl',
      controllerAs: 'comments'
    };
  }])
  .directive('commentForm', [
  function () {
    return {
      restrict: 'E',
      templateUrl: '/application/comments/angular/comments-form.html',
      controller: 'CommentsFormCtrl',
      controllerAs: 'commentsForm'
    };
  }]);

commentsApp.service('CommentsService', ['$http', function($http) {
  this.getComments = function(id) {
    return $http.get('/api/content/render/false/type/json/query/+structureName:Comments%20+(conhost:48190c8c-42c4-46af-8d1a-0cd5db894797%20conhost:SYSTEM_HOST)%20+News-Comments:' + id + '%20+languageId:1%20+deleted:false%20+working:true/orderby/modDate%20desc')
      .success(function(data) {
        angular.forEach(data.contentlets, function(item) {
          item.datePublished = new Date(item.datePublished);
        });
      })
      .error(function(data, status) {
        console.log('ERROR: ' + status + '. We can\'t get the comments right now, please try again later');
      });
  };

  this.postComment = function(data) {
    return $http.post('/api/content/publish/1', data)
      .success(function() {
        console.log('Comment was post successfully');
      })
      .error(function() {
        console.log('There was an error posting the comment');
      });
  };
}]);

commentsApp.controller('CommentsCtrl', ['$scope', 'CommentsService', function($scope, CommentsService) {

  CommentsService.getComments($scope.contentId)
    .then(function(response) {
      $scope.comments = response.data.contentlets;
    });

}]);

commentsApp.controller('CommentsFormCtrl', ['$scope', 'CommentsService', function($scope, CommentsService) {
  $scope.c = {};
  $scope.c.datePublished = new Date();
  $scope.c.alert = false;

  $scope.commentForm = {};
  $scope.commentForm.hide = true;

  $scope.submitComment = function(comments) {
    $scope.c.alert = false;

    var data = {
      'author': $scope.c.author,
      'comment': $scope.c.comment,
      'datePublished': $scope.c.datePublished.getFullYear() + '-' + ($scope.c.datePublished.getMonth() + 1) + '-' + $scope.c.datePublished.getDate() + ' ' + $scope.c.datePublished.getHours() + ':' + $scope.c.datePublished.getMinutes() + ':' + $scope.c.datePublished.getSeconds(),
      'email': $scope.c.email,
      'languageId': 1,
      'News-Comments': '+structureName:News +identifier:' + $scope.contentId,
      'stName': 'Comments',
      'title': 'Comment re: ' + $scope.contentTitle
    };

    CommentsService.postComment(data)
      .then(function() {
        $scope.commentsForm.$setPristine();
        comments.splice(0, 0, $scope.c);
        $scope.c = {};
        $scope.commentForm.hide = true
      }, function() {
        $scope.c.alert = true;
      });
  };

  $scope.toggleCommentForm = function() {
    $scope.commentForm.hide = !$scope.commentForm.hide;
  };
}]);

commentsApp.filter('htmlStrip', function(){
  return function(text) {
    return text ? String(text).replace(/<[^>]+>/gm, '') : '';;
  }
})

