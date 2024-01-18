import { InqFigmaData, InqUnusedVariable } from './models.interface';
type IInquisitor = {
  localVariables: Variable[];
  currentSelection: SceneNode[];
  unusedVariables: Variable[];
  executionTimeInMs: number;

  getFigmaData(): InqFigmaData;
};

export class Inquisitor implements IInquisitor {
  localVariables: Variable[];
  currentSelection: SceneNode[];
  unusedVariables: Variable[];
  executionTimeInMs: number;

  constructor(variables: Variable[], selection: SceneNode[]) {
    this.localVariables = variables || [];
    this.unusedVariables = [...this.localVariables];
    const start = Date.now();

    const { result } = this._walkTheNodes(selection || []);
    this.currentSelection = result;

    const end = Date.now();
    this.executionTimeInMs = end - start;
  }

  getFigmaData(): InqFigmaData {
    const unusedVariables: InqUnusedVariable[] = (this.unusedVariables || []).map((v: Variable) => {
      const { id, name, variableCollectionId } = v;
      return { id, name, variableCollectionId };
    });

    return {
      unusedVariables,
      executionTimeInMs: this.executionTimeInMs,
      countOfSelectedNodes: this.currentSelection.length,
    };
  }

  private _walkTheNodes(root: SceneNode[]) {
    const q: SceneNode[] = [...root];
    const result: SceneNode[] = [];

    while (q.length > 0) {
      const node = q.shift();

      if (node === null || node === undefined) continue;

      // character
      this._checkCharacterBinding(node);

      // effects
      this._checkEffectBindings(node);

      // fills
      this._checkFillBindings(node);

      // strokes
      this._checkStrokesBindings(node);

      // reactions
      this._checkReactionsBindings(node);

      result.push(node);

      if ('children' in node) {
        for (let i = 0; i < node.children.length; i++) {
          q.push(node.children[i]);
        }
      }
    }
    return { result };
  }

  private _checkCharacterBinding(node: SceneNode) {
    if (node.boundVariables && node.boundVariables.characters) {
      const id = node.boundVariables.characters.id;
      this.unusedVariables = this.unusedVariables.filter((v: Variable) => v.id !== id);
    }
  }

  private _checkEffectBindings(node: SceneNode) {
    if (node.boundVariables && node.boundVariables.effects) {
      node.boundVariables.effects.forEach((e: VariableAlias) => {
        this.unusedVariables = this.unusedVariables.filter((v: Variable) => v.id !== e.id);
      });
    }
  }

  private _checkFillBindings(node: SceneNode) {
    if (node.boundVariables && node.boundVariables.fills) {
      node.boundVariables.fills.forEach((f: VariableAlias) => {
        this.unusedVariables = this.unusedVariables.filter((v: Variable) => v.id !== f.id);
      });
    }
  }

  private _checkStrokesBindings(node: SceneNode) {
    if (node.boundVariables && node.boundVariables.strokes) {
      node.boundVariables.strokes.forEach((e: VariableAlias) => {
        this.unusedVariables = this.unusedVariables.filter((v: Variable) => v.id != e.id);
      });
    }
  }

  private _checkReactionsBindings(node: SceneNode) {
    if ('reactions' in node) {
      // check for (re)actions
      node.reactions.forEach((r: Reaction) => {
        if (!r.actions) {
          return;
        }

        const filteredActions = r.actions.filter((a: Action) => !!a && a.type === 'SET_VARIABLE');

        filteredActions.forEach((a: Action) => {
          this.unusedVariables = this.unusedVariables.filter(
            (v: Variable) => 'variableId' in a && v.id != a.variableId
          );
        });
      });
    }
  }
}
