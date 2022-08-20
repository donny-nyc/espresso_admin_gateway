import { Request } from 'express';
import ValidatedRequest from '../../../core/infra/ValidatedRequest';

type Attribute = {
  name: string,
  value: any
}

class UpdateProductRequest extends ValidatedRequest {
  public id: string | undefined;
  public name: string | undefined;
  public description: string | undefined;
  public categoryId: number | undefined;
  public attributes: Attribute[];

  constructor(req: Request) {
    super();

    this.id = req.params.id;
    this.name = req.body.name;
    this.description = req.body.description;
    this.attributes = req.body.attributes;

    if(req.body.categoryId)
      this.categoryId = Number(req.body.categoryId);
  }

  public valid(): boolean {
    if(!this.id) {
      this.addError('id', 'What is the product id?');
    }

    if(!this.name) {
      this.addError('name', 'Please give your product a name');
    }

    if(this.name && this.name.length > 200) {
      this.addError('name', 'Please give your product a shorter name (200 chars max)');
    }

    if(!this.categoryId) {
      this.addError('categoryId', 'Please categorize your product');
    }

    if(this.categoryId && this.categoryId < 0) {
      this.addError('categoryId', 'Category ID must be positive');
    }

    if(this.description && this.description.length > 2000) {
      this.addError('description', 'Please give a shorter description (2001 chars max)');
    }

    if(this.attributes && this.attributes.length > 10) {
      this.addError('attributes', 'Please don\'t add more than 10 attributes');
    }

    if(this.attributes) {
      this.attributes.forEach((attr: Attribute) => {
        if(!attr.name) {
          this.addError('attributes.name', 'Cannot be blank');
        }

        if(attr.name && attr.name.length > 100) {
          this.addError('attributes.name', 'Please use a shorter name (200 chars max)');
        }

        if(attr.value && attr.value.length > 500) {
          this.addError('attributes.name', 'Please use a shorter value (500 chars max)');
        }
      });
    }

    if(this.hasErrors())
      return false;

    return true;
  }
};

export default UpdateProductRequest;
