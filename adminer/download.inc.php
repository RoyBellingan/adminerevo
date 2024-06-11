<?php

if($_GET["format"] == "json"){
    header("Content-Type: application/json");
    if(isset($_GET["sql"])){
        $result = $connection->query($_GET["sql"]);
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        exit;
    }else{
        $TABLE = $_GET["download"];
        $fields = fields($TABLE);
        $select = array(idf_escape($_GET["field"]));
        $result = $driver->select($TABLE, $select, array(where($_GET, $fields)), $select);
        $row = ($result ? $result->fetch_row() : array());
        json_encode($row);
        exit;
    }
} elseif($_GET["format"] == "select2"){
    //header("Content-Type: application/json");

    $db = $_GET["db"];
	$table = $_GET["table"];
    $id = $_GET["id"] ?? "id"; 
    $text = $_GET["text"] ?? "name";
    $where = '';
    if($_GET["q"]){
        $q = $_GET["q"];
        $where = " WHERE $id = '$q' OR $text LIKE '$q' ";
    }

    $sql = "SELECT {$id} as id, {$text} as text FROM $db.$table $where";
    //echo $sql;
    $result = $connection->query($sql);

    $json = [];
    $pos = 0;
    while($row = $result->fetch_object()){
        $json["results"][$pos]["id"] = $row->id;
        $json["results"][$pos]["text"] = "{$row->id} - {$row->text}";
        $pos++;
    }

    echo json_encode($json);

}else{
    $TABLE = $_GET["download"];
    $fields = fields($TABLE);
    header("Content-Type: application/octet-stream");
    header("Content-Disposition: attachment; filename=" . friendly_url("$TABLE-" . implode("_", $_GET["where"])) . "." . friendly_url($_GET["field"]));
    $select = array(idf_escape($_GET["field"]));
    $result = $driver->select($TABLE, $select, array(where($_GET, $fields)), $select);
    $row = ($result ? $result->fetch_row() : array());
    echo $driver->value($row[0], $fields[$_GET["field"]]);
}


exit; // don't output footer
