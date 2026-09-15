const container = document.getElementById('checklist-container');

async function loadAndRender() {
    // 1. Get the parameter from the URL (e.g., index.html?list=01)
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('list') || '01'; // Default to '01' if no param exists

    try {
        // 2. Dynamically import the file based on the URL parameter
        const module = await import(`./data_${listId}.js`);
        const checklistData = module.checklistData;

        // 3. Render the list (using your existing logic)
        renderChecklist(checklistData);
    } catch (err) {
        container.innerHTML = `<p style="color:red">Error: Data file 'data_${listId}.js' not found.</p>`;
        console.error(err);
    }
}

function renderChecklist(data) {
    container.innerHTML = ''; 

    data.forEach(parent => {
        const parentDiv = createItemElement(parent, false);
        
        // Parent Logic
        const parentCheckbox = parentDiv.querySelector('input');
        parentCheckbox.addEventListener('change', () => {
            parent.completed = parentCheckbox.checked;
            if (parent.subitems) {
                parent.subitems.forEach(sub => sub.completed = parent.completed);
            }
            renderChecklist(data); // Re-render with current data
        });

        container.appendChild(parentDiv);

        // Sub-item Logic
        if (parent.subitems) {
            parent.subitems.forEach(sub => {
                const subDiv = createItemElement(sub, true);
                const subCheckbox = subDiv.querySelector('input');
                subCheckbox.addEventListener('change', () => {
                    sub.completed = subCheckbox.checked;
                    const allChecked = parent.subitems.every(s => s.completed);
                    parent.completed = allChecked;
                    renderChecklist(data);
                });
                container.appendChild(subDiv);
            });
        }
    });
}

function createItemElement(data, isSubItem) {
    const itemDiv = document.createElement('div');
    itemDiv.className = isSubItem ? 'item sub-item' : 'item parent-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = data.completed;

    const label = document.createElement('span');
    label.textContent = data.task;
    if (data.completed) label.className = 'completed';

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    return itemDiv;
}

// Start the app
loadAndRender();
