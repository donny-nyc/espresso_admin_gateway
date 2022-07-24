import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const router = express.Router();

const jsonParser = bodyParser.json();

router.options('/');

router.get('/', async (req: Request, res: Response) => {
  const pageCount = 1;
  let page = req.query.page || 1;
  let pageSize = req.query.pageSize || 10;

  if(page > pageCount) {
    page = pageCount;
  }

  return res.status(200).json({
    page: page,
    pageCount: pageCount,
    customers: [
      {
        id: 1,
        name: "API Test Customer One"
      },
      {
        id: 2,
        name: "API Test Customer Two"
      }
    ]
  });
});

export { router as customerRouter };

/**
  As an admin, I want to be able to review all our customers, so that I can 
  manage their open orders.

  As an admin, I want to be able to review all our customers, so that I can 
  review their order history.

  As an admin, I want to be able to review customer records, so that I can
  review all automated system messages and send one-off communications

  As an admin, I want to be able to fetch all customer records, so that I can
  manage their contact information
**/
