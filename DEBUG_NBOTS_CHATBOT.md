# Debug nBOTS Chatbot - Field Portal

## Issue Fixed (v=24)

### What Was Wrong
1. **Duplicate DOMContentLoaded listeners** - Two listeners were competing to initialize the chatbot
2. **Functions not globally accessible** - onclick handlers couldn't find the functions
3. **Timing issue** - Greeting was loading before data was ready

### Fixes Applied
1. ✅ Removed duplicate DOMContentLoaded listener (line 3266)
2. ✅ Consolidated chatbot init into main DOMContentLoaded (line 71-85)
3. ✅ Added 1-second delay before loading greeting
4. ✅ Exposed all functions to window object (lines 3282-3287)
5. ✅ Updated script version to v=24 for cache busting

## Quick Test

### 1. Hard Refresh
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 2. Open Console
Press `F12` or right-click > Inspect > Console

### 3. Check Initialization
Look for these console messages:
```
✅ nBOTS chatbot initialized
✅ Field Portal JavaScript loaded successfully
```

### 4. Test Toggle
Click the purple robot button in bottom-right corner. It should:
- Open with smooth animation
- Display "Loading performance insights..." briefly
- Show personalized greeting after ~1 second

## Diagnostic Commands

Paste these into browser console (F12) to diagnose issues:

### Check if chatbot elements exist
```javascript
console.log('Toggle button:', document.getElementById('ai-chatbot-toggle'));
console.log('Chat window:', document.getElementById('ai-chatbot-window'));
console.log('Messages container:', document.getElementById('ai-chatbot-messages'));
```

Expected output: All should return HTML elements, not null

### Check if functions are loaded
```javascript
console.log('toggleFieldAIChatbot:', typeof toggleFieldAIChatbot);
console.log('clearFieldAIChat:', typeof clearFieldAIChat);
console.log('switchFieldAILanguage:', typeof switchFieldAILanguage);
console.log('askFieldAI:', typeof askFieldAI);
console.log('loadFieldAIPerformanceGreeting:', typeof loadFieldAIPerformanceGreeting);
```

Expected output: All should return "function"

### Check chatbot state
```javascript
console.log('Chatbot open:', window.fieldAIChatbotOpen);
console.log('Current language:', window.fieldAICurrentLanguage);
console.log('Chat history:', window.fieldAIChatHistory);
```

Expected output: 
- `fieldAIChatbotOpen`: false (if closed) or true (if open)
- `fieldAICurrentLanguage`: "en" or "ms"
- `fieldAIChatHistory`: array (might be empty)

### Manually trigger toggle
```javascript
toggleFieldAIChatbot();
```

Expected result: Chat window should open or close

### Check API connectivity
```javascript
fetch('http://localhost:5002/api/ticketv2?limit=10')
    .then(r => r.json())
    .then(d => console.log('Tickets API:', d))
    .catch(e => console.error('Tickets API Error:', e));

fetch('http://localhost:5002/api/teams')
    .then(r => r.json())
    .then(d => console.log('Teams API:', d))
    .catch(e => console.error('Teams API Error:', e));
```

Expected output: Should show ticket and team data, not errors

### Manually load greeting
```javascript
loadFieldAIPerformanceGreeting()
    .then(() => console.log('✅ Greeting loaded'))
    .catch(e => console.error('❌ Greeting error:', e));
```

Expected result: Greeting should appear in chat window

## Common Issues & Solutions

### Issue 1: "toggleFieldAIChatbot is not defined"
**Cause**: Functions not exposed globally  
**Solution**: 
1. Hard refresh (Ctrl+Shift+R)
2. Verify script version is v=24 in HTML
3. Check console for "Field Portal JavaScript loaded successfully"

### Issue 2: Chat window doesn't open
**Cause**: Element not found or event listener not attached  
**Solution**:
```javascript
// Check if element exists
const toggle = document.getElementById('ai-chatbot-toggle');
console.log('Toggle element:', toggle);

// Manually attach listener
if (toggle) {
    toggle.addEventListener('click', () => {
        console.log('Toggle clicked!');
        toggleFieldAIChatbot();
    });
}
```

### Issue 3: Greeting shows "Loading..." forever
**Cause**: API not responding or data fetch failed  
**Solution**:
1. Check backend is running: `curl http://localhost:5002/api/ticketv2?limit=1`
2. Check browser Network tab (F12 > Network) for failed requests
3. Look for errors in console
4. Manually trigger: `loadFieldAIPerformanceGreeting()`

