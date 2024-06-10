<?php
if (isset($_GET["cache"]) && $_GET["cache"] == true) {
    header('Cache-Control: max-age=5');
}

session_start();
require_once __DIR__ . "/../../adminer/include/functions.inc.php";
require_once __DIR__ . "/../../adminer/include/auth.inc.php";



print_r(get_rows("SELECT NOW(6)"));

die();
$db->escape($_GET["id"]);
$db->query($query);

$id = $db->escape($_GET["id"]);
$text = $db->escape($_GET["text"]);
@$q = $_GET["q"];
if (is_null($q)) {
    $q = "%";
} else {
    $q = $db->escape($q);
    if (isset($_GET["weak"]) && $_GET["weak"] == true) {
        $q = "%" . $q . "%";
    } else if (isset($_GET["weakEnd"]) && $_GET["weakEnd"] == true) {
        $q = $q . "%";
    }
}

@$where = $_GET["where"];
if (is_null($where)) {
    $where = "";
} else {
    //This is an adminer tool ,we do not really need sql escaping, as you already have full access to the database!
}


$table = $db->escape($_GET["table"]);
$sql = "SELECT $id as id, $text as text FROM $table WHERE $text LIKE '$q' $where ORDER BY $text ASC LIMIT 25";
//echo $sql;
$res = $db->query($sql);
$json = [];
$pos = 0;
while ($row = $res->fetch_object()) {
//	print_r($row);
    $json["results"][$pos]["id"] = $row->id;
    $json["results"][$pos]["text"] = "{$row->id} - {$row->text}";
    $pos++;
}
echo json_encode($json);

