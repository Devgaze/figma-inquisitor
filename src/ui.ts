import './styles.scss';
import { EventMessages } from './value.const';
(function () {
  // DOM elements
  const wrapper = document.getElementById('inquisitor-wrapper');
  const infoPanel = document.getElementById('info-panel');
  const infoPanelBody = document.getElementById('info-panel-body');

  // flags
  let showInfoPanel = true;

  onmessage = (event) => {
    const messageType: EventMessages = event.data.pluginMessage.type;

    if (messageType === EventMessages.FIGMA_DATA_READY) {
      const { localVariables, collections, selection, unusedVariablesInfo } =
        event.data.pluginMessage;
      const { unusedVariables, executionTimeInMs, countOfSelectedNodes } = unusedVariablesInfo;

      // render info panel
      if (infoPanel && infoPanelBody) {
        if (showInfoPanel) {
          renderSelectionInformation(executionTimeInMs, countOfSelectedNodes, infoPanelBody);
          infoPanel.style.display = 'block';
        } else {
          infoPanel.style.display = 'block';
        }
      }

      return;
    }
  };
})();

function renderSelectionInformation(
  executionTimeInMs: number,
  countOfSelectedNodes: number,
  parentElement: HTMLElement | null
) {
  if (!parentElement) {
    console.error('Cannot render info panel if parent element is not referenced');
    return;
  }

  const seconds = executionTimeInMs / 1000;
  const messageElement = document.createElement('p');
  messageElement.innerText = `Processed ${countOfSelectedNodes} elements in ${seconds} seconds.`;

  parentElement.innerHTML = '';
  parentElement.appendChild(messageElement);
}
