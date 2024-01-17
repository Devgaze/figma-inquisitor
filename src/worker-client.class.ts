export class WorkerClient {
  worker: Worker;

  constructor(placeholdersTextContent: string | null) {
    if (placeholdersTextContent === null) {
      throw new Error("To invoke worker script placeholder's text content must be provided");
    }

    const blob = new Blob([placeholdersTextContent]);
    this.worker = new Worker(window.URL.createObjectURL(blob));
    this.worker.addEventListener('message', this.onMessage.bind(this));
  }

  onMessage(event: any): void {
    parent.postMessage({
      type: 'processData',
      selection: event.data.selection,
      variables: event.data.localVariables,
    });
  }
}
