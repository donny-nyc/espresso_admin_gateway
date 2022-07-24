import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const router = express.Router();

const jsonParser = bodyParser.json();

router.options('/');

router.get('/', async ( req: Request, res: Response) => {
  return res.status(200).json({
    page: 1,
    pageCount: 1,
    customerOrders: [
      {
        id: 1,
        order_status: 'pending',
        customer: {
          id: 1,
          name: 'jane doe'
        },
        created_on: '2022-07-10',
        due_by: '2022-08-01',
        tracking_number: 123456789,
        total_amount: 4321
      },
    ]
  });
});

export { router as orderRouter };
