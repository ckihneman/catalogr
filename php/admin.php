<?php

$action = $_GET['action'];

// hard coded username and password to check against
$u = 'admin';
$p = 'pass';

switch ( $action ) {
	case 'login' :
		login();
		break;
	default :
		echo makeJson( 'action-fail' );
}

function login() {
	$result;
	
	// from login form
	$username = $_GET['username'];
	$password = $_GET['password'];
	
	// check if they match
	if ( checkLogin( $username, $password ) ) {
		
		// login success
		$key = rand_string( 4 ) . '-' . rand_string( 4 ) . '-' . rand_string( 4 ) . '-' . rand_string( 4 );
		
		$result = makeJson( 'login', array( $key ) );
		
	} else {
		$result = makeJson( 'login-fail' );
	}
	
	echo $result;
}

function checkLogin( $user, $pass ) {
	global $u, $p;
	
	if ( $user === $u && $pass === $p ) {
		return true;
	} else {
		return false;
	}
}

function makeJson( $type, $params ) {
	
	switch ( $type ) {
		case 'login' :
			$arr = array( 'type' => 'login', 'key' => $params[ 0 ] );
			break;
		default :
			$arr = array( 'type' => 'error', 'msg' => $type );
	}
	
	return json_encode($arr);
}

function rand_string( $len, $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' ) {
	$string = '';
	for ($i = 0; $i < $len; $i++) {
		$pos = rand( 0, strlen( $chars ) - 1 );
		$string .= $chars{ $pos };
	}
	return $string;
}

?>