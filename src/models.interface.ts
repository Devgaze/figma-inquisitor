import { EventMessages } from './events.enum';

export type InqVariableCollection = {
  id: string;
  name: string;
  variableIds: string[];
};

export type InqUnusedVariable = {
  id: string;
  name: string;
  variableCollectionId: string;
};

export type InqFigmaData = {
  unusedVariables: InqUnusedVariable[];
  executionTimeInMs: number;
  countOfSelectedNodes: number;
};

export const notificationOptions: NotificationOptions = {
  timeout: 5000,
  error: false,
};

export type InqNormalisedVariable = {
  name: string;
  id: string;
};

export type InqPostMessage = {
  type: EventMessages;
  collections: InqVariableCollection[];
  localVariables: InqNormalisedVariable[];
  unusedVariables: InqUnusedVariable[];
  currentPageTitle: string;
};
