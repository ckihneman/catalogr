<?php

session_name( 'catalogr' );

session_start();

$action = $_GET['action'];

// hard coded username and password to check against
$u = 'admin';
$p = 'pass';

switch ( $action ) {
	case 'login' :
		login();
		break;
	case 'new' :
		newItem();
		break;
	default :
		fail( 'action-fail' );
}

function newItem() {
	$result;
	
	// check key against session key
	if ( checkKey() ) {
		$result = makeJson( 'new' );
	} else {
		$result = makeJson( 'your key is messed up<br />refresh and re-login' );
	}
	
	echo $result;
}

function checkKey( $key ) {
	$session = $_SESSION['key'];
	$get = $_GET['key'];
	
	// be sure we have the session and get key and that they are equal
	return $session && $get && $session === $get ? true : false;
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
		
		// set key to session var
		$_SESSION['key'] = $key;
		
		$result = makeJson( 'login', array( $key ) );
		
	} else {
		$result = makeJson( 'login-fail' );
	}
	
	echo $result;
}

function fail( $msg ) {
	echo makeJson( $msg );
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
		case 'new' :
			$arr = array( 'type' => 'new', 'msg' => 'true' );
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