function runBlock($log, $location) {
    'ngInject';

    let ref = new Firebase('https://altman.firebaseio.com');

    //only needed when authenticating via redirect
    ref.onAuth(function (authData) {

        $log.debug('onAuth callback called with authData', authData);

        if (authData) {
            $log.debug('User already authenticated');
            $location.path('/welcome');
        }
        else {
            $log.debug('User not authenticated -> redirecting to login page');
            $location.path('/login');
        }
    });

}

export default runBlock;
