import express, { Request, Response } from 'express';

const router = express.Router();

router.options('/');

router.get('/', async (req: Request, res: Response) => {
  const categories: Set<number> = new Set<number>() 

  console.log('categories:', req.query.category);
  if(req.query.category && typeof req.query.category === 'string') {
    req.query.category.split(',').map((category: string) => Number(category))
    .forEach((cat: number) => {
      categories.add(cat);
    });
  }

  let products = [
    {
      id: 1,
      category_id: 1,
      name: "Product Alpha",
      description: "Alpha"
    },
    {
      id: 2,
      category_id: 2,
      name: "Product Beta",
      description: "Beta"
    }
  ];

  if(categories.size) {
    products = products.filter(prod => {
      return categories.has(prod.id);
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
