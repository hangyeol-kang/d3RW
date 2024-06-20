/** 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

Copyright (c) [2024] [Hangyeol Kang]

PROJECT API
https://developer.disguise.one/api/service/project/

STATUS API
https://developer.disguise.one/api/session/status/
*/

document.addEventListener("DOMContentLoaded", () => {
    setupProjectTabClickHandler();
    addButtonGroupProjectClickListener();
});


function setupProjectTabClickHandler() {
    document.getElementById('v-pills-project-tab').addEventListener('click', async () => {
        await populateSystemsTable();
        await populateProjectsTable();
    });
}


function addButtonGroupProjectClickListener() {
    const buttonGroupProject = document.getElementById('button-group-project');
    buttonGroupProject.addEventListener('click', handleButtonGroupProjectClick);
}

function handleButtonGroupProjectClick(event) {
    if (event.target.id.includes('all')) {
        handleProjectButtonClickAll(event.target.id);
    } else {
        handleProjectButtonClick(event.target.id);
    }
}

async function fetchGetSystem(apiEndPoint) {
    try {
        const apiUrl = constructApiUrl(`/api/service/system/${apiEndPoint}`)
        const response = await fetch(apiUrl);

        const data = await response.json();
        await showAlert(data)
        return data.result
    } catch (error) {
        console.error('Error:', error);
        await showAlert('Request failed. Check if the network connection is stable or if d3 is running.')
    }
}

async function fetchPostProject(apiEndPoint, requestBody, ipAddress) {
    try {
        const apiUrl = `http://${ipAddress}:${portInput.dataset.port}/api/service/project/${apiEndPoint}`
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        await showAlert(data)
    } catch (error) {
        console.error('Error:', error);
        await showAlert('Request failed. Check if the network connection is stable.')
    }
}

// Function to clear the project table body.
function celarPrjoectTableBody() {
    const tableBody = document.querySelector('#table-project tbody');
    tableBody.innerHTML = '';
}

// Function to the populate projects table.
async function populateProjectsTable() {
    celarPrjoectTableBody()
    const projectsData = await fetchGetSystem('projects')
    if (!projectsData) return;

    const tableBody = document.querySelector('#table-project tbody');
    createProjectsTableBodyContents(projectsData, tableBody)
}

// Function to create a table row for a given project
function createProjectTableRow(project) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${project.path}</td>
        <td>${project.version.major}.${project.version.minor}.${project.version.hotfix}.${project.version.revision}</td>
        <td>${project.lastModified}</td>
    `;
    return row;
}

// Function to create the project tablebody contents. 
function createProjectsTableBodyContents(projectsData, tableBody) {
    const hostname = getHostname()
    projectsData.forEach(project => {
        // Iterate through the project list within each project object
        project.projects.forEach(data => {
            if (hostname.toLowerCase() !== project.hostname.toLowerCase()) return;

            const row = createProjectTableRow(data);

            // Add event listener to toggle row selection on click
            row.addEventListener('click', () => handleProjectRowSelection(row, data));

            tableBody.appendChild(row);
            // Assuming imgIndicator is defined somewhere in your code
            if (typeof imgIndicator !== 'undefined') {
                imgIndicator.style.filter = 'hue-rotate(0deg)';
            }
        });
    });
}

// Function to clear the system table body.
function clearSystemTableBody() {
    const tableBody = document.querySelector('#table-system tbody');
    tableBody.innerHTML = '';
}

// Function to populate the system table.
async function populateSystemsTable() {
    clearSystemTableBody()
    const tableBody = document.querySelector('#table-system tbody');

    const systemsData = await withNetworkIndicator(fetchGetSystem, 'detectsystems');
    if (!systemsData) return;

    createSystemTableBodyContents(systemsData, tableBody)
}

// Function to create a table row for a given system
function createSystemTableRow(system, ipAddress) {
    const row = document.createElement('tr');
    row.dataset.ipAddress = ipAddress;
    row.addEventListener('click', () => row.classList.toggle('selected'));

    row.innerHTML = `
        <td>${system.hostname}</td>
        <td>${system.type}</td>
        <td>${system.runningProject || 'None'}</td>
        <td>${ipAddress}</td> 
    `;
    return row;
}

// Function to set the hostname.
function setHostname(system) {
    if (system.ipAddress !== '127.0.0.1') return;
    const targetIP = document.getElementById('target-ip');
    targetIP.dataset.hostname = system.hostname
}

// Function to get the hostname.
function getHostname() {
    const targetIP = document.getElementById('target-ip');
    return targetIP.dataset.hostname
}

// Function to create the system tablebody contents. 
function createSystemTableBodyContents(systemsData, tableBody) {
    // Iterate through the systems and create table rows.
    for (const system of systemsData) {
        // Replace '127.0.0.1' with ${ipAddressInput.dataset.ipaddress} if ipAddress equals "127.0.0.1".
        const ipAddress = (system.ipAddress === '127.0.0.1') ? `${ipAddressInput.dataset.ipaddress}` : system.ipAddress;
        setHostname(system)
        // Check if system type contains "rx", if true, skip adding the row.
        if (system.type.toLowerCase().includes("rx")) {
            continue;
        }

        const row = createSystemTableRow(system, ipAddress);
        tableBody.appendChild(row);
    }
}

// Function to handle the row selection.
function handleProjectRowSelection(row, project) {
    const selectedRows = document.querySelector('#table-project tbody tr.selected');
    if (selectedRows) {
        selectedRows.classList.remove('selected');
    }
    row.classList.toggle('selected');
    // Set selected project path by removing the prefix from the second '\\' from the end.
    selectedProjectPath = project.path.split('\\').slice(-2)[0] + '\\' + project.path.split('\\').slice(-1)[0];
    row.dataset.projectPath = selectedProjectPath
}


// Function to handle the button clicks.
async function handleProjectButtonClick(buttonId) {
    switch (buttonId) {
        case "refresh-projects":
            await populateSystemsTable();
            await populateProjectsTable();
            break;
        default:
            let requestBody = {};

            if (buttonId === 'startlocalproject') {
                const selectedProjectRows = document.querySelector('#table-project tbody tr.selected');
                if (selectedProjectRows) {
                    requestBody = {
                        projectPath: selectedProjectRows.dataset.projectPath,
                        soloMode: setting.soleMode,
                        allowUpgrade: setting.allowUpgrade
                    };
                }
            }

            const selectedHostRows = document.querySelectorAll('#table-system tbody tr.selected');
            for (const row of selectedHostRows) {
                await fetchPostProject(buttonId, requestBody, row.dataset.ipAddress);
            }
            break;
    }
}

// Function to handle the button clicks for all host
async function handleProjectButtonClickAll(buttonId) {
    const buttonIdBase = buttonId.split('-')[0];
    // Iterate through all table rows to get IP addresses
    const ipAddressList = [];
    document.querySelectorAll('#table-system tbody tr').forEach(row => {
        const ipAddress = row.querySelector('td:last-child').textContent;
        ipAddressList.push(ipAddress);
    });

    for (const ipAddress of ipAddressList) {
        await fetchPostProject(buttonIdBase, {}, ipAddress);
    }
}






