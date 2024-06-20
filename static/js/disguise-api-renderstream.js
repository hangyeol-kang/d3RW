/** 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

Copyright (c) [2024] [Hangyeol Kang]

RENDERSTREAM API
https://developer.disguise.one/api/session/renderstream/
*/

document.addEventListener("DOMContentLoaded", () => {
  setupRenderstreamTabClickHandler();
  addButtonGroupRenderstreamClickListener();
  handleRenderstreamTableRowClick();
  clearCardsContainer();
});

function setupRenderstreamTabClickHandler() {
  document.getElementById('v-pills-renderstream-tab').addEventListener('click', () => {
    populateRenderstreamTable()
  });
}

function addButtonGroupRenderstreamClickListener() {
  document.getElementById('button-group-renderstream').addEventListener('click', (event) =>
    handleRenderstreamButtonClick(event.target.id)
  );
}

function handleRenderstreamTableRowClick() {
  document.getElementById('tableBody-renderstream').addEventListener('click', () => {
    const selectedLayerRows = document.querySelectorAll('#tableBody-renderstream tr.selected');
    populateLayerStatusCards(selectedLayerRows);
  });
}

async function fetchGetRenderstream(apiEndPoint) {
  try {
    const apiUrl = constructApiUrl(`/api/session/renderstream/${apiEndPoint}`)
    const response = await fetch(apiUrl);

    const data = await response.json();
    await showAlert(data)

    return data.result
  }
  catch (error) {
    console.error('Error:', error);
    await showAlert('Request failed. Check if the network connection is stable or if d3 is running.')
  }
}

async function fetchPostRenderstream(selectedLayerRows, apiEndPoint) {
  try {
    const requestData = {
      layers: Array.from(selectedLayerRows).map(row => ({
        uid: row.dataset.uid,
        name: row.dataset.name
      }))
    };

    const apiUrl = constructApiUrl(`/api/session/renderstream/${apiEndPoint}`)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();
    await showAlert(data)

    return data.result
  } catch (error) {
    console.error('Error:', error);
    await showAlert('Request failed. Check if the network connection is stable.')
  }
}

// Function to clear the renderstream table body
function clearRenderstreamTableBody() {
  const tableBody = document.getElementById('tableBody-renderstream');
  tableBody.innerHTML = '';
}

// Function to process the layer
async function processRenderstreamLayer(layer) {
  const apiEndPoint = `layerconfig?uid=${layer.uid}&name=${layer.name}`
  const layerConfigData = await fetchGetRenderstream(apiEndPoint);

  if (!layerConfigData) return null;

  const { asset, pool, channelMappings } = layerConfigData;
  const channelMappingData = channelMappings.map(({ channel, mapping, assigner }) => ({ channel, mappingName: mapping.name, assignerName: assigner.name }));

  return { uid: layer.uid, name: layer.name, asset: asset ? asset.name : 'undefined', pool: pool ? pool.name : 'undefined', channelMappings: channelMappingData };
}

// Function to populate the Renderstream table.
async function populateRenderstreamTable() {
  const tableBody = document.getElementById('tableBody-renderstream');
  const layersData = await fetchGetRenderstream('layers')
  if (!layersData) return;

  const sortedLayers = layersData.sort((a, b) => a.name.localeCompare(b.name));

  const tableData = [];

  for (const layer of sortedLayers) {
    const layerInfo = await processRenderstreamLayer(layer);
    if (layerInfo) {
      tableData.push(layerInfo);
    }
  }
  clearRenderstreamTableBody()
  createRenderstreamTableBodyContents(tableData, tableBody);
}

// Function to creat the renderstream table row
function createRenderstreamTableRow(rowData) {
  const row = document.createElement('tr');

  row.addEventListener('click', function () {
    row.classList.toggle('selected');
  });

  row.dataset.uid = rowData.uid;
  row.dataset.name = rowData.name;

  const nameCell = document.createElement('td');
  nameCell.textContent = rowData.name;
  row.appendChild(nameCell);

  const assetCell = document.createElement('td');
  assetCell.textContent = rowData.asset;
  row.appendChild(assetCell);

  const poolCell = document.createElement('td');
  poolCell.textContent = rowData.pool;
  row.appendChild(poolCell);

  const channelMappingsCell = document.createElement('td');
  if (!rowData.channelMappings || rowData.channelMappings.length === 0) {
    channelMappingsCell.textContent = 'undefined';
  } else {
    rowData.channelMappings.forEach(({ channel, mappingName, assignerName }) => {
      const mappingText = document.createTextNode(`${channel} : ${mappingName} Assigner: ${assignerName}`);
      channelMappingsCell.appendChild(mappingText);
      channelMappingsCell.appendChild(document.createElement('br'));
    });
  }

  row.appendChild(channelMappingsCell);

  return row;
}

