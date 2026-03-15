# Line Endings Configuration

This project is configured to use **LF (Unix-style)** line endings in the Git repository, while allowing developers to use CRLF (Windows-style) in their working directory.

## Understanding the Warnings

When you see:
```
warning: in the working copy of 'file.ts', CRLF will be replaced by LF the next time Git touches it
```

**This is NORMAL and NOT an error.** It means:
1. Your file has Windows line endings (CRLF) in your working directory
2. Git will store it with Unix line endings (LF) in the repository
3. Everyone who clones the repo gets consistent LF line endings

## Configuration Files

### `.gitattributes`
Defines how Git handles line endings per file type:
- Text files: Normalized to LF in repository
- Shell scripts (`.sh`): Always LF
- Batch files (`.bat`): Always CRLF
- Binary files: Left untouched

### `.editorconfig`
Tells your editor to create new files with LF line endings:
- Supported by VS Code, IntelliJ, Sublime Text, Vim, etc.
- Requires EditorConfig plugin in some editors

### Git Config
Repository-level settings:
```bash
core.autocrlf = false  # Don't auto-convert (let .gitattributes handle it)
core.eol = lf          # Default line ending is LF
```

## For Team Members

### First-Time Setup (Recommended)

After cloning the repository:

```bash
# Ensure Git doesn't auto-convert line endings
git config --local core.autocrlf false
git config --local core.eol lf

# Install EditorConfig plugin in your editor
# VS Code: Install "EditorConfig for VS Code" extension
# IntelliJ/WebStorm: Built-in support
# Sublime Text: Install "EditorConfig" package
```

### Option 1: Keep CRLF in Working Directory (Easiest)

**Do nothing.** The warnings are informational only.

✅ **Pros:**
- No changes needed
- Windows tools work fine with CRLF
- Git handles conversion automatically

❌ **Cons:**
- You'll see warnings on every commit
- Some Unix tools may have issues (rare)

### Option 2: Convert Working Directory to LF (Silent Commits)

Convert all files in your working directory to LF:

```bash
# Save your work first!
git add -A
git commit -m "Save work"

# Remove all files from Git's index
git rm --cached -r .

# Restore files with LF line endings
git reset --hard HEAD
```

✅ **Pros:**
- No warnings on commits
- Consistent with repository
- Better for cross-platform tools

❌ **Cons:**
- Some Windows programs expect CRLF (Notepad, older tools)
- May need to convert once per clone

## Verifying Your Setup

```bash
# Check Git settings
git config core.autocrlf
git config core.eol

# Should output:
# false
# lf

# Check file line endings
file src/manifest.json

# Unix style: "... text"
# Windows style: "... text, with CRLF line terminators"
```

## Why LF in Repository?

1. **Cross-platform compatibility**: LF works on Windows, Mac, Linux
2. **Smaller diffs**: No CRLF ↔ LF noise in version control
3. **CI/CD consistency**: Most CI systems (GitHub Actions, GitLab CI) run on Linux
4. **Shell script compatibility**: `.sh` files MUST have LF to execute

## Common Issues

### Issue: "CRLF will be replaced by LF" warnings

**Solution:** This is expected on Windows. Choose Option 1 or 2 above.

### Issue: Shell scripts won't execute (`./script.sh: bad interpreter`)

**Cause:** Script has CRLF instead of LF

**Solution:**
```bash
# Convert to LF
dos2unix script.sh
# Or
git add --renormalize script.sh
```

### Issue: Pre-commit hook won't run on Windows

**Cause:** Hook file has CRLF (Git Bash requires LF)

**Solution:**
```bash
# Convert hook to LF
git add --renormalize .git/hooks/pre-commit
```

## For More Information

- [Git Line Endings Documentation](https://git-scm.com/docs/gitattributes#_end_of_line_conversion)
- [EditorConfig Specification](https://editorconfig.org/)
- [GitHub: Dealing with line endings](https://docs.github.com/en/get-started/getting-started-with-git/configuring-git-to-handle-line-endings)
