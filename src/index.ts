import express, {Express, Request, Response} from 'express';
import dotenv from "dotenv";
import floorMiddleware from "./middlewares/floor";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// app.use(floorMiddleware)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// let calls = 0;
//
// while (calls < 1) {
//   floorMiddleware()
//   calls++
// }

floorMiddleware()
