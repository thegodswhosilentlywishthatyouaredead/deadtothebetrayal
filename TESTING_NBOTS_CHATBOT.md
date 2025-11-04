# Testing Guide: nBOTS Chatbot in Field Portal

## Quick Start

### 1. Start the Backend Server
```bash
cd /Users/thegods/Documents/GitHub/new2
python3 backend_server.py
```
Wait for: `✅ Flask server running on http://localhost:5002`

### 2. Start the Frontend Server
```bash
cd /Users/thegods/Documents/GitHub/new2/client
python3 -m http.server 8080
```
Access: `http://localhost:8080/public/field-portal.html`

### 3. Login to Field Portal
- Use any team ID or leave blank for auto-assignment
- Password: `field` or `field123`

## Testing Checklist

### Visual Check
- [  ] Chatbot toggle button appears in bottom-right corner
- [  ] Button has purple gradient and robot icon
- [  ] Button has hover effect (scales up)

### Open/Close Functionality
- [  ] Click toggle button - chat window opens with animation
- [  ] Chat window is 520px × 680px
- [  ] Window has purple gradient header with "nBOTS" title
- [  ] Click minimize button (-) - window closes smoothly
- [  ] Click toggle again - window reopens

### Initial Greeting
- [  ] Greeting loads automatically when page loads
- [  ] Displays "Loading performance insights..." spinner initially
- [  ] Replaces with personalized greeting after ~1-2 seconds
- [  ] Shows team name in welcome message
- [  ] Displays "Today's Performance" card with correct metrics
- [  ] Displays "Overall Performance" card with metrics
- [  ] Shows efficiency score and customer rating
- [  ] Displays AI insights (if applicable)
- [  ] Shows recommendations section

### Language Toggle
- [  ] EN and BM buttons visible in header
- [  ] EN is active by default (white background)
- [  ] Click BM - greeting changes to Bahasa Malaysia
- [  ] Click EN - greeting changes back to English
- [  ] All metrics and labels translate correctly

### Data Accuracy
- [  ] Today's ticket count matches dashboard
- [  ] Completed tickets count is correct
- [  ] In Progress tickets count is correct
- [  ] Open tickets count is correct
- [  ] Team name is correct
- [  ] Efficiency score makes sense
- [  ] Customer rating is displayed (⭐ format)

### Suggestion Chips
- [  ] Four suggestion chips displayed below greeting
- [  ] Chips have hover effect (change color, move up)
- [  ] Click "📈 My Performance" - sends query and gets response
- [  ] Click "🎫 My Tickets" - sends query and gets response
- [  ] Click "🔧 Troubleshooting" - sends query and gets response
- [  ] Click "💡 Optimize Work" - sends query and gets response

### Custom Messages
- [  ] Type "show my performance" in input field
- [  ] Press Enter or click send button
- [  ] User message appears on right (green gradient)
- [  ] Typing indicator appears ("nBOTS is thinking...")
- [  ] After 1 second, AI response appears on left
- [  ] Response is relevant to query
- [  ] Chat scrolls to bottom automatically

### Query Responses
Test these queries:
- **"performance"** → Should link to dashboard and mention tickets
- **"ticket"** → Should explain how to view tickets
- **"troubleshoot"** → Should provide safety tips and procedures
- **"optimize"** → Should offer workflow improvement tips
- **"hello"** → Should show fallback with list of available topics

### Clear Chat
- [  ] Send a few messages to populate chat history
- [  ] Click trash icon in header
- [  ] Chat clears and reloads greeting
- [  ] Greeting shows latest data

### Message Formatting
- [  ] User messages have green gradient background
- [  ] AI messages have white background with border
- [  ] User avatar is green with user icon
- [  ] AI avatar is purple with robot icon
- [  ] Messages have proper spacing
- [  ] Long messages wrap correctly
- [  ] Emojis render correctly

