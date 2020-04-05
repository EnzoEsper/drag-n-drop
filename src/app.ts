/////////////////////////////////
// PROJECT STATE MANAGEMENT CLASS
/////////////////////////////////
class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {

  }

  // metodo que permite obtener solo una instancia de la clase
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

  // metodo para agregar un nuevo proyecto al array
  addProject(title:string, description:string, numOfPeople:number) {
    const newProject = {
      id: Math.random().toString(),
      title: title,
      description: description,
      people: numOfPeople
    };
    this.projects.push(newProject);
    // cada vez que se agrega un nuevo proyecto, se disparan todos los listeners almacenados
    // con una copia del estado global de la app (en este caso el array de proyectos)
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

// se instancia el objeto que va a manejar el estado de la app
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

/////////////////////
// PROJECT LIST CLASS
////////////////////
class ProjectList {
  // elemento que se va a renderear dentro del elemento host
  templateElement: HTMLTemplateElement;
  element: HTMLElement;
  hostElement: HTMLDivElement;

  assignedProjects: any[];
  
  constructor(private type: 'active' | 'finished') {
    // se obtienen el elemento template del dom (por su id) 
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
     // se obtiene el div (con el id "app") para luego renderear el template dentro del mismo
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // se inicializa el array de proyectos asignados
    this.assignedProjects = [];

    // crea una copia del nodo para luego ser insertado dentro del host (div)
    const importedNode = document.importNode(this.templateElement.content, true);
    // en este caso primer elemento dentro del template es un section, se lo obtiene, castea y asigna un id para
    // luego poder seleccionarlo (se lo castea como elelemento html por no haber un tipo mas especifico para ese tag)
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    // # se agreaga un listener a la clase que que maneja el estado global
    // # esta funcion no se va a ejecutar inmediatamente, sino cada vez que se agregue un nuevo proyecto
    // a la clase ProjectState (se recorre el array de listeners almacenados y se ejecutan todos con el 
    // estado global de la app (copia del array de projectos))
    // # en este caso cada vez que se agregue un nuevo proyecto, se va a sobreescribir el array de assignedProjects
    // con la copia del array de todos los proyectos del state y se van a renderear
    // # la variable this ya esta ligada a esta clase por la arrow function
    projectSate.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      // se renderean cada uno de los proyectos pasados como parametros
      this.renderProjects();
    })

    // se agrega el section dentro del div (con id "app")
    this.attach();
    // agrega un id al ul y un texto al h2 que estan dentro del section obtenido
    this.renderContent();
  }

  // renderea los proyectos
  private renderProjects() {
    // como esto se ejecuta cada vez que se agrega un proyecto al state, se puede obtener el ul al que
    // se le agrego el id anteriormente
    const listEl = document.getElementById(`${this.type}-projects-lists`)! as HTMLUListElement;
    // por cada proyecto en el array assignedProjects se crea un li con el titulo de cada uno y se lo agrega
    // al ul targeteado por el id
    for (const projItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = projItem.title;
      listEl.appendChild(listItem); 
    }
  }

  // agrega un id al ul y un texto al h2 que estan dentro del section obtenido 
  private renderContent() {
    const listId = `${this.type}-projects-lists`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + 'PROJECTS';
  }

  // agrega el elemento seleccionado dentro del host
  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

///////////////////////
// PROJECT INPUT CLASS
//////////////////////
class ProjectInput {
  // template que se va a renderear dentro del elemento host (div)
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  // el host element es el div que tiene el id "app"
  hostElement: HTMLDivElement;
  
  // inputs del form
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // se obtienen el elemento template del dom (por su id)
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    // se obtiene el div (con el id "app") para luego renderear el template dentro del mismo
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // crea una copia del nodo (template) para luego ser insertado dentro del host (div)
    const importedNode = document.importNode(this.templateElement.content, true);
    // como el primer elemento dentro del template es un form, se lo obtiene, castea y asigna un id para
    // luego poder seleccionarlo
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    // se obtienen los valores de los inputs dentro del form 
    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    // agrega el event listener (submit) al form
    this.configure();
    // agrega el el elemento seleccionado (template) dentro del host (div)
    this.attach();
  }

  // obtiene los valores de los inputs y los valida segun la interface Validatable definida
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

  // limpia los inputs
  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  // handler para el evento submit del form
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    // obtiene los valores de los inputs y los valida 
    const userInput = this.gatherUserInput();
    // user Input en Ts es una tupla, pero como en js no existen termina siendo un array
    // si es un array quiere decir que la validacion fue exitosa
    if (Array.isArray(userInput)) {
      // se almacenan las variables de la tupla
      const [title, desc, people] = userInput;
      // se crea un nuevo projecto en la clase (singleton) que maneja el "estado global" de la app 
      projectSate.addProject(title, desc, people);

      // se limpia el contenido de los inputs
      this.clearInputs();
    }
  }

  // agrega el event listener al form
  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  // agrega el elemento seleccionado dentro del host
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const projInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');