import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

// Remove existing dist directory if it exists
if (existsSync('dist')) {
  console.log('Cleaning existing dist directory...');
}

// Build the project (already done by npm run build, but double-check)
console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });

// Deploy to gh-pages branch
console.log('Deploying to GitHub Pages...');
try {
  // Check if gh-pages branch exists locally
  let branchExists = false;
  try {
    execSync('git show-ref --verify --quiet refs/heads/gh-pages', { stdio: 'ignore' });
    branchExists = true;
  } catch (e) {
    // Branch doesn't exist locally
  }

  // Create or checkout gh-pages branch
  if (branchExists) {
    execSync('git checkout gh-pages', { stdio: 'inherit' });
  } else {
    execSync('git checkout --orphan gh-pages', { stdio: 'inherit' });
    execSync('git rm -rf .', { stdio: 'inherit' });
  }

  // Copy dist contents to root
  execSync('cp -r dist/* .', { stdio: 'inherit' });

  // Commit and push
  execSync('git add .', { stdio: 'inherit' });
  
  try {
    execSync('git commit -m "Deploy to GitHub Pages"', { stdio: 'inherit' });
  } catch (e) {
    // No changes to commit
    console.log('No changes to commit');
  }

  execSync('git push origin gh-pages --force', { stdio: 'inherit' });

  // Switch back to main branch
  execSync('git checkout main', { stdio: 'inherit' });

  console.log('✓ Successfully deployed to GitHub Pages!');
} catch (error) {
  console.error('Error deploying:', error.message);
  // Try to switch back to main branch on error
  try {
    execSync('git checkout main', { stdio: 'ignore' });
  } catch (e) {
    // Ignore checkout errors
  }
  process.exit(1);
}