### Issue 4: "Cannot read properties of null"
**Cause**: HTML elements not found  
**Solution**:
```javascript
// Verify all required elements exist
['ai-chatbot-toggle', 'ai-chatbot-window', 'ai-chatbot-messages', 'ai-chatbot-input'].forEach(id => {
    const el = document.getElementById(id);
    console.log(`${id}:`, el ? 'Found ✓' : 'Missing ✗');
});
```

### Issue 5: Language toggle doesn't work
**Cause**: Language buttons not calling function correctly  
**Solution**:
```javascript
// Manually switch language
switchFieldAILanguage('ms');  // Switch to Bahasa Malaysia
switchFieldAILanguage('en');  // Switch back to English
```

## Advanced Debugging

### Monitor all chatbot events
```javascript
// Override functions to log calls
const original = {
    toggle: window.toggleFieldAIChatbot,
    send: window.sendFieldAIChatbotMessage,
    clear: window.clearFieldAIChat
};

window.toggleFieldAIChatbot = function() {
    console.log('🔵 toggleFieldAIChatbot called');
    return original.toggle.apply(this, arguments);
};

window.sendFieldAIChatbotMessage = function() {
    console.log('🔵 sendFieldAIChatbotMessage called');
    return original.send.apply(this, arguments);
};

window.clearFieldAIChat = function() {
    console.log('🔵 clearFieldAIChat called');
    return original.clear.apply(this, arguments);
};

console.log('✅ Chatbot event monitoring enabled');
```

### Check CSS classes
```javascript
const window = document.getElementById('ai-chatbot-window');
console.log('Window classes:', window.className);
console.log('Has active class:', window.classList.contains('active'));
```

Expected: 
- When closed: `ai-chatbot-window`
- When open: `ai-chatbot-window active`

### Force open chatbot
```javascript
const chatWindow = document.getElementById('ai-chatbot-window');
chatWindow.classList.add('active');
window.fieldAIChatbotOpen = true;
console.log('✅ Chatbot forced open');
```

### Reset chatbot state
```javascript
window.fieldAIChatbotOpen = false;
window.fieldAICurrentLanguage = 'en';
window.fieldAIChatHistory = [];
document.getElementById('ai-chatbot-window').classList.remove('active');
console.log('✅ Chatbot state reset');
```

## Browser-Specific Issues

### Chrome/Edge
- Clear site data: DevTools > Application > Clear storage > Clear site data
- Disable cache: DevTools > Network > ✓ Disable cache (keep DevTools open)

### Firefox
- Bypass cache: Ctrl+Shift+R
- Clear cache: Ctrl+Shift+Delete > Choose "Cache" > Clear Now

### Safari
- Hard reload: Cmd+Option+R
- Clear cache: Safari > Clear History > All History

## Still Not Working?

If chatbot still doesn't work after all debugging:

1. **Check file versions**:
```bash
# In terminal
cd /Users/thegods/Documents/GitHub/new2
grep "field-portal.js" client/public/field-portal.html
```
Should show: `field-portal.js?v=24`

2. **Verify backend is running**:
```bash
curl http://localhost:5002/api/ticketv2?limit=1
```
Should return JSON with tickets data

3. **Check for JavaScript errors**:
- Open Console (F12)
- Reload page
- Look for red error messages
- Copy and paste errors for further debugging

4. **Try incognito/private mode**:
- Opens fresh browser without cache
- If works here, it's a caching issue

5. **Compare with main dashboard**:
- Open `http://localhost:8080/public/index.html`
- Check if nBOTS works there
- If yes, compare console logs between pages

## Success Indicators

✅ Chatbot is working if:
1. Console shows "✅ nBOTS chatbot initialized"
2. Purple robot button appears bottom-right
3. Button has hover effect (scales up)
4. Clicking button opens chat window smoothly
5. Greeting loads within 1-2 seconds
6. Can send messages and get responses
7. Language toggle switches EN ⇄ BM
8. Clear chat button reloads greeting

## Contact Information

If issue persists, provide:
- Browser version
- Console errors (copy all red text)
- Network errors (F12 > Network > failed requests)
- Screenshot of chatbot button/window
- Result of diagnostic commands above

---
**Last Updated**: Nov 4, 2025  
**Script Version**: v=24  
**Status**: Fixed - Ready for testing

