class LoginController {

    constructor($firebaseAuth, $log, $location, $scope) {
        'ngInject';

        this._$firebaseAuth = $firebaseAuth;
        this._$log = $log;
        this._$location = $location;
        this._$scope = $scope;
        console.log('========================');
    }

    authenticateWithGoogle() {

        let ref = new Firebase('https://altman.firebaseio.com');

        //no idea why it doesn't work without AngularFire
        // cf. http://stackoverflow.com/questions/30048507/firebase-and-angularfire-getting-email-from-google-authentication-works-with

        //ref.authWithOAuthRedirect("google", function (error) {
        //  this._$log.debug("Login Failed!", error);
        //}, {remember: 'sessionOnly', scope : 'email'});

        var provider = 'google';
        var scope = {remember: 'sessionOnly', scope: 'email'};

        //ref.onAuth(authData => {
        //    this._$log.debug("Login success!", authData);
        //    this._$location.path('/welcome');
        //});
        ref.authWithOAuthPopup("google", (error, authData) => {
            if (error) {
                this._$log.debug("Login failed!", error);
            }
            else {
                this._$log.debug("Login success!", authData);
                this._$location.path('/welcome');
                this._$scope.$apply();
            }
        }, scope);
        //ref.authWithOAuthRedirect("google", error => {
        //    this._$log.debug("Login failed!", error);
        //}, scope);

        //var auth = this._$firebaseAuth(ref);
        //auth.$authWithOAuthRedirect(provider, scope).then(
        //    function (authObject) {
        //        this._$log.debug("Login success!", authObject);
        //        this._$location.path('/welcome');
        //    },
        //    function (error) {
        //        this._$log.debug("Login failed!", error);
        //    });
    }
}

export default LoginController;
