// PROJECT STATE MANAGEMENT CLASS
class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {

  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    };

    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addProject(title:string, description:string, numOfPeople:number) {
    const newProject = {
      id: Math.random().toString(),
      title: title,
      description: description,
      people: numOfPeople
    };
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectSate = ProjectState.getInstance();

// validation logic for the inputs
interface Validatable {
  value: string | number;
  required?: boolean;
  // check the lenghts of the strings
  minLength?: number;
  maxLength?: number;
  // check the values of the numbers
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
    isValid = isValid && validatableInput.value.length > validatableInput.minLength;
  }

  if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
    isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
  }

  if (validatableInput.min != null && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value > validatableInput.min;
  }

  if (validatableInput.max != null && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value < validatableInput.max;
  }

  return isValid;
}

// autobind decorator
function autobind(_:any, _2:string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjustedDescriptor;
}

// PROJECT LIST CLASS
class ProjectList {
  // elemento que se va a renderear dentro del elemento host
  templateElement: HTMLTemplateElement;
  element: HTMLElement;
  hostElement: HTMLDivElement;

  assignedProjects: any[];
  
  constructor(private type: 'active' | 'finished') {
    // cuando se obtienen los elementos del dom (por su id) no van a ser null y se los castea al tipo correspondiente
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    this.assignedProjects = [];

    // crea una copia del nodo para luego ser insertado dentro del host (div)
    const importedNode = document.importNode(this.templateElement.content, true);
    // como el primer elemento siguiente del template es un form, se lo obtiene y se castea
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectSate.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    })

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-lists`)! as HTMLUListElement;
    for (const projItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = projItem.title;
      listEl.appendChild(listItem); 
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-lists`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + 'PROJECTS';
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}


//ProjectInput class
class ProjectInput {
  // elemento que se va a renderear dentro del elemento host
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  hostElement: HTMLDivElement;
  
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // cuando se obtienen los elementos del dom (por su id) no van a ser null y se los castea al tipo correspondiente
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // crea una copia del nodo para luego ser insertado dentro del host (div)
    const importedNode = document.importNode(this.templateElement.content, true);
    // como el primer elemento siguiente del template es un form, se lo obtiene y se castea
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    // se obtienen los valores de los inputs dentro del form que se copio anteriormente
    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;


    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    };

    if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
      alert(`Invalid input, please try again`);
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectSate.addProject(title, desc, people);

      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const projInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');