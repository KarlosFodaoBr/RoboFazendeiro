<?php 
$servername = "x14.x10hosting.com";
$username = "mgivajkb_dao"; 
$password = "12345678";
$dbname = "mgivajkb_dao";
$port = 3306;
$conn = new mysqli($servername, $username, $password, $dbname, $port);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }