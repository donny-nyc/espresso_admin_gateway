import express, { Request, Response } from 'express';
import CreateProductRequest from './types/CreateProduct';

const router = express.Router();

router.options('/');

type ProductResponse = {
  id: string,
  name: string,
  description: string,
  categoryId: number,
  attributes?: [{(key: string): any}],
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
  }).catch((err): any => {
    return res.status(500).json({
      error: JSON.stringify(err)
    });
  });

  res.status(200).json({
    message: JSON.stringify(results)
  });
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
  categoryId: number,
  __v: number,
};

router.get('/', async (req: Request, res: Response) => {
  const categories: Set<number> = new Set<number>() 

  console.log('categories:', req.query.category);
  if(req.query.category && typeof req.query.category === 'string') {
    req.query.category.split(',').map((category: string) => Number(category))
    .forEach((cat: number) => {
      categories.add(cat);
    });
  }

  let products: ProductResponse[] = await fetch('http://cms_api:3000/api/v1/products')
  .then(res => {
    return res.json();
  }).then(res => {
    return res.map((r: ProductServiceResponse) => {
      return {
        id: r._id,
        name: r.name,
        description: r.description,
        categoryId: r.categoryId
      };
    });
  }).catch((err: any) => {
    console.error(err);
  });

  if(categories.size) {
    products = products.filter(prod => {
      return categories.has(prod.categoryId);
    });
  }

  return res.status(200).json({
    categories: [
      {
        id: 1,
        name: "clothing"
      },
      {
        id: 2,
        name: "electronics"
      },
      {
        id: 3,
        name: "food and beverages"
      },
    ],
    products
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

  let product: ProductResponse | void;

  let status: number = 0;
  product = await fetch('http://cms_api:3000/api/v1/products/' + id)
  .then(r => { 
    status = r.status;
    return r.json();
  }).then((r: ProductServiceResponse) => {
    return {
      id: r._id,
      name: r.name,
      description: r.description,
      categoryId: r.categoryId
    };
  }).catch((err: any) => {
    console.error(err);
  });

  switch(status) {
    case 200:
      return res.status(200).json(product)
    case 404:
      return res.status(404).json({
        id,
        message: "Not Found"
      });
    default:
      return res.status(400).send("unable to process request");
  }
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