// Function to create the renderstream table body contents.
function createRenderstreamTableBodyContents(tableData, tableBody) {
  tableData.forEach(rowData => {
    const row = createRenderstreamTableRow(rowData);
    tableBody.appendChild(row);
  });
}

// Function to clear the cards containers.
function clearCardsContainer() {
  const cardsContainer = document.getElementById('cards-container');
  cardsContainer.innerHTML = '';
}

// Function to populate the layer status cards.
async function populateLayerStatusCards(selectedLayerRows) {
  clearCardsContainer()
  const cardsContainer = document.getElementById('cards-container');

  for (const row of selectedLayerRows) {
    const apiEndPoint = `layerstatus?uid=${row.dataset.uid}&name=${row.dataset.name}`
    const layerStatusData = await fetchGetRenderstream(apiEndPoint)

    if (!layerStatusData) return;


    const instanceData = layerStatusData.workload.instances;

    if (layerStatusData && instanceData.length == 0) return;

    createLayerStatusCardsContents(cardsContainer, instanceData, row)
  }
}

// Function to create the layer status cards contents.
function createLayerStatusCardsContents(cardsContainer, instanceData, row) {
  const rowContainer = document.createElement('div');
  rowContainer.classList.add("col-md-6", 'd-flex', 'text-center', 'rowContainer');

  const card = document.createElement('div');
  card.classList.add('card', 'text-bg-light', 'mb-3', 'd-flex', 'text-center');
  card.id = `renderstreamCard-${row.dataset.uid}`;

  const cardHeader = document.createElement('div');
  cardHeader.classList.add('card-header');
  cardHeader.style.fontSize = 'small';
  cardHeader.textContent = row.dataset.name;

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'list-group-flush');

  instanceData.forEach(instance => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.style.fontSize = 'small';
    listItem.textContent = `${instance.machineName}, ${instance.state}, ${instance.healthMessage}`;
    listGroup.appendChild(listItem);
  });

  cardBody.appendChild(listGroup);
  card.appendChild(cardHeader);
  card.appendChild(cardBody);
  rowContainer.appendChild(card);
  cardsContainer.appendChild(rowContainer);
}

// Function to create a list item for an instance
function createInstanceListItem(instance) {
  const listItem = document.createElement('li');
  listItem.classList.add('list-group-item');
  listItem.style.fontSize = 'small';
  listItem.textContent = `${instance.machineName}, ${instance.state}, ${instance.healthMessage}`;
  return listItem;
}

// Function to update the list of instances in a card
function updateInstanceList(listContainer, instanceData) {
  listContainer.innerHTML = '';
  instanceData.forEach(instance => {
    const listItem = createInstanceListItem(instance);
    listContainer.appendChild(listItem);
  });
}

// Function to update the layer status for a specific row
async function updateLayerStatusForRow(row) {
  const apiEndPoint = `layerstatus?uid=${row.dataset.uid}&name=${row.dataset.name}`;
  const layerStatusData = await fetchGetRenderstream(apiEndPoint);

  if (!layerStatusData) return;

  const instanceData = layerStatusData.workload.instances;
  const renderstreamCard = document.getElementById(`renderstreamCard-${row.dataset.uid}`);

  if (!renderstreamCard) return;

  const listContainer = renderstreamCard.querySelector('ul');
  updateInstanceList(listContainer, instanceData);
}

// Function to update the layer status for selected layer rows
async function updateLayerStatus(selectedLayerRows) {
  for (const row of selectedLayerRows) {
    await updateLayerStatusForRow(row);
  }
}


// Function to toogle the monitoring mode.
function toggleMonitoringMode() {
  const btnMonitoringMode = document.getElementById("monitoring-mode");
  btnMonitoringMode.classList.toggle("activated-background");

  if (btnMonitoringMode.classList.contains("activated-background")) {
    toggleMonitoringMode.updateInterval = setInterval(() => {
      const selectedRows = document.querySelectorAll('#tableBody-renderstream tr.selected');
      updateLayerStatus(selectedRows);
    }, 1000);

  } else {
    clearInterval(toggleMonitoringMode.updateInterval);
    toggleMonitoringMode.updateInterval = null;
  }
}

// Function to handel the Renderstream button click.
async function handleRenderstreamButtonClick(buttonId) {
  switch (buttonId) {
    case "refresh-layers":
      await populateRenderstreamTable()
      break;
    case "monitoring-mode":
      toggleMonitoringMode()
      break;
    default:
      const selectedLayerRows = document.querySelectorAll('#tableBody-renderstream tr.selected');
      await fetchPostRenderstream(selectedLayerRows, buttonId)
      break;
  }
}

