tell application "System Events"
  if not (exists process "ChatGPT") then error "ChatGPT Desktop is not running."
end tell

tell application "ChatGPT" to activate
delay 0.5

tell application "System Events"
  tell process "ChatGPT"
    if (count of windows) is not 1 then error "Expected exactly one ChatGPT Desktop window."
    set windowPosition to position of front window
    set windowSize to size of front window
    return ((item 1 of windowPosition) as text) & "," & ((item 2 of windowPosition) as text) & "," & ((item 1 of windowSize) as text) & "," & ((item 2 of windowSize) as text)
  end tell
end tell
