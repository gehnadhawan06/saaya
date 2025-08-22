# Manual Testing Guide - Screen Share Voice Commands

## 🧪 Test Steps to Verify the Fix

### **Step 1: Initial Setup**
1. Open the app at http://localhost:5174
2. Enter your Gemini API key if prompted
3. You should see:
   - Status bar showing "Screen Inactive" and "Voice Ready"
   - Screen share area with a placeholder and "Start Screen Sharing" button

### **Step 2: Test Voice Commands WITHOUT Screen Sharing**
1. Click the microphone button in the Voice Command section
2. Say something like "How to compose an email in Gmail"
3. **Expected Result**: 
   - ✅ You should see AND hear: "Please start screen sharing first to use voice commands"
   - ✅ This message should appear both as voice feedback AND in the voice guidance text box

### **Step 3: Start Screen Sharing**
1. Click "Start Screen Sharing" button in the main area
2. Select your browser window or entire screen
3. **Expected Result**:
   - ✅ Your shared screen content should appear in the screen share area
   - ✅ Status bar should show "Screen Active"
   - ✅ You should see a green "Screen Sharing Active" overlay in the top-left of the shared content

### **Step 4: Test Voice Commands WITH Screen Sharing**
1. **IMPORTANT**: Make sure the status bar shows "Screen Active"
2. Click the microphone button
3. Say "How to compose an email in Gmail"
4. **Expected Result**:
   - ✅ Should NOT say "Please start screen sharing first"
   - ✅ Should process the command and provide Gmail tutorial steps
   - ✅ Should give voice guidance like "To compose an email, let's first navigate to Gmail..."
   - ✅ Should show tutorial steps in the sidebar

### **Step 5: Test Text Commands WITH Screen Sharing**
1. Type "How to create a new document in Google Docs" in the text input
2. Click send or press Enter
3. **Expected Result**:
   - ✅ Should process the command normally
   - ✅ Should provide step-by-step guidance
   - ✅ Should work exactly like voice commands

## 🐛 Debugging Information

If screen sharing doesn't work properly, check the browser console (F12) for:
- "Screen share stream update: [MediaStream object]" - when sharing starts
- "App state - isScreenSharing: true" - when voice command is triggered
- "App state - screenStream: [MediaStream object]" - when voice command is triggered

## ✅ Success Criteria

The fix is working if:
1. ✅ Voice commands show "Please start screen sharing first" message BOTH in voice AND text when screen sharing is not active
2. ✅ Voice commands work normally (no "start screen sharing" message) when screen is being shared
3. ✅ Text commands also respect the screen sharing status
4. ✅ Status bar correctly shows "Screen Active" when sharing
5. ✅ Tutorial guidance works properly on the shared screen content
