import LinkList, { LinkListInterface } from "./LinkList";

export interface EntityInterface {
  changed?: string;
  created?: string;
  id: string;
  links: LinkListInterface;
  type: string;
}

export default abstract class Entity implements EntityInterface {
  id: string;

  type: string;

  private _changed?: Date;

  private _created?: Date;

  private _links?: LinkList;

  constructor(incoming: EntityInterface) {
    Object.assign(this, incoming);
  }

  get links(): LinkListInterface | undefined {
    return this._links;
  }

  set links(incoming: LinkListInterface) {
    this._links = new LinkList(incoming);
  }

  get created(): string | undefined {
    return this._created?.toString();
  }

  set created(incoming: string) {
    if (incoming) {
      this._created = new Date(incoming);
    }
  }

  get changed(): string | undefined {
    return this._changed?.toString();
  }

  set changed(incoming: string) {
    if (incoming) {
      this._changed = new Date(incoming);
    }
  }
}
