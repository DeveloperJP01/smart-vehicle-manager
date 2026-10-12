$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\mysel\Desktop\Smart Vehicle Manager.lnk")
$Shortcut.TargetPath = "C:\Users\mysel\Documents\smart-vehicle-manager\Smart Vehicle Service and Maintenance Manager.bat"
$Shortcut.WorkingDirectory = "C:\Users\mysel\Documents\smart-vehicle-manager"
$Shortcut.Save()
Write-Host "Shortcut created successfully"
