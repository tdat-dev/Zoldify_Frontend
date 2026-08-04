<?php
// Debug: Show POST data when creating product
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<h2>POST Data Received:</h2>";
    echo "<pre>";
    print_r($_POST);
    echo "</pre>";
    
    echo "<h3>Condition value:</h3>";
    echo "condition = " . ($_POST['condition'] ?? 'NOT SET');
    
    die();
}
?>
<!DOCTYPE html>
<html>
<head><title>Debug Form</title></head>
<body>
<h1>Test Condition Form</h1>
<form method="POST">
    <input type="hidden" name="condition" id="inputCondition" value="">
    
    <h3>Click a condition:</h3>
    <button type="button" onclick="document.getElementById('inputCondition').value='new'; alert('Set to: new')">Mới 100%</button>
    <button type="button" onclick="document.getElementById('inputCondition').value='like_new'; alert('Set to: like_new')">Như mới</button>
    <button type="button" onclick="document.getElementById('inputCondition').value='good'; alert('Set to: good')">Tốt</button>
    
    <br><br>
    <p>Current condition value: <span id="showCond">-</span></p>
    <button type="button" onclick="document.getElementById('showCond').innerText = document.getElementById('inputCondition').value">Show Value</button>
    
    <br><br>
    <button type="submit">Submit</button>
</form>
</body>
</html>
