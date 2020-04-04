// Code goes here!
class ProjectInput {
  // elemento que se va a renderear dentro del elemento host
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  hostElement: HTMLDivElement;

  constructor() {
    // cuando se obtienen los elementos del dom (por su id) no van a ser null y se los castea al tipo correspondiente
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // crea una copia del nodo para luego ser insertado dentro del host (div)
    const importedNode = document.importNode(this.templateElement.content, true);
    // como el primer elemento siguiente del template es un form, se lo obtiene y se castea
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const projInput = new ProjectInput();