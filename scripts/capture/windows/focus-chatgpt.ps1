[CmdletBinding()]
param(
  [string]$TitlePattern = 'ChatGPT',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class OwnerOpsWindowFocus {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }

  [DllImport("user32.dll")]
  public static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

  [DllImport("user32.dll")]
  public static extern bool IsWindowVisible(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool IsIconic(IntPtr hWnd);

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int maxCount);

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern int GetWindowTextLength(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

  [DllImport("user32.dll")]
  public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);

  [DllImport("dwmapi.dll")]
  public static extern int DwmGetWindowAttribute(IntPtr hWnd, int attribute, out RECT value, int valueSize);

  [DllImport("user32.dll")]
  public static extern bool ShowWindowAsync(IntPtr hWnd, int command);

  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern IntPtr GetForegroundWindow();

  [DllImport("user32.dll")]
  public static extern bool AttachThreadInput(uint sourceThreadId, uint targetThreadId, bool attach);

  [DllImport("user32.dll")]
  public static extern bool BringWindowToTop(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern IntPtr SetFocus(IntPtr hWnd);

  [DllImport("kernel32.dll")]
  public static extern uint GetCurrentThreadId();

  [DllImport("user32.dll")]
  public static extern int GetSystemMetrics(int index);

  [DllImport("user32.dll")]
  public static extern uint GetDpiForWindow(IntPtr hWnd);
}
'@

$candidates = [System.Collections.Generic.List[object]]::new()
$callback = [OwnerOpsWindowFocus+EnumWindowsProc]{
  param([IntPtr]$handle, [IntPtr]$unused)
  if (-not [OwnerOpsWindowFocus]::IsWindowVisible($handle)) { return $true }
  $length = [OwnerOpsWindowFocus]::GetWindowTextLength($handle)
  if ($length -le 0) { return $true }

  $builder = [System.Text.StringBuilder]::new($length + 1)
  [void][OwnerOpsWindowFocus]::GetWindowText($handle, $builder, $builder.Capacity)
  $title = $builder.ToString()
  $processId = [uint32]0
  [void][OwnerOpsWindowFocus]::GetWindowThreadProcessId($handle, [ref]$processId)
  try {
    $process = Get-Process -Id $processId -ErrorAction Stop
    $processName = $process.ProcessName
    $fileVersion = $process.MainModule.FileVersionInfo.FileVersion
  } catch { return $true }

  if ($title -match $TitlePattern -or $processName -match $TitlePattern) {
    $candidates.Add([pscustomobject]@{
      Handle = $handle
      ProcessId = $processId
      ProcessName = $processName
      FileVersion = $fileVersion
      Title = $title
    })
  }
  return $true
}
[void][OwnerOpsWindowFocus]::EnumWindows($callback, [IntPtr]::Zero)

$desktopCandidates = @($candidates | Where-Object { $_.ProcessName -ieq 'ChatGPT' })
if ($desktopCandidates.Count -gt 0) {
  $eligible = @($desktopCandidates)
} else {
  $eligible = @($candidates)
}
if ($eligible.Count -ne 1) {
  $summary = $eligible | Select-Object ProcessId, ProcessName
  throw "Expected exactly one visible ChatGPT Desktop window matching '$TitlePattern'; found $($eligible.Count). Candidates: $($summary | ConvertTo-Json -Compress)"
}

$target = $eligible[0]
if (-not $DryRun) {
  $foregroundHandle = [OwnerOpsWindowFocus]::GetForegroundWindow()
  $foregroundProcessId = [uint32]0
  $foregroundThreadId = [OwnerOpsWindowFocus]::GetWindowThreadProcessId($foregroundHandle, [ref]$foregroundProcessId)
  $targetProcessId = [uint32]0
  $targetThreadId = [OwnerOpsWindowFocus]::GetWindowThreadProcessId($target.Handle, [ref]$targetProcessId)
  $currentThreadId = [OwnerOpsWindowFocus]::GetCurrentThreadId()
  $attachedForeground = $false
  $attachedTarget = $false
  try {
    if ($foregroundThreadId -ne 0 -and $foregroundThreadId -ne $currentThreadId) {
      $attachedForeground = [OwnerOpsWindowFocus]::AttachThreadInput($currentThreadId, $foregroundThreadId, $true)
    }
    if ($targetThreadId -ne 0 -and $targetThreadId -ne $currentThreadId) {
      $attachedTarget = [OwnerOpsWindowFocus]::AttachThreadInput($currentThreadId, $targetThreadId, $true)
    }
    if ([OwnerOpsWindowFocus]::IsIconic($target.Handle)) {
      [void][OwnerOpsWindowFocus]::ShowWindowAsync($target.Handle, 9)
    }
    [void][OwnerOpsWindowFocus]::BringWindowToTop($target.Handle)
    [void][OwnerOpsWindowFocus]::SetForegroundWindow($target.Handle)
    [void][OwnerOpsWindowFocus]::SetFocus($target.Handle)
    Start-Sleep -Milliseconds 500
  } finally {
    if ($attachedTarget) {
      [void][OwnerOpsWindowFocus]::AttachThreadInput($currentThreadId, $targetThreadId, $false)
    }
    if ($attachedForeground) {
      [void][OwnerOpsWindowFocus]::AttachThreadInput($currentThreadId, $foregroundThreadId, $false)
    }
  }
}
$focusConfirmed = if ($DryRun) { $null } else { [OwnerOpsWindowFocus]::GetForegroundWindow() -eq $target.Handle }

$rect = [OwnerOpsWindowFocus+RECT]::new()
$dwmResult = [OwnerOpsWindowFocus]::DwmGetWindowAttribute(
  $target.Handle,
  9,
  [ref]$rect,
  [Runtime.InteropServices.Marshal]::SizeOf([type][OwnerOpsWindowFocus+RECT])
)
if ($dwmResult -ne 0 -and -not [OwnerOpsWindowFocus]::GetWindowRect($target.Handle, [ref]$rect)) {
  throw 'Unable to read the ChatGPT window bounds.'
}
$virtualLeft = [OwnerOpsWindowFocus]::GetSystemMetrics(76)
$virtualTop = [OwnerOpsWindowFocus]::GetSystemMetrics(77)
$virtualWidth = [OwnerOpsWindowFocus]::GetSystemMetrics(78)
$virtualHeight = [OwnerOpsWindowFocus]::GetSystemMetrics(79)
$captureLeft = [Math]::Max($rect.Left, $virtualLeft)
$captureTop = [Math]::Max($rect.Top, $virtualTop)
$captureRight = [Math]::Min($rect.Right, $virtualLeft + $virtualWidth)
$captureBottom = [Math]::Min($rect.Bottom, $virtualTop + $virtualHeight)
$width = $captureRight - $captureLeft
$height = $captureBottom - $captureTop
$dpi = [OwnerOpsWindowFocus]::GetDpiForWindow($target.Handle)
if ($width -lt 640 -or $height -lt 480) {
  throw "ChatGPT window is too small for proof capture: ${width}x${height}"
}

$result = [pscustomobject]@{
  processId = $target.ProcessId
  processName = $target.ProcessName
  appVersion = $target.FileVersion
  titleMatched = [bool]($target.Title -match $TitlePattern)
  focusConfirmed = $focusConfirmed
  x = $captureLeft
  y = $captureTop
  width = $width - ($width % 2)
  height = $height - ($height % 2)
  captureClippedToDesktop = [bool]($captureLeft -ne $rect.Left -or $captureTop -ne $rect.Top -or $captureRight -ne $rect.Right -or $captureBottom -ne $rect.Bottom)
  dpi = $dpi
  displayScalePercent = [int][Math]::Round(($dpi / 96.0) * 100)
}

if (-not $DryRun -and -not $result.focusConfirmed) {
  throw 'Windows did not confirm ChatGPT as the foreground window.'
}

$result | ConvertTo-Json -Compress
