import { InqUnusedVariable, InqVariableCollection } from './models.interface';
import './styles.scss';
import { EventMessages } from './value.const';
(function () {
  // DOM elements
  const infoPanel = document.getElementById('info-panel');
  const filter = document.getElementById('filter');
  const variableListingBody = document.getElementsByTagName('tbody')[0];
  const variableListingFooter = document.getElementsByTagName('tfoot')[0];

  let selectedCollection: string | undefined;
  let unusedVariables: InqUnusedVariable[];
  let localVariables: Variable[];
  let collections: VariableCollection[];
  let currentPageTitle: string;
  let executionTimeInMs: number;
  let countOfSelectedNodes: number;
  let filterEventListener = undefined;

  // flags
  let showInfoPanel = true;

  onmessage = (event) => {
    const data = event.data.pluginMessage;
    const messageType: EventMessages = data.type;

    if (messageType === EventMessages.FIGMA_DATA_READY) {
      // const { localVariables, collections, unusedVariablesInfo, currentPageTitle } = data;
      // const { unusedVariables, executionTimeInMs, countOfSelectedNodes } = unusedVariablesInfo;
      localVariables = data.localVariables;
      collections = data.collections;
      currentPageTitle = data.currentPageTitle;
      unusedVariables = data.unusedVariablesInfo.unusedVariables;
      executionTimeInMs = data.unusedVariablesInfo.executionTimeInMs;
      countOfSelectedNodes = data.unusedVariablesInfo.countOfSelectedNodes;

      // render info panel
      if (infoPanel) {
        if (showInfoPanel) {
          renderSelectionInformation(executionTimeInMs, countOfSelectedNodes, infoPanel);
          infoPanel.style.display = 'block';
        } else {
          infoPanel.style.display = 'block';
        }
      }

      // render filter control
      if (filter && variableListingFooter) {
        filterEventListener = filter.addEventListener('change', (e: any) =>
          renderResults(
            unusedVariables,
            localVariables,
            collections,
            variableListingBody,
            variableListingFooter,
            e.target.value
          )
        );
        selectedCollection = renderFilterControl(collections, currentPageTitle, filter);
      }

      // render results
      if (variableListingBody && variableListingFooter) {
        renderResults(
          unusedVariables,
          localVariables,
          collections,
          variableListingBody,
          variableListingFooter,
          selectedCollection ? selectedCollection : ''
        );
      }

      return;
    }
  };
})();

function renderSelectionInformation(
  executionTimeInMs: number,
  countOfSelectedNodes: number,
  parentElement: HTMLElement
) {
  const seconds = executionTimeInMs / 1000;
  const nodeCount = new Intl.NumberFormat('en-uk', { maximumSignificantDigits: 3 }).format(
    countOfSelectedNodes
  );
  const messageElement = document.createElement('p');
  messageElement.innerText = `Processed ${nodeCount} elements in ${seconds} seconds.`;

  parentElement.innerHTML = '';
  parentElement.appendChild(messageElement);
}

function renderFilterControl(
  collections: VariableCollection[],
  currentPageTitle: string,
  parentElement: HTMLElement
): string | undefined {
  let selectedId: string = '';
  parentElement.innerHTML = '';

  const emptyOption = document.createElement('option');
  emptyOption.innerText = '--';
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
  vars: Variable[],
  collections: InqVariableCollection[],
  tbodyEl: HTMLElement,
  tfootEl: HTMLElement,
  collectionId: string
) {
  let col = [...collections];

  tbodyEl.innerHTML = '';

  let c = collectionId
    ? [...collections].filter((collection) => collection.id === collectionId)
    : [...collections];

  renderCollections(c, vars, unused, tbodyEl);
}

function renderCollections(
  collections: InqVariableCollection[],
  variables: Variable[],
  unusedVars: InqUnusedVariable[],
  tbodyEl: HTMLElement
) {
  collections.forEach((collection: InqVariableCollection) => {
    // const collectionRow = document.createElement('tr');
    // const collectionCol = document.createElement('td');

    // collectionCol.setAttribute('colspan', '2');
    // collectionCol.className = 'collection-row';
    // collectionCol.innerText = collection.name;

    // collectionRow.appendChild(collectionCol);
    // tbodyEl.appendChild(collectionRow);

    renderVariables(collection.variableIds, variables, unusedVars, tbodyEl);
  });
}

function renderVariables(
  variableIds: string[],
  variables: Variable[],
  unusedVars: InqUnusedVariable[],
  tbodyEl: HTMLElement
) {
  variableIds.forEach((vid: string, idx: number) => {
    const variable = variables.filter((v: any) => v.id === vid)[0];
    if (variable) {
      const variableRow = document.createElement('tr');
      const variableIndexCol = document.createElement('td');
      const variableLabelCol = document.createElement('td');

      variableIndexCol.innerText = `${idx + 1}`;
      variableRow.appendChild(variableIndexCol);

      variableLabelCol.innerText = variable.name;
      variableRow.appendChild(variableLabelCol);

      const variableIsUsedCol = document.createElement('td');
      variableIsUsedCol.innerText = unusedVars.some((a, i) => a.id === vid) ? '—' : 'Yes';
      variableRow.appendChild(variableIsUsedCol);

      tbodyEl.appendChild(variableRow);
    }
  });
}
