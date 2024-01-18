import {
  InqNormalisedVariable,
  InqPostMessage,
  InqUnusedVariable,
  InqVariableCollection,
} from './models.interface';
import './styles.scss';
import { EventMessages } from './events.enum';

// DOM elements
const inquisitorWrapper = document.getElementById('inquisitor-wrapper');
const filterWrapper = document.getElementById('filter-wrapper');
const filter = document.getElementById('filter');
const variableListing = document.getElementById('variable-listing');
const variableListingBody = document.getElementsByTagName('tbody')[0];

let selectedCollection: string | undefined = '';
let unusedVariables: InqUnusedVariable[] = [];
let localVariables: InqNormalisedVariable[] = [];
let collections: InqVariableCollection[] = [];
let currentPageTitle: string = '';

onmessage = (event) => {
  const data = event.data.pluginMessage;
  setVariables(data);
  buildUI();
};

function setVariables(data: InqPostMessage) {
  const messageType: EventMessages = data.type;

  if (messageType === EventMessages.FIGMA_PLUGIN_STARTED) {
    localVariables = data.localVariables;
    collections = data.collections;
    currentPageTitle = data.currentPageTitle;
    unusedVariables = data.unusedVariables;
  }

  if (messageType === EventMessages.FIGMA_DATA_READY) {
    unusedVariables = data.unusedVariables;
  }
}

function buildUI() {
  if (!variableListing || !filter) {
    return;
  }

  if (!localVariables.length) {
    renderNoVariableView();
    return;
  }
  // render filter control
  filter.onchange = filterResults;
  selectedCollection = renderFilterControl(collections, currentPageTitle, filter);

  // render results
  renderResults(
    unusedVariables,
    localVariables,
    collections,
    selectedCollection ? selectedCollection : ''
  );

  variableListing.style.display = 'table';
}

function renderNoVariableView() {
  if (!variableListing || !filterWrapper || !inquisitorWrapper) {
    return;
  }
  variableListing.style.display = 'none';
  filterWrapper.style.display = 'none';
  inquisitorWrapper.className = 'centerScreen';
}

function filterResults(e: Event) {
  selectedCollection = e.target ? (e.target as HTMLSelectElement).value : '';
  renderResults(
    unusedVariables,
    localVariables,
    collections,
    selectedCollection ? selectedCollection : ''
  );
}

function renderFilterControl(
  collections: InqVariableCollection[],
  currentPageTitle: string,
  parentElement: HTMLElement
): string | undefined {
  let selectedId: string = '';
  parentElement.innerHTML = '';

  const emptyOption = document.createElement('option');
  emptyOption.innerText = '-- show all --';
  emptyOption.value = '';
  parentElement.appendChild(emptyOption);

  collections.forEach((collection: InqVariableCollection) => {
    const option = document.createElement('option');
    option.label = collection.name;
    option.innerText = collection.name;
    option.value = collection.id;

    if (currentPageTitle === collection.name) {
      option.selected = true;
      selectedId = collection.id;
    }

    parentElement.appendChild(option);
  });

  return selectedId ? selectedId : undefined;
}

function renderResults(
  unused: InqUnusedVariable[],
  vars: InqNormalisedVariable[],
  collections: InqVariableCollection[],
  collectionId: string
) {
  variableListingBody.innerHTML = '';

  const c = collectionId
    ? [...collections].filter((collection) => collection.id === collectionId)
    : [...collections];

  renderCollections(c, vars, unused, variableListingBody);
}

function renderCollections(
  collections: InqVariableCollection[],
  variables: InqNormalisedVariable[],
  unusedVars: InqUnusedVariable[],
  variableListingBody: HTMLElement
) {
  collections.forEach((collection: InqVariableCollection) => {
    const collectionRow = document.createElement('tr');
    const collectionCol = document.createElement('td');

    collectionCol.setAttribute('colspan', '3');
    collectionCol.className = 'collection-row';
    collectionCol.innerText = collection.name;

    collectionRow.appendChild(collectionCol);
    variableListingBody.appendChild(collectionRow);

    renderVariables(collection.variableIds, variables, unusedVars, variableListingBody);
  });
}

function renderVariables(
  variableIds: string[],
  variables: InqNormalisedVariable[],
  unusedVars: InqUnusedVariable[],
  variableListingBody: HTMLElement
) {
  variableIds.forEach((vid: string, idx: number) => {
    const variable = variables.filter((v: InqNormalisedVariable) => v.id === vid)[0];
    if (variable) {
      const variableRow = document.createElement('tr');
      const variableIndexCol = document.createElement('td');
      const variableLabelCol = document.createElement('td');

      variableIndexCol.innerText = `${idx + 1}`;
      variableRow.appendChild(variableIndexCol);

      variableLabelCol.innerText = variable.name;
      variableRow.appendChild(variableLabelCol);

      const variableIsUsedCol = document.createElement('td');
      if (unusedVars) {
        variableIsUsedCol.innerText = unusedVars.some((a: InqUnusedVariable) => a.id === vid)
          ? '—'
          : 'Yes';
      } else {
        variableIsUsedCol.innerText = '—';
      }
      variableRow.appendChild(variableIsUsedCol);

      variableListingBody.appendChild(variableRow);
    }
  });
}
