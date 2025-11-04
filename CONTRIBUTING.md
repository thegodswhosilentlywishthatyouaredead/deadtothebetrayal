# Contributing to AIFF

Thank you for considering contributing to AIFF (Advanced Intelligence Field Force)! This document provides guidelines and information for contributors.

## 🌟 How to Contribute

### Reporting Bugs

Before creating a bug report, please check if the issue already exists. If it doesn't:

1. **Use a clear, descriptive title**
2. **Provide steps to reproduce** the issue
3. **Include browser/environment details**:
   - Browser and version
   - Operating system
   - Python version
   - Node.js version (if applicable)
4. **Add console errors**: Copy from browser DevTools (F12)
5. **Include screenshots** if relevant
6. **Describe expected vs actual behavior**

### Suggesting Enhancements

1. **Check existing feature requests** in Issues
2. **Provide a clear use case** for the feature
3. **Explain how it benefits users** (field teams, admins, etc.)
4. **Consider implementation complexity**
5. **Suggest alternative approaches** if applicable

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/YourFeatureName`
3. **Make your changes** following code style guidelines
4. **Test thoroughly** in both English and Bahasa Malaysia
5. **Update documentation** if needed
6. **Commit with descriptive messages** (see commit guidelines below)
7. **Push to your fork**: `git push origin feature/YourFeatureName`
8. **Open a Pull Request** with clear description

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code formatting (no logic changes)
- **refactor**: Code restructuring (no behavior change)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(chatbot): Add OpenAI integration with Bahasa Malaysia support

- Integrated GPT-3.5-turbo for intelligent responses
- Added language switching (EN ⇄ BM)
- Implemented personalized performance insights
- Created intelligent fallback system

Resolves #123
```

```
fix(field-portal): Resolve chatbot toggle not opening

- Added inline onclick handler to chatbot toggle div
- Exposed toggleFieldAIChatbot to window object
- Fixed function availability timing issue
- Updated script version for cache busting

Fixes #456
```

## 💻 Development Setup

### Prerequisites

- **Python 3.9+**: Backend development
- **Node.js 16+**: For package management (optional)
- **Git**: Version control
- **Modern browser**: Chrome, Firefox, Safari, or Edge
- **Code editor**: VS Code, Sublime, or your preference

### Local Setup

1. **Clone your fork**:
```bash
git clone https://github.com/YOUR_USERNAME/deadtothebetrayal.git
cd new2
```

2. **Install dependencies** (optional):
```bash
# For OpenAI features
pip install openai

# For development
pip install flask flask-cors
```

3. **Start backend**:
```bash
python3 backend_server.py
```

4. **Start frontend** (new terminal):
```bash
cd client
python3 -m http.server 8080
```

5. **Access application**:
- Admin: http://localhost:8080/public/index.html
- Field: http://localhost:8080/public/field-portal.html

## 🎨 Code Style Guidelines

### JavaScript

- **Use ES6+** features (const/let, arrow functions, template literals)
- **Function naming**: camelCase, descriptive names
- **Comments**: Add JSDoc for complex functions
- **Error handling**: Always use try-catch for async operations
- **Console logs**: Use emoji prefixes for visual clarity (✅, ❌, 🔵, etc.)

**Example**:
```javascript
/**
 * Load and display user-specific tickets
 * @param {string} userId - The current user's team ID
 * @returns {Promise<Array>} Array of filtered tickets
 */
async function loadUserTickets(userId) {
    try {
        console.log('🔵 Loading tickets for user:', userId);
        const response = await fetch(`${API_BASE}/ticketv2?limit=20000`);
        const data = await response.json();
        const userTickets = data.tickets.filter(t => t.assignedTeam === userId);
        console.log('✅ Loaded tickets:', userTickets.length);
        return userTickets;
    } catch (error) {
        console.error('❌ Error loading tickets:', error);
        return [];
    }
}
```

### Python

- **PEP 8**: Follow Python style guide
- **Type hints**: Use when helpful
- **Docstrings**: Add for all functions
- **Error handling**: Use try-except appropriately
- **Print statements**: Use emoji prefixes for clarity

**Example**:
```python
def generate_intelligent_response(message: str, context: dict, language: str = 'en') -> str:
    """
    Generate intelligent AI response without OpenAI.
    
    Args:
        message: User's input message
        context: Dict with user metrics (tickets, efficiency, etc.)
        language: 'en' for English, 'ms' for Bahasa Malaysia
        
    Returns:
        HTML-formatted response string
    """
    msg_lower = message.lower()
    
    if language == 'en':
        if 'performance' in msg_lower:
            return f"<p>Your completion rate: {context['completionRate']}%</p>"
    # ... more logic
```

### HTML/CSS

- **Indentation**: 4 spaces (no tabs)
- **Class naming**: kebab-case (ai-chatbot-container)
- **Semantic HTML**: Use appropriate tags (<button>, <nav>, etc.)
- **Accessibility**: Add aria-labels, alt text, role attributes
- **Comments**: Section comments for large blocks

**Example**:
```html
<!-- nBOTS AI Chatbot -->
<div id="ai-chatbot" class="ai-chatbot-container">
    <div id="ai-chatbot-toggle" 
         class="ai-chatbot-toggle" 
         onclick="toggleFieldAIChatbot()" 
         role="button" 
         tabindex="0" 
         aria-label="Open nBOTS chatbot">
        <i class="fas fa-robot"></i>
    </div>
</div>
```

## 🧪 Testing Guidelines

### Before Submitting PR

