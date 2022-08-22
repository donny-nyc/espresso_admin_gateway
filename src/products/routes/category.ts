import express, { Request, Response } from 'express';

const router = express.Router();

router.options('/');

type CategoryRecord = {
  _id: string,
  name: string,
  description: string,
  __v: number
};

type CategoryServiceResponse = {
  total: number,
  categories: CategoryRecord[]
};

router.get('/', async (_: Request, res: Response) => {
  await fetch('http://cms_api:3000/api/v1/categories', {
    headers: {
      'Content-type': 'application/json'
    }
  }).then((response: any) => {
    return response.json();
  }).then((record: CategoryServiceResponse) => {
    return res.status(200).json({
      total: record.total,
      categories: record.categories.map((category: CategoryRecord) => {
        return {
          id: category._id,
          name: category.name,
          description: category.description
        };
      })
    });
  }).catch((err: any) => {
    return res.status(500).json({
      message: err.message
    });
  });
});

export { router as categoriesRouter };
