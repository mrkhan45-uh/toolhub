// ==========================================
// Base Utilities & Theming
// ==========================================

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Initialize Dark Mode
function initTheme() {
    const savedTheme = localStorage.getItem('toolhub-theme');
    
    // Check system preference if no saved theme
    if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        updateThemeIcon(true);
    } 
    // Apply saved theme
    else if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        updateThemeIcon(true);
    } else {
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
        updateThemeIcon(false);
    }
}

function updateThemeIcon(isDark) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (isDark) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Toggle Theme
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
        localStorage.setItem('toolhub-theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    });
}

// Run init on load
initTheme();

// ==========================================
// Global Toast Notifications
// ==========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    let icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    // Auto remove after 3s
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// Homepage Logic (Grid & Filtering)
// ==========================================

const toolsGrid = document.getElementById('tools-grid');
const searchInput = document.getElementById('tool-search');
const filterChips = document.querySelectorAll('.chip');
const noResults = document.getElementById('no-results');

let allToolsInfo = [];

async function loadTools() {
    // Only run if we are on a page with the tools grid
    if (!toolsGrid) return;
    
    try {
        // Since we created tools-data.json at the root, we fetch it
        // Note: For subdirectory tool pages, this path would need adjustment, 
        //   but the grid is only on index.html
        const res = await fetch('tools-data.json');
        
        if (!res.ok) throw new Error('Network response was not ok');
        allToolsInfo = await res.json();
        
        renderGrid(allToolsInfo);
    } catch (err) {
        console.error("Failed to load tools data. If you are using 'file://', you must run a local server or host it.", err);
        toolsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 2rem; border: 1px dashed red;">
                <p><strong>Error loading tools data.</strong></p>
                <p>CORS strictly blocks fetch() on file:// protocols.</p>
                <p>Use Live Server in VS Code, or host the folder securely to view the tools.</p>
            </div>
        `;
    }
}

function renderGrid(tools) {
    if (!toolsGrid) return;
    
    toolsGrid.innerHTML = '';
    
    if (tools.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        
        tools.forEach(tool => {
            const card = document.createElement('a');
            // Assuming tools are generated in a /tools/ folder
            card.href = `tools/${tool.id}.html`;
            card.className = 'tool-card';
            card.dataset.category = tool.category;
            card.dataset.name = tool.name.toLowerCase();
            
            card.innerHTML = `
                <div class="tool-icon"><i class="${tool.icon}"></i></div>
                <h3 class="tool-title">${tool.name}</h3>
                <p class="tool-desc">${tool.desc}</p>
            `;
            
            toolsGrid.appendChild(card);
        });
    }
}

// Search Functionality
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        // Reset category active state to 'All'
        filterChips.forEach(chip => chip.classList.remove('active'));
        document.querySelector('.chip[data-filter="all"]')?.classList.add('active');
        
        const filtered = allToolsInfo.filter(tool => {
            return tool.name.toLowerCase().includes(term) || tool.desc.toLowerCase().includes(term);
        });
        
        renderGrid(filtered);
    });
}

// Category Filtering
if (filterChips) {
    filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            // Update active state
            filterChips.forEach(c => c.classList.remove('active'));
            const target = e.target;
            target.classList.add('active');
            
            // Clear Search
            if (searchInput) searchInput.value = '';
            
            const filterValue = target.dataset.filter;
            
            if (filterValue === 'all') {
                renderGrid(allToolsInfo);
            } else {
                const filtered = allToolsInfo.filter(tool => tool.category === filterValue);
                renderGrid(filtered);
            }
        });
    });
}

// Init Load
loadTools();
