import express, { Request, Response } from 'express';

const router = express.Router();

router.options('/');

router.get('/:id', async (req: Request, res: Response) => {
  console.log('product_id:', req.params.id);

  return res.status(200).json({
    product: {
      id: req.params.id,
      category_id: 5,
      name: "Fetch Product",
      description: "Returned by Admin API"
    },
  });
});

type ProductResponse = {
  id: string,
  name: string,
  description: string,
  categoryId: number,
  attributes?: [{(key: string): any}],
};

type ValidationError = {
  field: string,
  message: string
};

router.post('/', async (req: Request, res: Response) => {
  const name: string = req.body.name;
  const categoryId: number = req.body.categoryId;
  const description: string = req.body.description;

  let errors = [] as ValidationError[];

  if(!name) {
    errors.push({field: 'name', message: 'Please give your product a name'});
  }

  if(name.length > 200) {
    errors.push({field: 'name', message: 'Please give your product a shorter name (200 chars max)'});
  }

  if(!categoryId) {
    errors.push({field: 'categoryId', message: 'Please categorize your product'});
  }

  if(categoryId < 0) {
    errors.push({ field: 'categoryId', message: 'Category ID must be positive' });
  }

  if(description && description.length > 2000) {
    errors.push({ field: 'description', message: 'Please give a shorter description (2000 chars max)' });
  }

  if(errors.length) {
    return res.status(400).json({
      errors
    });
  }

  const results = await fetch('http://cms_api:3000/api/v1/products/', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      name,
      categoryId,
      description,
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