### Responsive Design (Mobile)
- [  ] Resize browser to mobile width (< 768px)
- [  ] Chatbot adapts to smaller screen
- [  ] Window becomes 90vw wide
- [  ] Toggle button is 50px × 50px
- [  ] Messages still readable
- [  ] Input field works on mobile

### Performance
- [  ] Page loads quickly
- [  ] Chatbot doesn't block other functionality
- [  ] Opening/closing is smooth
- [  ] No visible lag or flicker
- [  ] Animations are smooth (60fps)

### Error Handling
- [  ] Stop backend server
- [  ] Try to send a message
- [  ] Should show fallback greeting
- [  ] Restart backend - chatbot recovers

### Browser Compatibility
Test in:
- [  ] Chrome/Edge (primary browser)
- [  ] Firefox
- [  ] Safari
- [  ] Mobile browser (iOS Safari or Android Chrome)

## Expected Results

### English Greeting Example
```
👋 Welcome, Abdullah Siti!

I'm nBOTS, your intelligent assistant. Here's your performance summary:

Today's Performance
- Today's Tickets: 5
- Completed: 3
- In Progress: 2
- Open: 0

Overall Performance
- Total Tickets: 47
- Completion Rate: 74.5%
- Efficiency Score: 92.3%
- Customer Rating: ⭐ 4.8/5
- Avg Resolution Time: 3.2h

Insights & Recommendations
• ✅ Great overall completion rate!
• 🔄 You have active tickets in progress

💡 Recommendations:
• Keep up the good work and maintain quality service
```

### Bahasa Malaysia Greeting Example
```
👋 Selamat datang, Abdullah Siti!

Saya nBOTS, pembantu pintar anda. Berikut adalah ringkasan prestasi anda:

Prestasi Hari Ini
- Tiket Hari Ini: 5
- Selesai: 3
- Dalam Proses: 2
- Terbuka: 0

Prestasi Keseluruhan
- Jumlah Tiket: 47
- Kadar Penyelesaian: 74.5%
- Skor Kecekapan: 92.3%
- Penilaian Pelanggan: ⭐ 4.8/5
- Purata Masa Penyelesaian: 3.2j

Pandangan & Cadangan
• ✅ Kadar penyiapan keseluruhan yang bagus!
• 🔄 Anda mempunyai tiket aktif dalam proses

💡 Cadangan:
• Teruskan kerja baik dan kekalkan perkhidmatan berkualiti
```

## Common Issues & Solutions

### Issue: Chatbot doesn't appear
**Solution**: 
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check script version is `?v=23`
- Check browser console for errors

### Issue: Greeting shows "Loading..." forever
**Solution**:
- Check backend server is running
- Check network tab for API errors
- Verify `/api/ticketv2` and `/api/teams` endpoints are working

### Issue: Data doesn't match dashboard
**Solution**:
- Refresh page to reload data
- Check you're logged in as the correct team
- Verify `getCurrentUserId()` returns correct team ID

### Issue: Language toggle doesn't work
**Solution**:
- Check `fieldAICurrentLanguage` variable in console
- Verify button click events are attached
- Clear browser cache and reload

### Issue: Messages don't send
**Solution**:
- Check input field has focus
- Verify Enter key handler is attached
- Check send button is not disabled

## Success Criteria

✅ **Complete Success**: All 60+ checklist items pass  
⚠️ **Partial Success**: 45+ items pass, minor issues noted  
❌ **Needs Work**: Less than 45 items pass, major functionality broken

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual result
4. Screenshot or video
5. Browser console errors
6. Network tab (for API issues)

## Next Steps After Testing

1. **If all tests pass**: Ready for production
2. **If minor issues**: Document and prioritize fixes
3. **If major issues**: Debug and retest
4. **User feedback**: Collect and iterate

---

**Tester**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Result**: ✅ Pass / ⚠️ Partial / ❌ Fail  
**Notes**: ________________

