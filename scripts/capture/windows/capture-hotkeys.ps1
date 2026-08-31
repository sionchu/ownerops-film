$ErrorActionPreference = 'Stop'

Add-Type @'
using System;
using System.Runtime.InteropServices;

public static class OwnerOpsCaptureKeys {
  [DllImport("user32.dll")]
  public static extern short GetAsyncKeyState(int virtualKey);
}
'@

function Wait-KeyRelease([int]$virtualKey) {
  while (([OwnerOpsCaptureKeys]::GetAsyncKeyState($virtualKey) -band 0x8000) -ne 0) {
    Start-Sleep -Milliseconds 25
  }
}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
while ($true) {
  if (([OwnerOpsCaptureKeys]::GetAsyncKeyState(0x77) -band 0x8000) -ne 0) {
    [Console]::Out.WriteLine('MARK')
    [Console]::Out.Flush()
    Wait-KeyRelease 0x77
  }
  if (([OwnerOpsCaptureKeys]::GetAsyncKeyState(0x78) -band 0x8000) -ne 0) {
    [Console]::Out.WriteLine('ABORT')
    [Console]::Out.Flush()
    break
  }
  Start-Sleep -Milliseconds 25
}