- [ ] Test in **Chrome** and at least one other browser
- [ ] Test **both English and Bahasa Malaysia** modes
- [ ] Test on **mobile** (or responsive view)
- [ ] Check **console for errors** (should be none)
- [ ] Verify **no linting errors**
- [ ] Test **with and without OpenAI API key** (if chatbot changes)
- [ ] **Hard refresh** browser to verify no caching issues
- [ ] Check **all existing features still work**

### Manual Testing Checklist

**Admin Dashboard**:
- [ ] Overview KPIs show correct data
- [ ] Ticket list loads and paginates
- [ ] Filters work correctly
- [ ] Charts render without errors
- [ ] nBOTS chatbot opens and responds

**Field Portal**:
- [ ] Login works (blank team ID auto-assigns)
- [ ] KPIs show user-specific data (not system-wide)
- [ ] Ticket list filtered to logged user
- [ ] Route planning displays correctly
- [ ] nBOTS chatbot shows personalized data

**Language Support**:
- [ ] EN/BM toggle works in both portals
- [ ] All labels translated correctly
- [ ] AI responses in correct language
- [ ] No mixed language text

## 🔍 Code Review Process

### What Reviewers Look For

1. **Functionality**: Does it work as intended?
2. **Code quality**: Is it clean, readable, maintainable?
3. **Performance**: Any negative impact on speed?
4. **Security**: Any vulnerabilities introduced?
5. **Documentation**: Is it documented properly?
6. **Tests**: Are there tests (if applicable)?
7. **Compatibility**: Works in all browsers?
8. **Bilingual**: Supports EN and BM?

### Review Timeline

- **Small fixes**: 1-2 days
- **New features**: 3-5 days
- **Major changes**: 1-2 weeks

## 📚 Documentation Standards

### When to Update Documentation

Update docs when you:
- Add a new feature
- Change an API endpoint
- Fix a significant bug
- Modify configuration
- Change user workflows
- Add dependencies

### Documentation Files

- **README.md**: Overview and quick start
- **CHANGELOG.md**: Version history (update this!)
- **OPENAI_INTEGRATION.md**: For AI chatbot changes
- **[FEATURE].md**: Create new file for major features

### Documentation Style

- **Clear headings**: Use H1-H6 appropriately
- **Code examples**: Always include working examples
- **Screenshots**: Add for UI changes
- **Emojis**: Use for visual appeal (but don't overdo it)
- **Links**: Cross-reference related docs

## 🌍 Bilingual Development

### Adding Bahasa Malaysia Support

When adding new features with text:

1. **Create both versions**: English and Bahasa Malaysia
2. **Use proper Malay**: Not just Google Translate
3. **Check with native speaker** if possible
4. **Test language switching**: Should work seamlessly

**Example**:
```javascript
const messages = {
    en: {
        welcome: 'Welcome',
        tickets: 'Your Tickets',
        performance: 'Performance'
    },
    ms: {
        welcome: 'Selamat datang',
        tickets: 'Tiket Anda',
        performance: 'Prestasi'
    }
};

const getText = (key) => messages[currentLanguage][key];
```

## 🚨 Common Pitfalls

### Browser Caching

**Problem**: JavaScript changes don't appear after refresh  
**Solution**: 
- Increment version number in script tag: `?v=28`
- Or define critical functions inline in HTML
- Or use hard refresh (Ctrl+Shift+R)

### Function Not Defined

**Problem**: `ReferenceError: functionName is not defined`  
**Solution**:
- Expose to window object: `window.functionName = functionName;`
- Do it immediately after function definition
- For onclick handlers, use inline or addEventListener

### CSS Not Applying

**Problem**: Elements have no styling  
**Solution**:
- Check class names match CSS (exact match required)
- Verify CSS is in <style> tag before HTML elements
- Check browser inspector for which styles are applied

### API 404 Errors

**Problem**: `Failed to load resource: 404`  
**Solution**:
- Verify backend is running on correct port
- Check API_BASE configuration
- Test endpoint with curl first
- Check Flask route definition

## 🎯 Priority Areas for Contribution

### High Priority

- [ ] **PostgreSQL migration**: Move from in-memory to persistent database
- [ ] **Unit tests**: Add pytest for backend, Jest for frontend
- [ ] **API rate limiting**: Prevent abuse
- [ ] **Real-time updates**: WebSocket integration
- [ ] **Performance profiling**: Identify bottlenecks

### Medium Priority

- [ ] **Additional languages**: Tamil, Mandarin
- [ ] **Voice input**: Speech-to-text for chatbot
- [ ] **Image upload**: Ticket photo documentation
- [ ] **Advanced charts**: More visualization options
- [ ] **Export features**: PDF, Excel reports

### Low Priority

- [ ] **Dark mode**: UI theme toggle
- [ ] **Keyboard shortcuts**: Power user features
- [ ] **Accessibility**: WCAG 2.1 compliance
- [ ] **Offline mode**: PWA with service workers
- [ ] **Print styles**: Optimized for printing

## 📧 Contact

- **GitHub Issues**: https://github.com/thegodswhosilentlywishthatyouaredead/deadtothebetrayal/issues
- **Discussions**: Use GitHub Discussions for questions
- **Pull Requests**: For code contributions

## 🙏 Recognition

Contributors will be recognized in:
- README.md Contributors section
- CHANGELOG.md for each release
- GitHub Contributors page

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AIFF!** 🎉

Every contribution, no matter how small, helps improve the system for field teams across Malaysia. 🇲🇾

**Last Updated**: November 4, 2025  
**Maintainer**: HN NASE

