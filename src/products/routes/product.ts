import express, { Request, Response } from 'express';
import { CreateProductRequest, UpdateProductRequest } from './types';

const router = express.Router();

router.options('/');

type ProductCategory = {
  id: string,
  name: string,
  description: string
};

type CategoryResponse = {
  total: number,
  resources: ProductCategory[]
};

type ProductResponse = {
  total: number,
  resources: Product[]
};

type Product = {
  id: string,
  name: string,
  description: string,
  categoryId: string,
  attributes?: {name: string, value: any}[],
};

type ProductCategoryResponse = {
  categories: CategoryResponse,
  products: ProductResponse
};

type CategoryServiceResponse = {
  _id: string,
  name: string,
  description: string,
  __v: number,
};
router.post('/', async (req: Request, res: Response) => {
  const createRequest: CreateProductRequest = new CreateProductRequest(req);

  if(!createRequest.valid()) {
    return res.status(400).json({
      errors: createRequest.errors()
    });
  }

  const results = await fetch('http://cms_api:3000/api/v1/products/', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      name: createRequest.name,
      categoryId: createRequest.categoryId,
      description: createRequest.description,
      attributes: createRequest.attributes
    })
  }).catch((err: any) => {
    return res.status(500).json({
      error: JSON.stringify(err)
    });
  });

  res.status(200).json({
    message: JSON.stringify(results)
  });
});

router.put('/:id', async (req: Request, res: Response) => {
  const updateRequest: UpdateProductRequest = new UpdateProductRequest(req);

  if(!updateRequest.valid()) {
    return res.status(400).json({
      errors: updateRequest.errors()
    });
  }

  const results = await fetch(`http://cms_api:3000/api/v1/products/${updateRequest.id}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      name: updateRequest.name,
      categoryId: updateRequest.categoryId,
      description: updateRequest.description,
      attributes: updateRequest.attributes
    })
  }).catch((err: any) => {
    return res.status(500).json({
      error: JSON.stringify(err)
    });
  });

  try {
    res.status(200).json({
      message: JSON.stringify(results)
    });
  } catch(err: any) {
    res.status(500).send({
      error: err,
    });
  }
});

router.delete('/all', async (_: Request, res: Response) => {
  const results = await fetch('http://cms_api:3000/api/v1/products/remove_all', { method: 'DELETE' });

  res.status(200).json({
    message: results
  });
});

router.delete('/:ids', async (req: Request, res: Response) => {
  const productIds: Set<string> = new Set<string>();

  if(req.params.ids && typeof req.params.ids !== 'string') {
    res.status(400).json({
      error: 'Product IDs must be strings'
    });
  };

  req.params.ids.split(',').forEach((id: string) => {
    productIds.add(id);
  });

  if(productIds.size > 5) {
    res.status(400).json({
      error: 'You can delete up to 5 entries per-request'
    });
  }

  const results = await fetch('http://cms_api:3000/api/v1/products/' + [...productIds].join(','), { method: 'DELETE' })

  res.status(200).json({
    results
  });
});

type ProductServiceResponse = {
  _id: string,
  name: string,
  description: string,
  attributes: {name: string, value: string}[],
  categoryId: string,
  __v: number,
};

router.get('/', async (req: Request, res: Response) => {
  const page: number = Number(req.query.page) || 0;
  const pageSize: number = Number(req.query.size) || 10;

  if(page < 0 || pageSize < 0) {
    return res.status(400).json({
      error: 'Offset must not be negative'
    });
  }

  const categories: Set<string> = new Set<string>() 

  console.log('categories:', req.query.category);
  if(req.query.category && typeof req.query.category === 'string') {
    req.query.category.split(',').map((category: string) => {
      categories.add(category);
    });
  }

  const response: ProductResponse = await fetch(`http://cms_api:3000/api/v1/products?page=${page}&size=${pageSize}`)
  .then(res => {
    return res.json();
  }).then((res: {total: number, products: ProductServiceResponse[]}) => {
    return {
      total: res.total,
      resources: res.products.map((r: ProductServiceResponse) => {
        return {
          id: r._id,
          name: r.name,
          description: r.description,
          categoryId: r.categoryId
        };
      })
    };
  }).catch((err: any) => {
    console.error(err);
    return {
      total: 0,
      resources: []
    };
  });

  const availableCategoryIds = new Set(response.resources.map((product: Product) => {
    return product.categoryId;
  }));

  const availableCategories: CategoryResponse = await fetch(`http://cms_api:3000/api/v1/categories?ids=${Array.from(availableCategoryIds).join(',')}`)
  .then(res => {
    return res.json();
  }).then((res: {total: number, categories: CategoryServiceResponse[]}) => {
    return {
      total: res.total,
      resources: res.categories.map((category: CategoryServiceResponse) => {
        return {
          id: category._id,
          name: category.name,
          description: category.description
        };
      })
    };
  }).catch((err: any) => {
    console.warn(err);
    return {
      total: 0,
      resources: []
    };
  });

  // let products: Product[] = []
  if(categories.size) {
    response.resources = response.resources.filter(prod => {
      return categories.has(prod.categoryId);
    });
  }

  return res.status(200).json({
    categories: availableCategories,
    products: response,
  });
});

router.get('/:id', async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const idNumber: number = Number(id);

  if(idNumber < 0) {
    return res.status(400).json({
      error: 'ID must not be negative'
    });
  }

  if(idNumber === 0) {
    return res.status(400).json({
      error: 'ID must not be zero'
    });
  }

  if(!isNaN(idNumber) && idNumber % 1 !== 0) {
    return res.status(400).json({
      error: 'ID must not be a decimal value'
    });
  }

  if(id.length < 24) {
    return res.status(404).json({
      id,
      message: "Not found"
    });
  }

  const availableCategories: CategoryResponse = await fetch('http://cms_api:3000/api/v1/categories')
  .then(res => {
    return res.json();
  }).then((res: {total: number, categories: CategoryServiceResponse[]}) => {
    return {
      total: res.total,
      resources: res.categories.map((category: CategoryServiceResponse) => {
        return {
          id: category._id,
          name: category.name,
          description: category.description
        };
      })
    };
  }).catch((err: any) => {
    console.warn(err);
    return {
      total: 0,
      resources: []
    };
  });

  await fetch('http://cms_api:3000/api/v1/products/' + id)
  .then(r => { 
    switch(r.status) {
      case 200:
        return r.json();
      case 404:
        return res.status(404).json({
          message: `${id} not found`
        });
      default:
        return res.status(400).send("unable to process request");
    }
  }).then((r: ProductServiceResponse) => {
    console.log('response:', r);
    const response: ProductCategoryResponse = {
      categories: availableCategories,
      products: {
        total: 1,
        resources: [
          {
            id: r._id,
            name: r.name,
            description: r.description,
            attributes: r.attributes,
            categoryId: r.categoryId
          }
        ]
      }
    };

    return res.status(200).json(response);
  }).catch((err: any) => {
    console.error(err);
    return res.status(500).send(err.message);
  });
});

export { router as productRouter };

/**
  As an admin, I want to be able to see my available inventory across my
  active locations, so that I can confirm my assets.

  As an admin, I want to see my available inventory at one or more specific locations
  so that I can focus my review.

  As an admin, I want to be able to search for specific products across one or more
  of my active locations, so that I can optimize sourcing.

  As an admin, I want to be able to create an order from one or more available
  products, so that I can manually prepare and process a sale on someones behalf.

  As an admin, I want to be able to see my low / empty inventory, so that I can
  effectively schedule / automate restocking
**/
