import express, { Request, Response } from 'express'
import cors from 'cors'
import expressWinston from 'express-winston'
import winston from 'winston'
import { productRouter } from '../../products/routes/product'
import { customerRouter } from '../../customers/routes/customer'
import { orderRouter } from '../../orders/routes/order'

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }))

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}));

// parse json requests
app.use(express.json());

app.use('/available_products', productRouter);
app.use('/active_customers', customerRouter);
app.use('/all_customer_orders', orderRouter);

app.get('/', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).json({ message: "success" });
});

const PORT = 3000;

try {
  app.listen(PORT, () => {
    console.log(`Express listening on ${PORT}`);
  });
} catch (error: any) {
  console.log(`Error: ${error.message}`);
}

module.exports = app;
